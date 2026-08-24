import { sendWindowMessage } from "@/utils/messaging-window";

/**
 * URL of a worklet script shipped as a web-accessible resource.
 *
 * The MAIN world has no `browser.runtime`, so the content script is asked for
 * the URL; the runtime API is used directly anywhere else.
 */
export async function resolveWorkletUrl(path: string): Promise<string> {
    if (typeof browser !== "undefined" && browser.runtime?.getURL) {
        return (browser.runtime.getURL as (path: string) => string)(path);
    }
    return sendWindowMessage("getExtensionUrl", path);
}
