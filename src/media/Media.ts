/**
 * Every kind of media the extension can act on, described by a single union.
 *
 * - `element`   : an `<audio>`/`<video>`, wherever it comes from (parsed HTML,
 *                 `document.createElement()`, `new Audio()`), whether or not it
 *                 is attached to the DOM.
 * - `web-audio` : a node the page connects to an audio context destination
 *                 (buffer sources, media-element sources, media streams,
 *                 oscillators...). Sites that build their own Web Audio graph
 *                 never expose a playable element, so this is the only handle
 *                 on their sound.
 *
 * Anything playable falls in one of those two buckets: a `MediaStream` is
 * either attached to an element (`srcObject`) or routed through a
 * `MediaStreamAudioSourceNode`. Both variants share the same identity fields so
 * the registry can hold them side by side and an effect only switches on
 * `kind`.
 */
export type MediaKind = "element" | "web-audio";

/** Which detector saw the media first. Diagnostics only. */
export type MediaOrigin =
    | "dom" // initial scan or DOM mutation (light DOM and shadow roots)
    | "create-element" // document.createElement() / createElementNS()
    | "audio-constructor" // new Audio()
    | "media-element-source" // AudioContext.createMediaElementSource()
    | "audio-node"; // AudioNode.connect(context.destination)

interface MediaBase {
    /** Stable per-page id, handy for logs and for the popup. */
    readonly id: number;
    readonly kind: MediaKind;
    readonly origin: MediaOrigin;
    readonly detectedAt: number;
}

export interface ElementMedia extends MediaBase {
    readonly kind: "element";
    readonly element: HTMLMediaElement;
}

export interface WebAudioMedia extends MediaBase {
    readonly kind: "web-audio";
    readonly context: BaseAudioContext;
    /** The node the page wired to `context.destination`. */
    readonly node: AudioNode;
    readonly destination: AudioNode;
    /** Set when the node is a source built from an element (see {@link ElementMedia}). */
    readonly element?: HTMLMediaElement;
}

export type Media = ElementMedia | WebAudioMedia;

/** The object a media is keyed by inside the registry. */
export type MediaTarget = HTMLMediaElement | AudioNode;

/** Serializable snapshot, for the popup or for debugging. */
export interface MediaSummary {
    total: number;
    elements: number;
    webAudio: number;
}

export const isElementMedia = (media: Media): media is ElementMedia =>
    media.kind === "element";

export const isWebAudioMedia = (media: Media): media is WebAudioMedia =>
    media.kind === "web-audio";
