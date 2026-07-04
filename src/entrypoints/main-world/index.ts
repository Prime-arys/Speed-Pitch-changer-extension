import { onWindowMessage } from "@/utils/messaging-window";
import { PitchController } from "@/controllers/PitchController";

export default defineUnlistedScript(() => {
    // Install AudioContext/AudioNode patches synchronously at document_start,
    // before the page builds its own audio graph.
    const pitchController = new PitchController();
    pitchController.init();

    onWindowMessage("setPitch", ({ data }) => pitchController.setPitch(data ?? 0));
    onWindowMessage("getPitch", async () => pitchController.getPitch());
});
