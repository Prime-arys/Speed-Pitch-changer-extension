import { sendMessage, onMessage } from "@/utils/messaging";
import {
    onWindowMessage,
    sendWindowMessage,
} from "@/utils/messaging-window";
import { SpeedController } from "@/controllers/SpeedController";
import { setupShortcutsBindings } from "./shortcutsBindings";

export default defineUnlistedScript(async () => {
    console.log("Hello from isolated world");

    // Get settings from background
    const settings = await sendMessage("getCommands", undefined);

    // Initialize speed controller
    const speedController = new SpeedController(settings);
    speedController.init();

    // Pitch processing runs in the MAIN world (see entrypoints/main-world) so it
    // can patch the page's own AudioContext. Resolve the per-keypress semitone
    // step from settings here, where the settings live.
    const pitchStep = (): number =>
        settings?.radio.pitch.preset === 2
            ? settings.radio.pitch.custom.plus_minus
            : 1;

    // The SignalsmithStretchConfigurator (running in the MAIN world) asks the
    // content script for the extension's base URL to resolve the worklet path.
    onWindowMessage("getExtensionWebAccessibleUrl", async () =>
        browser.runtime.getURL("/")
    );

    function promtCall(): void {
        speedController.promptSpeed();
        sendMessage(
            "sendPlaybackRateUpdate",
            speedController.getPlaybackRate()
        );
    }

    // Listen to messages
    /* onMessage("getCurrentDomain", async () => {
        return window.location.hostname;
    }); */ // ? Might be useless

    onMessage("speedUp", async () => {
        console.log("speedUp received");
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
        await sendWindowMessage("pitchUp", pitchStep());
    });

    onMessage("pitchDown", async () => {
        await sendWindowMessage("pitchDown", pitchStep());
    });

    onMessage("resetPitch", async () => {
        await sendWindowMessage("resetPitch");
    });

    onMessage("getPitch", async () => {
        return (await sendWindowMessage("retrieveCurrentPitch")) ?? 0;
    });

    setupShortcutsBindings(settings, promtCall);
});
