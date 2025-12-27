import { sendMessage, onMessage } from "@/utils/messaging";
import { SpeedController } from "@/entrypoints/main/SpeedController";
import { setupShortcutsBindings } from "./shortcutsBindings";

export default defineUnlistedScript(async () => {
    console.log("Hello from isolated world");

    // Get settings from background
    const settings = await sendMessage("getCommands", undefined);

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

    // bind keyboard shortcuts to the controller
    /* window.addEventListener("keydown", (event) => {
        if (event.repeat) return;

        const activeElement = document.activeElement;
        if (
            activeElement &&
            (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                (activeElement as HTMLElement).isContentEditable)
        ) {
            return;
        }

        switch (event.code) {
            case settings.commands.speedUp:
                speedController.speedUp();
                event.preventDefault();
                break;
            case settings.commands.speedDown:
                speedController.speedDown();
                event.preventDefault();
                break;
            case settings.commands.reset:
                speedController.reset();
                event.preventDefault();
                break;
            case settings.commands.speedSet:
                speedController.promptSpeed();
                event.preventDefault();
                break;
        }
    }); */

    setupShortcutsBindings(settings, promtCall);
});
