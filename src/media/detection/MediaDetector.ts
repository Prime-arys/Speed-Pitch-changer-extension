import type { MediaRegistry, Unsubscribe } from "../MediaRegistry";

/**
 * A detector watches one way the page can produce media and pushes what it
 * finds into the registry. It returns a function undoing its hooks, or nothing
 * when it has none to undo.
 */
export type MediaDetector = (registry: MediaRegistry) => Unsubscribe | void;
