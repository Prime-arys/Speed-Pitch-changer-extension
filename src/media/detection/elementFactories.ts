import type { MediaDetector } from "./MediaDetector";

/**
 * Catches media elements at creation time, before they get a source and before
 * they reach the DOM — `new Audio()` elements often never reach it at all.
 *
 * Patching happens once, at document_start, so the page's own factories are
 * already wrapped when it builds its first player.
 */
export const elementFactories: MediaDetector = (registry) => {
    const restores: (() => void)[] = [];

    const rawCreateElement = Document.prototype.createElement;
    Document.prototype.createElement = function (
        this: Document,
        ...args: Parameters<Document["createElement"]>
    ) {
        const element = rawCreateElement.apply(this, args);
        if (element instanceof HTMLMediaElement) {
            registry.registerElement(element, "create-element");
        }
        return element;
    } as typeof Document.prototype.createElement;
    restores.push(() => {
        Document.prototype.createElement = rawCreateElement;
    });

    const rawCreateElementNS = Document.prototype.createElementNS;
    Document.prototype.createElementNS = function (
        this: Document,
        ...args: Parameters<Document["createElementNS"]>
    ) {
        const element = rawCreateElementNS.apply(this, args);
        if (element instanceof HTMLMediaElement) {
            registry.registerElement(element, "create-element");
        }
        return element;
    } as typeof Document.prototype.createElementNS;
    restores.push(() => {
        Document.prototype.createElementNS = rawCreateElementNS;
    });

    // `new Audio(src)` does not go through createElement. Returning an object
    // from a constructor replaces `this`, so callers get the real element;
    // keeping the original prototype and statics keeps `instanceof` working.
    const RawAudio = window.Audio;
    const PatchedAudio = function Audio(src?: string) {
        const audio = new RawAudio(src);
        registry.registerElement(audio, "audio-constructor");
        return audio;
    } as unknown as typeof Audio;
    PatchedAudio.prototype = RawAudio.prototype;
    Object.setPrototypeOf(PatchedAudio, RawAudio);
    window.Audio = PatchedAudio;
    restores.push(() => {
        window.Audio = RawAudio;
    });

    return () => restores.forEach((restore) => restore());
};
