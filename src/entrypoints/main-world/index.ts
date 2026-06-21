import { onWindowMessage } from "@/utils/messaging-window";
import { PitchController } from "@/controllers/PitchController";

export default defineUnlistedScript(() => {
    // Install AudioContext/AudioNode patches synchronously at document_start,
    // before the page builds its own audio graph.
    const pitchController = new PitchController();
    pitchController.init();

    onWindowMessage("pitchUp", ({ data }) => pitchController.pitchUp(data ?? 1));
    onWindowMessage("pitchDown", ({ data }) =>
        pitchController.pitchDown(data ?? 1)
    );
    onWindowMessage("resetPitch", () => pitchController.resetPitch());
    onWindowMessage("retrieveCurrentPitch", async () =>
        pitchController.getPitch()
    );
});
