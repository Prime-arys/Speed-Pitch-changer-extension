import { sendMessage, onMessage } from "@/utils/messaging";
import { sendWindowMessage, onWindowMessage } from "@/utils/messaging-window";
import { SpeedController } from "@/controllers/SpeedController";
import { setupShortcutsBindings } from "./shortcutsBindings";

export default defineUnlistedScript(async () => {
    console.log("Hello from isolated world");

    // Get settings from background
    const settings = await sendMessage("getCommands", undefined);
    //const config = await sendMessage("getConfig", undefined);

    // Initialize speed controller
    const speedController = new SpeedController(settings);
    speedController.init();

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



    onMessage("pitchUp", async (message) => {
        await sendWindowMessage("pitchUp", message?.data);
    });

    onMessage("pitchDown", async (message) => {
        await sendWindowMessage("pitchDown", message?.data);
    });

    onMessage("resetPitch", async () => {
        await sendWindowMessage("resetPitch");
    });

    onMessage("getPitch", async () => {
        const currentPitch = await sendWindowMessage("retrieveCurrentPitch");
        return currentPitch ?? 0;
    });

    setupShortcutsBindings(settings, promtCall);



    // Content script / main world communication

    // ? may not expose to main world
    // onWindowMessage("getConfig", async () => {
    //     return config;
    // });

    onWindowMessage("getCommands", async () => {
        return settings;
    });

    onWindowMessage("getExtensionWebAccessibleUrl", async () => {
        return browser.runtime.getURL("");
    });

});
