import SignalsmithStretch from "signalsmith-stretch";
import { sendWindowMessage } from "@/utils/messaging-window";

/**
 * This class is responsible for configuring the SignalsmithStretch worklet
 * with the correct module URL.
 * It can be called from both the content script and the main world (through window messaging) 
 * to ensure the worklet is registered with the correct URL in both contexts.
 */
export class SignalsmithStretchConfigurator {
    private static defaultWorkletUrl = "/signalsmith-stretch-worklet.js"; // path for the worklet script
    private workletUrl: string;
    private SignalsmithStretch = SignalsmithStretch;

    private constructor(workletUrl: string) {
        this.workletUrl = workletUrl;
        (
            this.SignalsmithStretch as unknown as { moduleUrl?: string }
        ).moduleUrl = this.workletUrl;
    }

    private async getWorkletUrl(): Promise<string> {
        const workletPath = SignalsmithStretchConfigurator.defaultWorkletUrl;

        // In browser extension context, we need to use the extension's web-accessible resource
        if (typeof browser !== "undefined" && browser.runtime?.getURL) {
            // return extension URL + worklet path
            return (browser.runtime.getURL as (path: string) => string)(
                workletPath,
            );
        }

        // In non-extension context (main wold), we use WindowMessaging to ask the content script for the correct URL
        else if (typeof window !== "undefined") {
            try {
                const url = await sendWindowMessage(
                    "getExtensionWebAccessibleUrl",
                );
                // return the URL + worklet path
                return new URL(workletPath, url).toString();
            } catch (error) {
                console.warn(
                    "Window messaging URL retrieval failed, falling back to default path.",
                    error,
                );
            }
        }

        // Fallback - won't work but provides a path for debugging
        return workletPath;
    }

    static async create(): Promise<typeof SignalsmithStretch> {
        const configurator = new SignalsmithStretchConfigurator(
            SignalsmithStretchConfigurator.defaultWorkletUrl,
        );
        const workletUrl = await configurator.getWorkletUrl();
        configurator.workletUrl = workletUrl;
        (
            configurator.SignalsmithStretch as unknown as { moduleUrl?: string }
        ).moduleUrl = workletUrl;
        return configurator.SignalsmithStretch;
    }
}
