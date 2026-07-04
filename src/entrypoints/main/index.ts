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

    // The pitch pipeline (running in the MAIN world) asks the content script
    // for the extension's base URL to resolve worklet paths, and for the
    // engine selected in settings.
    onWindowMessage("getExtensionWebAccessibleUrl", async () =>
        browser.runtime.getURL("/")
    );
    onWindowMessage("getPitchEngine", async () =>
        settings?.pitch?.engine ?? "signalsmith-stretch"
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



    // Pitch processing runs in the MAIN world (see entrypoints/main-world),
    // relayed through window messaging.
    onMessage("setPitch", async (message) => {
        await sendWindowMessage("setPitch", message.data);
    });

    onMessage("getPitch", async () => {
        return (await sendWindowMessage("getPitch")) ?? 0;
    });

    setupShortcutsBindings(settings, promtCall);
});
