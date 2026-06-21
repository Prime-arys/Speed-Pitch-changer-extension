import { AudioGraphPatcher } from "./AudioGraphPatcher";

const ELEM_SELECTOR = "video,audio";

/**
 * Discovers `<audio>`/`<video>` elements and, for those the site never routes
 * through Web Audio, sources them into a shared fallback context so they flow
 * through the same destination-interception path as page-owned graphs.
 *
 * Sourcing is lazy (only once pitch is engaged): by then the page has normally
 * already built its own graph, so we skip elements it already owns and avoid
 * stealing audio it is about to route itself.
 */
export class MediaElementSourcer {
    private known = new Set<HTMLMediaElement>();
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

    /** Source any plain element the page hasn't already routed through Web Audio. */
    attachPlain(): void {
        if (!this.fallbackContext) {
            try {
                this.fallbackContext = new AudioContext();
            } catch {
                return;
            }
        }
        const ctx = this.fallbackContext;

        this.known.forEach((el) => {
            if (this.patcher.hasSource(el)) return;
            if (!el.isConnected) return;
            try {
                // The patched createMediaElementSource records the source and
                // the patched connect tracks the destination link, routing it
                // through the stretch node.
                const source = ctx.createMediaElementSource(el);
                source.connect(ctx.destination);
            } catch {
                // Element is already bound to another source node we did not
                // observe; nothing we can do without breaking the page.
            }
        });
    }

    private discover(): void {
        document
            .querySelectorAll<HTMLMediaElement>(ELEM_SELECTOR)
            .forEach((el) => this.known.add(el));
        if (this.isEngaged()) this.attachPlain();
    }
}
