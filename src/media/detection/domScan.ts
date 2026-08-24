import type { MediaDetector } from "./MediaDetector";

const MEDIA_SELECTOR = "audio,video";

/**
 * Finds media elements living in the document: the ones already parsed when we
 * start, and the ones inserted later.
 *
 * This is the only detector that catches elements built from markup
 * (`innerHTML`, template cloning, server-rendered HTML), which never go through
 * a factory. Shadow roots are covered too — `MutationObserver` does not cross
 * shadow boundaries, so each root created by the page is observed as well,
 * including closed ones since we capture the root before the page hides it.
 */
export const domScan: MediaDetector = (registry) => {
    const observed = new WeakSet<Node>();

    const register = (node: Node): void => {
        if (node instanceof HTMLMediaElement) {
            registry.registerElement(node, "dom");
        }
        if (node instanceof Element || node instanceof DocumentFragment) {
            scan(node);
        }
    };

    const scan = (root: ParentNode): void => {
        root.querySelectorAll<HTMLMediaElement>(MEDIA_SELECTOR).forEach((el) =>
            registry.registerElement(el, "dom")
        );
    };

    const observer = new MutationObserver((records) => {
        for (const record of records) {
            record.addedNodes.forEach(register);
        }
    });

    const observe = (root: Node & ParentNode): void => {
        if (observed.has(root)) return;
        observed.add(root);
        observer.observe(root, { childList: true, subtree: true });
        scan(root);
    };

    observe(document);

    const rawAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (
        this: Element,
        init: ShadowRootInit
    ) {
        const root = rawAttachShadow.call(this, init);
        observe(root);
        return root;
    };

    return () => {
        observer.disconnect();
        Element.prototype.attachShadow = rawAttachShadow;
    };
};
