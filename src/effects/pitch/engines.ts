import { SoundTouchNode } from "@soundtouchjs/audio-worklet";
import SignalsmithStretch from "signalsmith-stretch";
import type { PitchEngine } from "@/models/CommandsData";
import { resolveWorkletUrl } from "./workletUrl";

/** A live pitch node, plus the engine-specific way to drive it and drop it. */
export interface PitchNodeHandle {
    node: AudioNode;
    setSemitones(semitones: number): void;
    dispose(): void;
}

/** Worklet script of each engine, copied to `public/` on install. */
const WORKLET_PATHS: Record<PitchEngine, string> = {
    "signalsmith-stretch": "/signalsmith-stretch-worklet.js",
    soundtouch: "/soundtouch-processor.js",
};

/**
 * Contexts SoundTouch was already registered on: `addModule()` evaluates the
 * script again on every call and registering the same processor name twice
 * throws. (Signalsmith caches its own module promise per context.)
 */
const soundtouchRegistered = new WeakSet<BaseAudioContext>();

/**
 * Create a pitch node for an engine on a context, already set to the given
 * shift. Every engine is handed back through the same {@link PitchNodeHandle},
 * so nothing above this file knows which one is running.
 */
export async function createPitchNode(
    engine: PitchEngine,
    context: BaseAudioContext,
    semitones: number
): Promise<PitchNodeHandle> {
    const url = await resolveWorkletUrl(WORKLET_PATHS[engine]);

    switch (engine) {
        case "soundtouch": {
            if (!soundtouchRegistered.has(context)) {
                await SoundTouchNode.register(context, url);
                soundtouchRegistered.add(context);
            }
            const node = new SoundTouchNode({ context });
            node.pitchSemitones.value = semitones;
            return {
                node,
                setSemitones: (value) => {
                    node.pitchSemitones.value = value;
                },
                dispose: () => node.disconnect(),
            };
        }
        case "signalsmith-stretch": {
            // The module resolves its worklet script through this static URL.
            (
                SignalsmithStretch as unknown as { moduleUrl?: string }
            ).moduleUrl = url;

            const node = await SignalsmithStretch(context as AudioContext, {
                numberOfInputs: 1,
                numberOfOutputs: 1,
                outputChannelCount: [2],
            });
            // Live input only flows once the node is scheduled active.
            await node.schedule({ active: true, semitones });
            return {
                node,
                setSemitones: (value) => void node.schedule({ semitones: value }),
                dispose: () => {
                    node.disconnect();
                    void node.stop();
                },
            };
        }
    }
}
