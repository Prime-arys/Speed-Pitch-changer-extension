type ConnectListener = (
    node: AudioNode,
    ctx: AudioContext,
    dest: AudioNode
) => void;
type DisconnectListener = (node: AudioNode) => void;

// Marks AudioNodes the patch must ignore (our own stretch nodes), so rerouting
// never feeds a stretch node back into itself.
interface OwnedNode extends AudioNode {
    __spcStretch?: boolean;
}

/**
 * Patches the page's own Web Audio prototypes (once) so the rest of the pitch
 * pipeline can cooperate with the site's graph instead of competing with it:
 *
 *  - `AudioNode.prototype.connect`: after the real connection is made, any
 *    connection to `ctx.destination` is reported to listeners (which splice in
 *    a stretch node). The dry connection happening first means a failed worklet
 *    load degrades to unprocessed audio rather than silence.
 *  - `AudioNode.prototype.disconnect`: reported so stale records can be pruned.
 *  - `AudioContext.prototype.createMediaElementSource`: tracked so the fallback
 *    never double-sources an element the page already owns (which would throw).
 *
 * Assumes a single instance per realm (one MAIN-world script); the first
 * instance installs the patches and owns the listener lists.
 */
export class AudioGraphPatcher {
    private static installed = false;
    private static rawConnect: (
        this: AudioNode,
        ...args: unknown[]
    ) => AudioNode;
    private static rawDisconnect: (
        this: AudioNode,
        ...args: unknown[]
    ) => void;

    private connectListeners: ConnectListener[] = [];
    private disconnectListeners: DisconnectListener[] = [];
    private sources = new WeakMap<
        HTMLMediaElement,
        { sourceNode: MediaElementAudioSourceNode; ctx: BaseAudioContext }
    >();
    private ownContexts = new WeakSet<BaseAudioContext>();
    private pageOwnsSources = false;

    constructor() {
        this.install();
    }

    /** Connect bypassing the patch (so our own routing isn't re-intercepted). */
    connect(node: AudioNode, dest: AudioNode): void {
        AudioGraphPatcher.rawConnect.call(node, dest);
    }

    /** Disconnect bypassing the patch. */
    disconnect(node: AudioNode, dest?: AudioNode): void {
        if (dest) AudioGraphPatcher.rawDisconnect.call(node, dest);
        else AudioGraphPatcher.rawDisconnect.call(node);
    }

    markOwn(node: AudioNode): void {
        (node as OwnedNode).__spcStretch = true;
    }

    hasSource(element: HTMLMediaElement): boolean {
        return this.sources.has(element);
    }

    /**
     * True once the page has created its own MediaElementAudioSourceNode. Such
     * pages route their elements to the destination themselves (handled by
     * interception), so the fallback must not also source elements — it would
     * race the page for pooled or just-switched elements and bind them to the
     * wrong context.
     */
    pageOwnsMediaSources(): boolean {
        return this.pageOwnsSources;
    }

    /** Register a context we created, so its source calls aren't read as the page's. */
    markOwnContext(ctx: BaseAudioContext): void {
        this.ownContexts.add(ctx);
    }

    onConnectToDestination(listener: ConnectListener): void {
        this.connectListeners.push(listener);
    }

    onDisconnect(listener: DisconnectListener): void {
        this.disconnectListeners.push(listener);
    }

    private install(): void {
        if (AudioGraphPatcher.installed) return;
        AudioGraphPatcher.installed = true;

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const patcher = this;
        const rawConnect = AudioNode.prototype.connect as unknown as (
            this: AudioNode,
            ...args: unknown[]
        ) => AudioNode;
        const rawDisconnect = AudioNode.prototype.disconnect as unknown as (
            this: AudioNode,
            ...args: unknown[]
        ) => void;
        AudioGraphPatcher.rawConnect = rawConnect;
        AudioGraphPatcher.rawDisconnect = rawDisconnect;

        AudioNode.prototype.connect = function (
            this: AudioNode,
            ...args: unknown[]
        ) {
            const dest = args[0];
            let reroutable = false;
            try {
                reroutable =
                    !(this as OwnedNode).__spcStretch &&
                    dest instanceof AudioNode &&
                    dest === this.context.destination;
            } catch {
                reroutable = false;
            }

            const result = rawConnect.apply(this, args);

            if (reroutable) {
                patcher.emitConnect(
                    this,
                    this.context as AudioContext,
                    dest as AudioNode
                );
            }
            return result;
        } as typeof AudioNode.prototype.connect;

        AudioNode.prototype.disconnect = function (
            this: AudioNode,
            ...args: unknown[]
        ) {
            patcher.emitDisconnect(this);
            return rawDisconnect.apply(this, args);
        } as typeof AudioNode.prototype.disconnect;

        const rawCreateMES = AudioContext.prototype.createMediaElementSource;
        if (rawCreateMES) {
            AudioContext.prototype.createMediaElementSource = function (
                this: AudioContext,
                element: HTMLMediaElement
            ) {
                if (!patcher.ownContexts.has(this)) {
                    patcher.pageOwnsSources = true;
                }
                const existing = patcher.sources.get(element);
                // Only safe to reuse within the same context; a foreign node
                // can't be connected into another context's graph. Otherwise
                // let the native call throw the standard "already connected"
                // error rather than handing back a cross-context node.
                if (existing && existing.ctx === this) {
                    return existing.sourceNode;
                }
                const node = rawCreateMES.call(this, element);
                patcher.sources.set(element, { sourceNode: node, ctx: this });
                return node;
            };
        }
    }

    private emitConnect(
        node: AudioNode,
        ctx: AudioContext,
        dest: AudioNode
    ): void {
        for (const listener of this.connectListeners) {
            try {
                listener(node, ctx, dest);
            } catch {
                /* a listener must not break the page's connect call */
            }
        }
    }

    private emitDisconnect(node: AudioNode): void {
        for (const listener of this.disconnectListeners) {
            try {
                listener(node);
            } catch {
                /* a listener must not break the page's disconnect call */
            }
        }
    }
}
