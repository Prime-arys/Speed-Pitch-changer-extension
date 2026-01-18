import { sendMessage, onMessage } from "@/utils/messaging";
import { SpeedController } from "./SpeedController";
import { PitchController } from "./PitchController";
import { setupShortcutsBindings } from "./shortcutsBindings";

export default defineUnlistedScript(async () => {
    console.log("Hello from isolated world");

    // Get settings from background
    const settings = await sendMessage("getCommands", undefined);

    // Initialize speed controller
    const speedController = new SpeedController(settings);
    speedController.init();

    // Initialize pitch controller
    const pitchController = new PitchController();
    pitchController.init();

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
        await pitchController.pitchUp();
    });

    onMessage("pitchDown", async () => {
        await pitchController.pitchDown();
    });

    onMessage("resetPitch", async () => {
        await pitchController.resetPitch();
    });

    onMessage("getPitch", async () => {
        return pitchController.getPitch();
    });

    setupShortcutsBindings(settings, promtCall);
});
