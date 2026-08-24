import { isElementMedia, type ElementMedia, type Media } from "@/media/Media";
import { MediaEffect } from "./MediaEffect";

export interface SpeedSettings {
    /** Playback rate, 1 being the media's own speed. */
    rate: number;
    /** Keep the original pitch while the rate changes. */
    preservesPitch: boolean;
}

export const DEFAULT_SPEED: SpeedSettings = { rate: 1, preservesPitch: true };

/**
 * A media element with the properties the optional `enforce` hook installs to
 * write a rate sites otherwise keep resetting, plus the Firefox-prefixed
 * pitch flag.
 */
interface SpeedableElement extends HTMLMediaElement {
    mozPreservesPitch?: boolean;
    playbackRate_origin?: number;
    defaultPlaybackRate_origin?: number;
}

/**
 * Playback speed, applied to media elements.
 *
 * Web Audio media are skipped on purpose: a node has no playback rate, and the
 * element feeding a `MediaElementAudioSourceNode` is registered as an element
 * media of its own, so nothing is lost.
 *
 * Instead of polling the page, each element is re-synced on the events that
 * reset its rate (a new source, a fresh play, the site writing its own rate).
 */
export class SpeedEffect extends MediaEffect<SpeedSettings, ElementMedia> {
    readonly name = "speed";

    /** Listeners are removed in one call when the media goes away. */
    private readonly watchers = new WeakMap<HTMLMediaElement, AbortController>();

    protected supports(media: Media): media is ElementMedia {
        return isElementMedia(media);
    }

    protected override attach(media: ElementMedia): void {
        const controller = new AbortController();
        this.watchers.set(media.element, controller);

        const resync = () => this.apply(media, this.value);
        const options = { signal: controller.signal };

        // A new source resets the rate to its default...
        media.element.addEventListener("loadstart", resync, options);
        media.element.addEventListener("play", resync, options);
        // ...and some sites write it back themselves.
        media.element.addEventListener(
            "ratechange",
            () => {
                if (media.element.playbackRate !== this.value.rate) resync();
            },
            options
        );
    }

    protected apply(media: ElementMedia, { rate, preservesPitch }: SpeedSettings): void {
        const element = media.element as SpeedableElement;

        element.playbackRate = rate;
        element.defaultPlaybackRate = rate;
        // No-ops unless the enforce hook is installed for this domain, where
        // they are the only way through its guarded setters.
        element.playbackRate_origin = rate;
        element.defaultPlaybackRate_origin = rate;

        element.preservesPitch = preservesPitch;
        element.mozPreservesPitch = preservesPitch;
    }

    protected override release(media: ElementMedia): void {
        this.watchers.get(media.element)?.abort();
        this.watchers.delete(media.element);
        this.apply(media, DEFAULT_SPEED);
    }
}
