import { createEffects } from "@/effects";
import { installMediaDetection } from "@/media/detection";
import { MediaRegistry } from "@/media/MediaRegistry";
import { onWindowMessage } from "@/utils/messaging-window";

/**
 * MAIN world, document_start.
 *
 * The only place that touches the page's media: it owns the registry, installs
 * every detector and runs every effect. The isolated content script cannot see
 * any of it — page objects do not cross worlds — so it only sends values in
 * through window messaging.
 *
 * Detection is installed before the effects: the registry replays what it
 * already holds to each new subscriber, so nothing is missed either way.
 */
export default defineUnlistedScript(() => {
    const registry = new MediaRegistry();
    installMediaDetection(registry);

    const effects = createEffects(registry);

    onWindowMessage("setSpeed", async ({ data }) => effects.speed.set(data));
    onWindowMessage("getSpeed", async () => effects.speed.get());

    onWindowMessage("setPitch", async ({ data }) => effects.pitch.set(data));
    onWindowMessage("getPitch", async () => effects.pitch.get());

    onWindowMessage("getDetectedMedia", async () => registry.summary());
});
