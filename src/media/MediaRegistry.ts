import {
    isElementMedia,
    isWebAudioMedia,
    type ElementMedia,
    type Media,
    type MediaOrigin,
    type MediaSummary,
    type MediaTarget,
    type WebAudioMedia,
} from "./Media";

export type MediaListener = (media: Media) => void;
export type Unsubscribe = () => void;

/**
 * The single structure holding every detected media of the page.
 *
 * Detectors only push into it, effects only read from it: neither knows about
 * the other. Keying by the element/node itself makes registration idempotent,
 * so several detectors can legitimately find the same media (a `<video>` is
 * usually seen by `createElement` *and* by the DOM scan) without duplicating
 * anything.
 *
 * Lifetime: media stay registered until explicitly removed. Elements are never
 * removed on DOM detachment — a detached element is still playable and SPAs
 * re-attach them constantly — while Web Audio nodes are removed as soon as the
 * page disconnects them or they end, which is what keeps the map bounded on
 * sites that spawn one source node per sound.
 */
export class MediaRegistry {
    private readonly medias = new Map<MediaTarget, Media>();
    private readonly addedListeners = new Set<MediaListener>();
    private readonly removedListeners = new Set<MediaListener>();
    private nextId = 1;

    get size(): number {
        return this.medias.size;
    }

    /** Every media detected so far, in detection order. */
    all(): Media[] {
        return [...this.medias.values()];
    }

    elements(): ElementMedia[] {
        return this.all().filter(isElementMedia);
    }

    webAudio(): WebAudioMedia[] {
        return this.all().filter(isWebAudioMedia);
    }

    get(target: MediaTarget): Media | undefined {
        return this.medias.get(target);
    }

    has(target: MediaTarget): boolean {
        return this.medias.has(target);
    }

    summary(): MediaSummary {
        const all = this.all();
        return {
            total: all.length,
            elements: all.filter(isElementMedia).length,
            webAudio: all.filter(isWebAudioMedia).length,
        };
    }

    /** Register an `<audio>`/`<video>`; returns the existing entry if already known. */
    registerElement(
        element: HTMLMediaElement,
        origin: MediaOrigin
    ): ElementMedia {
        const known = this.medias.get(element);
        if (known) return known as ElementMedia;

        const media: ElementMedia = {
            id: this.nextId++,
            kind: "element",
            origin,
            detectedAt: Date.now(),
            element,
        };
        return this.add(element, media) as ElementMedia;
    }

    /** Register a node wired to a destination; returns the existing entry if already known. */
    registerWebAudio(
        source: Omit<WebAudioMedia, "id" | "kind" | "origin" | "detectedAt">,
        origin: MediaOrigin
    ): WebAudioMedia {
        const known = this.medias.get(source.node);
        if (known) return known as WebAudioMedia;

        const media: WebAudioMedia = {
            id: this.nextId++,
            kind: "web-audio",
            origin,
            detectedAt: Date.now(),
            ...source,
        };
        return this.add(source.node, media) as WebAudioMedia;
    }

    /** Forget a media (no-op when unknown). */
    remove(target: MediaTarget): void {
        const media = this.medias.get(target);
        if (!media) return;
        this.medias.delete(target);
        this.emit(this.removedListeners, media);
    }

    /**
     * Observe media. The listener is called for every media already known, then
     * for each new one — so a subscriber that starts late still sees the whole
     * page and no caller needs its own "process what already exists" pass.
     */
    onAdded(listener: MediaListener): Unsubscribe {
        this.addedListeners.add(listener);
        this.medias.forEach((media) => this.call(listener, media));
        return () => this.addedListeners.delete(listener);
    }

    onRemoved(listener: MediaListener): Unsubscribe {
        this.removedListeners.add(listener);
        return () => this.removedListeners.delete(listener);
    }

    private add(target: MediaTarget, media: Media): Media {
        this.medias.set(target, media);
        this.emit(this.addedListeners, media);
        return media;
    }

    private emit(listeners: Set<MediaListener>, media: Media): void {
        listeners.forEach((listener) => this.call(listener, media));
    }

    private call(listener: MediaListener, media: Media): void {
        try {
            listener(media);
        } catch (error) {
            // Detection runs inside patched page APIs: a listener must never
            // break the call it was triggered from.
            console.error("[MediaRegistry] listener failed", error);
        }
    }
}
