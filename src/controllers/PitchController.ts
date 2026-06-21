import SignalsmithStretch, { StretchNode } from "signalsmith-stretch";
import { SignalsmithStretchConfigurator } from "./SignalsmithStretchConfigurator";

const ELEM_SELECTOR = "video,audio";

// Marks AudioNodes the patched `connect` must ignore (our own stretch nodes),
// so rerouting never feeds a stretch node back into itself.
interface MarkedNode extends AudioNode {
    __spcStretch?: boolean;
}

/**
 * A recorded connection from some node to its context's `destination`.
 * `wet` tracks whether it is currently routed through the stretch node.
 */
interface DestConnection {
    node: AudioNode;
    ctx: AudioContext;
    dest: AudioNode;
    wet: boolean;
}

/**
 * Runs in the MAIN world. Instead of creating a competing AudioContext and
 * calling `createMediaElementSource` (which throws when the site already did,
 * and steals the element's audio when it wins), it patches the page's own
 * `AudioContext`/`AudioNode` graph:
 *
 *  - every connection to `ctx.destination` is intercepted and, when pitch is
 *    engaged, rerouted as `node -> stretchNode -> destination` (one stretch
 *    node per AudioContext). This covers `createMediaElementSource`,
 *    `createBufferSource` (e.g. Spotify) and arbitrary graphs.
 *  - plain `<audio>`/`<video>` elements the site never routes through Web Audio
 *    are handled by a fallback context that feeds the same interception path.
 */
export class PitchController {
    private globalSemitones: number = 0;
    private isEnabled: boolean = true;

    private SignalsmithStretch: typeof SignalsmithStretch | null = null;
    private stretchModulePromise: Promise<void> | null = null;

    // One AudioContext shared by every plain element we have to source ourselves.
    private fallbackContext: AudioContext | null = null;

    // Media elements discovered in the DOM (whether or not we route them).
    private knownElements: Set<HTMLMediaElement> = new Set();

    // Every element that has a MediaElementAudioSourceNode (page-created or ours).
    private sourcedElements: WeakMap<
        HTMLMediaElement,
        { sourceNode: MediaElementAudioSourceNode; ctx: BaseAudioContext }
    > = new WeakMap();

    // Active connections to a context's destination, and a per-node index of
    // them so the patched `disconnect` can prune stale records.
    private destConnections: Set<DestConnection> = new Set();
    private nodeToConns: WeakMap<AudioNode, Set<DestConnection>> = new WeakMap();

    // Lazily-created stretch node per context (promise during load, resolved
    // node afterwards for the synchronous un-route path).
    private stretchByCtx: WeakMap<BaseAudioContext, Promise<StretchNode>> =
        new WeakMap();
    private stretchByCtxNode: WeakMap<BaseAudioContext, StretchNode> =
        new WeakMap();
    private stretchNodes: Set<StretchNode> = new Set();

    private static patched = false;
    private static origConnect: (
        this: AudioNode,
        ...args: unknown[]
    ) => AudioNode;
    private static origDisconnect: (
        this: AudioNode,
        ...args: unknown[]
    ) => void;

    constructor() {
        this.installPatches();
    }

    /** Pitch is "engaged" only when enabled and actually shifting. */
    private get engaged(): boolean {
        return this.isEnabled && this.globalSemitones !== 0;
    }

    /**
     * Initialize DOM discovery. Patches are already installed by the
     * constructor (must happen at document_start, before the page builds its
     * audio graph).
     */
    init(): void {
        if (!document) return;
        new MutationObserver(() => this.discoverElements()).observe(document, {
            childList: true,
            subtree: true,
        });
        this.discoverElements();
    }

    private discoverElements(): void {
        document
            .querySelectorAll<HTMLMediaElement>(ELEM_SELECTOR)
            .forEach((el) => this.knownElements.add(el));
        if (this.engaged) this.attachPlainElements();
    }

    // -- Patching ----------------------------------------------------------

    private installPatches(): void {
        if (PitchController.patched) return;
        PitchController.patched = true;

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const controller = this;
        const origConnect = AudioNode.prototype.connect as unknown as (
            this: AudioNode,
            ...args: unknown[]
        ) => AudioNode;
        const origDisconnect = AudioNode.prototype.disconnect as unknown as (
            this: AudioNode,
            ...args: unknown[]
        ) => void;
        PitchController.origConnect = origConnect;
        PitchController.origDisconnect = origDisconnect;

        // Intercept connections to the destination so we can splice in the
        // stretch node. The direct (dry) connection is always made first;
        // `reconcile` then swaps to `node -> stretch -> destination` when pitch
        // is engaged. Doing it in that order means a failed worklet load
        // degrades to unprocessed audio rather than silence.
        AudioNode.prototype.connect = function (
            this: AudioNode,
            ...args: unknown[]
        ) {
            const dest = args[0];
            let reroutable = false;
            try {
                reroutable =
                    !(this as MarkedNode).__spcStretch &&
                    dest instanceof AudioNode &&
                    dest === this.context.destination;
            } catch {
                reroutable = false;
            }

            const result = origConnect.apply(this, args);

            if (reroutable) {
                controller.trackDestConnection(
                    this,
                    this.context as AudioContext,
                    dest as AudioNode
                );
            }

            return result;
        } as typeof AudioNode.prototype.connect;

        // When the page disconnects a node, drop our records so a later
        // (re)engage doesn't resurrect audio the site meant to stop.
        AudioNode.prototype.disconnect = function (
            this: AudioNode,
            ...args: unknown[]
        ) {
            try {
                controller.untrackNode(this);
            } catch {
                /* ignore */
            }
            return origDisconnect.apply(this, args);
        } as typeof AudioNode.prototype.disconnect;

        // Track element sources so the fallback never double-sources an element
        // the page already owns (a second createMediaElementSource throws).
        const origCreateMES = AudioContext.prototype.createMediaElementSource;
        if (origCreateMES) {
            AudioContext.prototype.createMediaElementSource = function (
                this: AudioContext,
                element: HTMLMediaElement
            ) {
                const existing = controller.sourcedElements.get(element);
                if (existing) return existing.sourceNode;
                const node = origCreateMES.call(this, element);
                controller.sourcedElements.set(element, {
                    sourceNode: node,
                    ctx: this,
                });
                return node;
            };
        }
    }

    private trackDestConnection(
        node: AudioNode,
        ctx: AudioContext,
        dest: AudioNode
    ): void {
        const existing = this.nodeToConns.get(node);
        if (existing) {
            for (const conn of existing) {
                if (conn.dest === dest) {
                    this.reconcile(conn);
                    return;
                }
            }
        }

        const conn: DestConnection = { node, ctx, dest, wet: false };
        this.destConnections.add(conn);
        let set = this.nodeToConns.get(node);
        if (!set) {
            set = new Set();
            this.nodeToConns.set(node, set);
        }
        set.add(conn);

        // Transient sources (e.g. Spotify's per-note buffer sources) clean
        // themselves up so our records don't leak.
        if (node instanceof AudioScheduledSourceNode) {
            node.addEventListener("ended", () => this.untrackNode(node), {
                once: true,
            });
        }

        this.reconcile(conn);
    }

    private untrackNode(node: AudioNode): void {
        const set = this.nodeToConns.get(node);
        if (!set) return;
        for (const conn of set) this.destConnections.delete(conn);
        this.nodeToConns.delete(node);
    }

    /** Route a recorded connection wet/dry to match the current engaged state. */
    private reconcile(conn: DestConnection): void {
        const origConnect = PitchController.origConnect;
        const origDisconnect = PitchController.origDisconnect;

        if (this.engaged && !conn.wet) {
            conn.wet = true; // optimistic, prevents duplicate rerouting
            this.ensureStretchForContext(conn.ctx)
                .then((stretch) => {
                    try {
                        origConnect.call(conn.node, stretch);
                    } catch {
                        conn.wet = false;
                        return;
                    }
                    // Remove the dry path now that the wet one is live.
                    try {
                        origDisconnect.call(conn.node, conn.dest);
                    } catch {
                        /* already disconnected */
                    }
                })
                .catch(() => {
                    conn.wet = false;
                });
        } else if (!this.engaged && conn.wet) {
            conn.wet = false;
            const stretch = this.stretchByCtxNode.get(conn.ctx);
            try {
                origConnect.call(conn.node, conn.dest);
            } catch {
                /* ignore */
            }
            if (stretch) {
                try {
                    origDisconnect.call(conn.node, stretch);
                } catch {
                    /* ignore */
                }
            }
        }
    }

    private ensureStretchForContext(ctx: AudioContext): Promise<StretchNode> {
        const cached = this.stretchByCtx.get(ctx);
        if (cached) return cached;

        const promise = (async () => {
            if (!this.SignalsmithStretch) await this.loadStretchModule();
            if (!this.SignalsmithStretch) {
                throw new Error("SignalsmithStretch module unavailable");
            }

            if (ctx.state === "suspended") {
                try {
                    await ctx.resume();
                } catch {
                    /* best effort */
                }
            }

            const node = await this.SignalsmithStretch(ctx, {
                numberOfInputs: 1,
                numberOfOutputs: 1,
                outputChannelCount: [2],
            });
            (node as MarkedNode).__spcStretch = true;
            PitchController.origConnect.call(node, ctx.destination);
            await node.schedule({
                active: true,
                semitones: this.globalSemitones,
            });

            this.stretchNodes.add(node);
            this.stretchByCtxNode.set(ctx, node);
            return node;
        })();

        this.stretchByCtx.set(ctx, promise);
        promise.catch(() => this.stretchByCtx.delete(ctx));
        return promise;
    }

    /**
     * Source plain `<audio>`/`<video>` elements the site never routed through
     * Web Audio, feeding them into the same interception path. Lazy: only runs
     * once pitch is engaged, by which point the page has normally already built
     * its own graph (so we skip those elements).
     */
    private attachPlainElements(): void {
        if (!this.fallbackContext) {
            try {
                this.fallbackContext = new AudioContext();
            } catch {
                return;
            }
        }
        const ctx = this.fallbackContext;

        this.knownElements.forEach((el) => {
            if (this.sourcedElements.has(el)) return;
            if (!el.isConnected) return;
            try {
                // Patched createMediaElementSource records the source; patched
                // connect tracks the destination link and routes it wet.
                const source = ctx.createMediaElementSource(el);
                source.connect(ctx.destination);
            } catch {
                // Element is already bound to another source node we did not
                // observe; nothing we can do without breaking the page.
            }
        });
    }

    private async loadStretchModule(): Promise<void> {
        if (this.SignalsmithStretch) return;
        if (!this.stretchModulePromise) {
            this.stretchModulePromise = (async () => {
                try {
                    this.SignalsmithStretch =
                        await SignalsmithStretchConfigurator.create();
                } catch (error) {
                    console.error(
                        "[PitchController] Failed to load SignalsmithStretch module, pitch shifting unavailable:",
                        error
                    );
                    this.SignalsmithStretch = null;
                }
            })();
        }
        await this.stretchModulePromise;
    }

    // -- Public API --------------------------------------------------------

    /**
     * Set the pitch shift in semitones for every routed element.
     * @param semitones - positive raises pitch, negative lowers it.
     */
    async setPitch(semitones: number): Promise<void> {
        const wasEngaged = this.engaged;
        this.globalSemitones = semitones;

        if (this.engaged) this.attachPlainElements();

        const promises: Promise<void>[] = [];
        this.stretchNodes.forEach((node) =>
            promises.push(node.schedule({ semitones }))
        );
        await Promise.all(promises);

        if (this.engaged !== wasEngaged) {
            this.destConnections.forEach((conn) => this.reconcile(conn));
        }

        console.log("[PitchController] Set pitch to", semitones, "semitones");
    }

    /** Current pitch shift in semitones (0 by default). */
    getPitch(): number {
        return this.globalSemitones;
    }

    async pitchUp(amount: number = 1): Promise<void> {
        await this.setPitch(this.globalSemitones + amount);
    }

    async pitchDown(amount: number = 1): Promise<void> {
        await this.setPitch(this.globalSemitones - amount);
    }

    async resetPitch(): Promise<void> {
        await this.setPitch(0);
    }

    /** Enable or disable pitch processing without losing the current value. */
    async setEnabled(enabled: boolean): Promise<void> {
        const wasEngaged = this.engaged;
        this.isEnabled = enabled;

        if (this.engaged) this.attachPlainElements();
        if (this.engaged !== wasEngaged) {
            this.destConnections.forEach((conn) => this.reconcile(conn));
        }

        console.log("[PitchController] Enabled:", enabled);
    }

    isActive(): boolean {
        return this.isEnabled;
    }
}
