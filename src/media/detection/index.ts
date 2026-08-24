import type { MediaRegistry, Unsubscribe } from "../MediaRegistry";
import { domScan } from "./domScan";
import { elementFactories } from "./elementFactories";
import { webAudio } from "./webAudio";
import type { MediaDetector } from "./MediaDetector";

/**
 * Every way the extension can discover media, in one list. Supporting a new
 * source of media means adding a detector here and nothing else.
 *
 * Order matters: the two patching detectors must be in place before the page
 * runs any code, while the DOM scan only reads what already exists.
 */
const DETECTORS: MediaDetector[] = [elementFactories, webAudio, domScan];

/**
 * Install media detection for the current page. Call once, from the MAIN world
 * at document_start: the page's own factories and audio graph have to be
 * wrapped before it builds its player.
 */
export function installMediaDetection(registry: MediaRegistry): Unsubscribe {
    const disposers = DETECTORS.map((detector) => detector(registry));
    return () => disposers.forEach((dispose) => dispose?.());
}

export { audioGraph } from "./webAudio";
export type { MediaDetector } from "./MediaDetector";
