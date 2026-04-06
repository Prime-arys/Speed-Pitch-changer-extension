import { mainWorldMediaElements, onMediaElementAdded } from "@/utils/vars";
import audioElementHook from "./audioElement";
import createElementHook from "./createElement";

export default defineUnlistedScript(() => {
    // console.log("Hello from the main world");
    audioElementHook();
    createElementHook();

    const elementProcessedSet = new WeakSet<HTMLMediaElement>();

    const addToDOM = (element: HTMLMediaElement) => {
        if (
            !document.head.contains(element) &&
            !document.body.contains(element)
        ) {
            document.head.appendChild(element);
        }
    };

    const hasSource = (element: HTMLMediaElement): boolean => {
        return !!(
            element.src ||
            element.currentSrc ||
            Array.from(element.querySelectorAll("source")).some(
                (source) => source.src
            )
        );
    };

    const processElement = (element: HTMLMediaElement) => {
        if (elementProcessedSet.has(element)) return;
        elementProcessedSet.add(element);

        // console.log("Processing new media element:", element);

        // If it already has a source, add to DOM immediately
        if (hasSource(element)) {
            addToDOM(element);
            return;
        }

        // Wait for source to be added
        const onSourceReady = () => {
            if (hasSource(element)) {
                addToDOM(element);
                element.removeEventListener("loadstart", onSourceReady);
                observer.disconnect();
            }
        };

        // Listen for loadstart event (fires when source starts loading)
        element.addEventListener("loadstart", onSourceReady);

        // Also observe for src attribute or <source> children changes
        const observer = new MutationObserver(() => {
            if (hasSource(element)) {
                addToDOM(element);
                observer.disconnect();
                element.removeEventListener("loadstart", onSourceReady);
            }
        });

        observer.observe(element, {
            attributes: true,
            attributeFilter: ["src"],
            childList: true,
            subtree: true,
        });
    };

    // Listen for new elements
    onMediaElementAdded(processElement);

    // Process existing elements
    mainWorldMediaElements.forEach(processElement);
});