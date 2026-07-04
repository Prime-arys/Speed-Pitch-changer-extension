import { sendWindowMessage } from "@/utils/messaging-window";

/**
 * Resolve the URL of a worklet script shipped as a web-accessible resource.
 * In an extension context the runtime API is used directly; in the MAIN world
 * the content script is asked for the extension's base URL through window
 * messaging.
 */
export async function resolveWorkletUrl(path: string): Promise<string> {
    if (typeof browser !== "undefined" && browser.runtime?.getURL) {
        return (browser.runtime.getURL as (path: string) => string)(path);
    }
    const base = await sendWindowMessage("getExtensionWebAccessibleUrl");
    return new URL(path, base).toString();
}
