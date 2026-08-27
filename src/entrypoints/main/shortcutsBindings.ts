import type { CommandsData } from "@/models/CommandsData";
import { sendMessage } from "@/utils/messaging";

export function setupShortcutsBindings(
    settings: CommandsData,
    promtCallback: () => void
): void {
    window.addEventListener("keydown", (event) => {
        if (event.repeat) return;

        const activeElement = document.activeElement;
        if (
            activeElement &&
            (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                (activeElement as HTMLElement).isContentEditable) &&
            settings.switch.ignore_text_field // this behavior is configurable
        ) {
            return;
        }

        switch (event.code) {
            case settings.commands.speedUp:
                sendMessage("callSpeedUp");
                event.preventDefault();
                break;
            case settings.commands.speedDown:
                sendMessage("callSpeedDown");
                event.preventDefault();
                break;
            case settings.commands.reset:
                sendMessage("callResetSpeed");
                event.preventDefault();
                break;
            case settings.commands.speedSet:
                promtCallback();
                event.preventDefault();
                break;
        }
    });
}
