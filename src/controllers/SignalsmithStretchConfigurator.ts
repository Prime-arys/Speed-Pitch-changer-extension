import SignalsmithStretch from "signalsmith-stretch";

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

    private async getWorkletUrl(
        customCall?: () => Promise<string>,
    ): Promise<string> {
        const workletPath = SignalsmithStretchConfigurator.defaultWorkletUrl;

        // In browser extension context, we need to use the extension's web-accessible resource
        if (typeof browser !== "undefined" && browser.runtime?.getURL) {
            // return extension URL + worklet path
            return (browser.runtime.getURL as (path: string) => string)(
                workletPath,
            );
        }

        if (customCall) {
            try {
                const customUrl = await customCall();
                if (customUrl) {
                    return customUrl;
                }
            } catch (error) {
                console.warn(
                    "Custom worklet URL retrieval failed, falling back to default path.",
                    error,
                );
            }
        }

        // Fallback - won't work but provides a path for debugging
        return workletPath;
    }

    static async create(
        customCall?: () => Promise<string>,
    ): Promise<typeof SignalsmithStretch> {
        const configurator = new SignalsmithStretchConfigurator(
            SignalsmithStretchConfigurator.defaultWorkletUrl,
        );
        const workletUrl = await configurator.getWorkletUrl(customCall);
        configurator.workletUrl = workletUrl;
        (
            configurator.SignalsmithStretch as unknown as { moduleUrl?: string }
        ).moduleUrl = workletUrl;
        return configurator.SignalsmithStretch;
    }
}
