import type { MediaDetector } from "./MediaDetector";

type LooseConnect = (this: AudioNode, ...args: unknown[]) => AudioNode;
type LooseDisconnect = (this: AudioNode, ...args: unknown[]) => void;

let rawConnect: LooseConnect | null = null;
let rawDisconnect: LooseDisconnect | null = null;
let installed = false;
let pageOwnsSources = false;

/** Nodes the extension created itself: never media, never rerouted. */
const ownNodes = new WeakSet<AudioNode>();
/** Contexts the extension created itself. */
const ownContexts = new WeakSet<BaseAudioContext>();
/** An element can only ever have one source node; remember it. */
const sources = new WeakMap<
    HTMLMediaElement,
    { node: MediaElementAudioSourceNode; context: BaseAudioContext }
>();
const elementOfNode = new WeakMap<AudioNode, HTMLMediaElement>();

/**
 * Low-level access to the page's Web Audio graph, for effects that need to
 * rewire it (pitch shifting splices a worklet node before the destination).
 * Every call here bypasses the detection patches, so the extension's own wiring
 * is never mistaken for the page's.
 */
export const audioGraph = {
    /** Connect without the connection being reported as new media. */
    connect(node: AudioNode, destination: AudioNode): void {
        const raw =
            rawConnect ??
            (AudioNode.prototype.connect as unknown as LooseConnect);
        raw.call(node, destination);
    },

    /** Disconnect without it being read as "the page dropped this media". */
    disconnect(node: AudioNode, destination?: AudioNode): void {
        const raw =
            rawDisconnect ??
            (AudioNode.prototype.disconnect as unknown as LooseDisconnect);
        if (destination) raw.call(node, destination);
        else raw.call(node);
    },

    /** Mark a node as ours, so it is never tracked nor rerouted into itself. */
    own(node: AudioNode): void {
        ownNodes.add(node);
    },

    /** Mark a context as ours, so its sources are not read as the page's. */
    ownContext(context: BaseAudioContext): void {
        ownContexts.add(context);
    },

    /** The source node bound to an element, if any (the page's or ours). */
    sourceFor(element: HTMLMediaElement) {
        return sources.get(element);
    },

    /**
     * True once the page created a source of its own. Such pages route their
     * elements to the destination themselves, so an effect must reroute rather
     * than source those elements a second time (which would throw, or steal
     * audio from an element the page is about to reuse).
     */
    pageOwnsMediaSources(): boolean {
        return pageOwnsSources;
    },
};

/**
 * Catches sound that never touches a media element: everything the page wires
 * to `context.destination` (buffer sources for streamed players, media streams,
 * oscillators, its own effect chains).
 *
 * Only the last node before the destination is registered, since that is the
 * point where an effect can splice itself in.
 */
export const webAudio: MediaDetector = (registry) => {
    if (typeof AudioNode === "undefined" || installed) return;
    installed = true;

    const rawConnectRef = AudioNode.prototype.connect as unknown as LooseConnect;
    const rawDisconnectRef =
        AudioNode.prototype.disconnect as unknown as LooseDisconnect;
    rawConnect = rawConnectRef;
    rawDisconnect = rawDisconnectRef;

    AudioNode.prototype.connect = function (
        this: AudioNode,
        ...args: unknown[]
    ) {
        // Let the page's own connection happen first: whatever an effect does
        // next, a failure degrades to unprocessed audio instead of silence.
        const result = rawConnectRef.apply(this, args);

        try {
            const destination = args[0];
            if (
                !ownNodes.has(this) &&
                !registry.has(this) &&
                destination instanceof AudioNode &&
                destination === this.context.destination
            ) {
                registry.registerWebAudio(
                    {
                        node: this,
                        context: this.context,
                        destination,
                        element: elementOfNode.get(this),
                    },
                    "audio-node"
                );

                // One-shot sources (a player firing one buffer per chunk) would
                // pile up otherwise.
                if (this instanceof AudioScheduledSourceNode) {
                    this.addEventListener("ended", () => registry.remove(this), {
                        once: true,
                    });
                }
            }
        } catch {
            /* detection must never break the page's connect call */
        }

        return result;
    } as typeof AudioNode.prototype.connect;

    AudioNode.prototype.disconnect = function (
        this: AudioNode,
        ...args: unknown[]
    ) {
        // Coarse on purpose: a node dropping any connection is treated as gone.
        // It is registered again as soon as it reconnects to a destination.
        registry.remove(this);
        return rawDisconnectRef.apply(this, args);
    } as typeof AudioNode.prototype.disconnect;

    const rawCreateSource = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (
        this: AudioContext,
        element: HTMLMediaElement
    ) {
        if (!ownContexts.has(this)) pageOwnsSources = true;

        // An element can only be sourced once, and a node cannot cross
        // contexts: hand back the existing one when the context matches, and
        // let the native call throw its standard error otherwise.
        const existing = sources.get(element);
        if (existing && existing.context === this) return existing.node;

        const node = rawCreateSource.call(this, element);
        sources.set(element, { node, context: this });
        elementOfNode.set(node, element);
        registry.registerElement(element, "media-element-source");
        return node;
    };

    return () => {
        AudioNode.prototype.connect =
            rawConnectRef as unknown as typeof AudioNode.prototype.connect;
        AudioNode.prototype.disconnect =
            rawDisconnectRef as unknown as typeof AudioNode.prototype.disconnect;
        AudioContext.prototype.createMediaElementSource = rawCreateSource;
        installed = false;
    };
};
