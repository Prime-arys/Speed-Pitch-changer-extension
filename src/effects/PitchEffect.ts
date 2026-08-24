import { isElementMedia, isWebAudioMedia, type Media } from "@/media/Media";
import { MediaEffect } from "./MediaEffect";

export const DEFAULT_PITCH = 0;

/**
 * Pitch shift in semitones, applied to every media.
 *
 * Skeleton: the value is held and reported, nothing is processed yet. The
 * working pipeline lives on the `rewrite-explore-2` branch
 * (`src/controllers/pitch/*`) and plugs into {@link apply}, one branch per
 * media kind:
 *
 * - `web-audio`: create one pitch node per audio context and reroute
 *   `media.node -> pitch node -> media.destination`, using `audioGraph`
 *   ({@link import("@/media/detection").audioGraph}) so the rewiring is not
 *   read back as new media. Going back to 0 semitones restores the direct
 *   connection.
 * - `element`: sites that never touch Web Audio need the element sourced into
 *   a context of ours, and only once it is actually playing — sourcing an idle
 *   element from a player's pool silences it when it later loads. Once sourced,
 *   it reaches the destination and comes back as `web-audio` media, so the
 *   branch above does the actual work.
 *
 * Both branches only make sense while the effect is engaged, hence
 * {@link engaged}: at 0 semitones the page keeps its own untouched graph.
 */
export class PitchEffect extends MediaEffect<number, Media> {
    readonly name = "pitch";

    /** Whether the effect is actually shifting anything. */
    get engaged(): boolean {
        return this.value !== 0;
    }

    protected supports(media: Media): media is Media {
        // Both kinds: an element the page plays on its own, and a graph it
        // feeds to Web Audio.
        return isElementMedia(media) || isWebAudioMedia(media);
    }

    protected apply(media: Media, semitones: number): void {
        // TODO: port the pitch pipeline here (see the class documentation).
        void media;
        void semitones;
    }
}
