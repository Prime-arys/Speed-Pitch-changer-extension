import { sendMessage, onMessage } from "@/utils/messaging";
import { onWindowMessage } from "@/utils/messaging-window";
import { SpeedController } from "@/controllers/SpeedController";
import { PitchController } from "@/controllers/PitchController";
import { setupShortcutsBindings } from "./shortcutsBindings";

/**
 * Isolated world.
 *
 * Holds everything that needs the extension APIs: settings, shortcuts, the
 * background messaging. Media themselves are handled in the MAIN world (see
 * `entrypoints/main-world`); the controllers here only send values over.
 */
export default defineUnlistedScript(async () => {
    //console.log("Hello from isolated world");

    // Get settings from background
    const settings = await sendMessage("getCommands", undefined);

    const speedController = new SpeedController(settings);
    speedController.init();

    const pitchController = new PitchController(settings);
    pitchController.init();

    function promtCall(): void {
        speedController.promptSpeed();
        sendMessage(
            "sendPlaybackRateUpdate",
            speedController.getPlaybackRate()
        );
    }

    // Listen to messages

    // The MAIN world has no access to browser.runtime; it asks us to resolve
    // web-accessible resources (the pitch worklet).
    onWindowMessage("getExtensionUrl", async ({ data }) =>
        (browser.runtime.getURL as (path: string) => string)(data)
    );

    onMessage("speedUp", async () => {
        speedController.speedUp();
    });

    onMessage("speedDown", async () => {
        speedController.speedDown();
    });

    onMessage("resetSpeed", async () => {
        speedController.reset();
    });

    onMessage("promptSpeed", async () => {
        promtCall();
    });

    onMessage("promptSpeedPropagation", async (message) => {
        speedController.setPlaybackRate(message.data);
    });

    onMessage("getPlaybackRate", async () => {
        return speedController.getPlaybackRate();
    });

    onMessage("pitchUp", async () => {
        pitchController.pitchUp();
    });

    onMessage("pitchDown", async () => {
        pitchController.pitchDown();
    });

    onMessage("resetPitch", async () => {
        pitchController.resetPitch();
    });

    onMessage("getPitch", async () => {
        return pitchController.getPitch();
    });

    setupShortcutsBindings(settings, promtCall);
});
