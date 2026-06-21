import { AudioGraphPatcher } from "./AudioGraphPatcher";

const ELEM_SELECTOR = "video,audio";

/**
 * Discovers `<audio>`/`<video>` elements and, for those the site never routes
 * through Web Audio, sources them into a shared fallback context so they flow
 * through the same destination-interception path as page-owned graphs.
 *
 * Sourcing is **play-driven**: an element is sourced only once it is actually
 * playing real media. `createMediaElementSource` permanently captures an
 * element's output, so sourcing an idle/empty element from a pool (e.g. a media
 * player that preloads the next track into a spare element) would silence it
 * when it later loads — which is why switching tracks broke. Waiting for the
 * `playing` event sources the element the user is actually listening to, and
 * picks up the next one when playback moves to it.
 */
export class MediaElementSourcer {
    private known = new Set<HTMLMediaElement>();
    private watched = new WeakSet<HTMLMediaElement>();
    private fallbackContext: AudioContext | null = null;

    constructor(
        private patcher: AudioGraphPatcher,
        private isEngaged: () => boolean
    ) {}

    init(): void {
        if (!document) return;
        new MutationObserver(() => this.discover()).observe(document, {
            childList: true,
            subtree: true,
        });
        this.discover();
    }

    /** Source whatever is already playing (called when pitch engages). */
    attachPlain(): void {
        if (this.patcher.pageOwnsMediaSources()) return;
        this.known.forEach((el) => {
            if (this.isPlaying(el)) this.source(el);
        });
    }

    private discover(): void {
        document
            .querySelectorAll<HTMLMediaElement>(ELEM_SELECTOR)
            .forEach((el) => {
                if (this.known.has(el)) return;
                this.known.add(el);
                this.watch(el);
            });
    }

    private watch(el: HTMLMediaElement): void {
        if (this.watched.has(el)) return;
        this.watched.add(el);
        el.addEventListener("playing", () => {
            if (this.isEngaged()) this.source(el);
        });
    }

    private isPlaying(el: HTMLMediaElement): boolean {
        return (
            !el.paused &&
            !el.ended &&
            el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            !!(el.currentSrc || el.src)
        );
    }

    /** Source a single playing element into the fallback context. */
    private source(el: HTMLMediaElement): void {
        // Pages that source their own media elements manage their own routing
        // (handled by interception); never compete with them.
        if (this.patcher.pageOwnsMediaSources()) return;
        if (this.patcher.hasSource(el)) return;
        if (!el.isConnected) return;

        if (!this.fallbackContext) {
            try {
                this.fallbackContext = new AudioContext();
                this.patcher.markOwnContext(this.fallbackContext);
            } catch {
                return;
            }
        }
        const ctx = this.fallbackContext;

        try {
            // The patched createMediaElementSource records the source and the
            // patched connect tracks the destination link, routing it through
            // the stretch node.
            const source = ctx.createMediaElementSource(el);
            source.connect(ctx.destination);
        } catch {
            // Element is already bound to another source node we did not
            // observe; nothing we can do without breaking the page.
        }
    }
}
