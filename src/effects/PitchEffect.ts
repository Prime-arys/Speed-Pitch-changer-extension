import { audioGraph } from "@/media/detection";
import {
    isElementMedia,
    isWebAudioMedia,
    type Media,
    type WebAudioMedia,
} from "@/media/Media";
import { DEFAULT_PITCH_ENGINE, type PitchEngine } from "@/models/CommandsData";
import { MediaEffect } from "./MediaEffect";
import { PitchNodes } from "./pitch/PitchNodes";

export interface PitchSettings {
    /** Shift in semitones: positive raises the pitch, 0 leaves the page alone. */
    semitones: number;
    /** Worklet implementation doing the shifting. */
    engine: PitchEngine;
}

export const DEFAULT_PITCH: PitchSettings = {
    semitones: 0,
    engine: DEFAULT_PITCH_ENGINE,
};

/** Playing real media, as opposed to sitting idle in a player's pool. */
function isPlaying(element: HTMLMediaElement): boolean {
    return (
        !element.paused &&
        !element.ended &&
        element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        // A stream fed through `srcObject` leaves both URLs empty.
        !!(element.currentSrc || element.src || element.srcObject)
    );
}

/**
 * Real-time pitch shifting, in semitones.
 *
 * Rather than building a competing audio graph, it splices a pitch node into
 * the page's own: every connection to a destination is rerouted
 * `node -> pitch node -> destination` while the effect is engaged, and put
 * back as it was at 0 semitones. That cooperation is what makes it work on
 * sites that own their Web Audio graph, where an element is never playable on
 * its own.
 *
 * The two media kinds meet in the same place:
 *
 * - `web-audio` media are rerouted directly ({@link route}).
 * - `element` media are sourced into a context of ours ({@link source}), which
 *   makes them appear as `web-audio` media through the detection hooks — so
 *   they take the branch above. Sourcing waits for real playback:
 *   `createMediaElementSource` captures an element's output for good, so
 *   capturing an idle element from a player's pool would silence it when it
 *   later loads.
 */
export class PitchEffect extends MediaEffect<PitchSettings, Media> {
    readonly name = "pitch";

    private readonly nodes = new PitchNodes();
    /** Connections currently routed through the pitch node. */
    private readonly wired = new Set<WebAudioMedia>();
    /**
     * The routing attempt in flight for a connection. A node can take a while
     * to build, and the engine may change meanwhile: without this, the stale
     * attempt would report its failure over the record of the live one.
     */
    private readonly attempts = new WeakMap<WebAudioMedia, symbol>();
    /** Shared context for elements the page never routes through Web Audio. */
    private fallbackContext: AudioContext | null = null;

    /** Whether the effect is actually shifting anything. */
    get engaged(): boolean {
        return this.value.semitones !== 0;
    }

    override set(settings: PitchSettings): void {
        // Nodes of the previous engine cannot be reused; drop them and let the
        // reroute below build new ones.
        if (settings.engine !== this.value.engine) this.rebuild();

        this.nodes.configure(settings.engine, settings.semitones);
        super.set(settings);
    }

    protected supports(media: Media): media is Media {
        // Both kinds: an element the page plays on its own, and a graph it
        // feeds to Web Audio.
        return isElementMedia(media) || isWebAudioMedia(media);
    }

    protected override attach(media: Media): void {
        if (!isElementMedia(media)) return;
        media.element.addEventListener("playing", () => {
            if (this.engaged) this.source(media.element);
        });
    }

    protected apply(media: Media): void {
        if (isWebAudioMedia(media)) {
            this.route(media);
        } else if (this.engaged && isPlaying(media.element)) {
            this.source(media.element);
        }
    }

    protected override release(media: Media): void {
        // The page disconnected the node: it took our wet connection with it.
        if (isWebAudioMedia(media)) this.wired.delete(media);
    }

    /** Keep one connection routed the way the current state asks for. */
    private route(media: WebAudioMedia): void {
        // Nothing can be built on a context the page has closed.
        if (media.context.state === "closed") return;

        const wired = this.wired.has(media);

        if (this.engaged && !wired) {
            // Claimed up front, so a second pass cannot reroute it twice while
            // the node is still loading.
            this.wired.add(media);

            const attempt = Symbol("routing");
            this.attempts.set(media, attempt);
            const current = () => this.attempts.get(media) === attempt;

            this.nodes
                .ensure(media.context)
                .then((pitchNode) => {
                    // Pitch may have been dropped while the worklet loaded.
                    if (current() && this.wired.has(media)) {
                        this.wire(media, pitchNode);
                    }
                })
                .catch(() => {
                    if (current()) this.wired.delete(media);
                });
        } else if (!this.engaged && wired) {
            this.wired.delete(media);
            this.unwire(media);
        }
    }

    private wire(media: WebAudioMedia, pitchNode: AudioNode): void {
        try {
            audioGraph.connect(media.node, pitchNode);
        } catch (error) {
            this.wired.delete(media);
            console.warn("[pitch] could not reroute a connection", error);
            return;
        }
        try {
            // Drop the dry path now that the wet one is live.
            audioGraph.disconnect(media.node, media.destination);
        } catch {
            /* already disconnected */
        }
    }

    private unwire(media: WebAudioMedia): void {
        try {
            audioGraph.connect(media.node, media.destination);
        } catch {
            /* the page may have torn the node down */
        }
        const pitchNode = this.nodes.get(media.context);
        if (!pitchNode) return;
        try {
            audioGraph.disconnect(media.node, pitchNode);
        } catch {
            /* already disconnected */
        }
    }

    /** Route a plain element through our own context so it can be shifted. */
    private source(element: HTMLMediaElement): void {
        // Pages that source their own elements route them to the destination
        // themselves (already handled by {@link route}); competing with them
        // would steal the audio of an element they are about to reuse.
        if (audioGraph.pageOwnsMediaSources()) return;
        if (audioGraph.sourceFor(element)) return;

        // Attachment to the document is deliberately not required: players
        // such as Spotify and Deezer build their element and never put it in
        // the page, and Web Audio sources a detached element just as well.

        const context = this.fallback();
        if (!context) return;

        try {
            // Deliberately the patched API: the source and its connection are
            // detected, and come back as web-audio media to be rerouted.
            context.createMediaElementSource(element).connect(context.destination);
        } catch (error) {
            // Bound to a source node we never saw; nothing can be done without
            // breaking the page.
            console.warn("[pitch] could not source a media element", error);
        }
    }

    private fallback(): AudioContext | null {
        if (!this.fallbackContext) {
            try {
                this.fallbackContext = new AudioContext();
                audioGraph.ownContext(this.fallbackContext);
            } catch {
                return null;
            }
        }
        if (this.fallbackContext.state === "suspended") {
            void this.fallbackContext.resume().catch(() => {
                /* needs a gesture the page has not given yet */
            });
        }
        return this.fallbackContext;
    }

    /** Put every connection back as the page made it and drop every node. */
    private rebuild(): void {
        this.wired.forEach((media) => this.unwire(media));
        this.wired.clear();
        this.nodes.dispose();
    }
}
