import { sendWindowMessage, onWindowMessage } from "@/utils/messaging-window";
import { PitchController } from "@/controllers/PitchController";
import type { CommandsData } from "@/models/CommandsData";

export default defineUnlistedScript(async () => {
    console.log("Hello from main-world ###");

    let commands: CommandsData;
    try {
        commands = await sendWindowMessage("getCommands");
    } catch (error) {
        console.error("[MainWorld] Failed to load commands:", error);
        return;
    }

    const pitchController = new PitchController(commands);
    pitchController.init();

    onWindowMessage("pitchUp", async (message) => {
        await pitchController.pitchUp(message?.data);
    });

    onWindowMessage("pitchDown", async (message) => {
        await pitchController.pitchDown(message?.data);
    });

    onWindowMessage("resetPitch", async () => {
        await pitchController.resetPitch();
    });

    onWindowMessage("retrieveCurrentPitch", async () => {
        return pitchController.getPitch();
    });

});
