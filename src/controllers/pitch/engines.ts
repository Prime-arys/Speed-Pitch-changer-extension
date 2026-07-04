import { SoundTouchNode } from "@soundtouchjs/audio-worklet";
import SignalsmithStretch from "signalsmith-stretch";
import type { PitchEngine } from "@/models/CommandsData";
import { resolveWorkletUrl } from "./workletUrl";

/** A created pitch node plus the engine-specific way to update its shift. */
export interface PitchNodeHandle {
    node: AudioNode;
    setSemitones(semitones: number): void;
}

const WORKLET_PATHS: Record<PitchEngine, string> = {
    "signalsmith-stretch": "/signalsmith-stretch-worklet.js",
    soundtouch: "/soundtouch-processor.js",
};

/**
 * Create a pitch node for the given engine on a context, initialized to the
 * given shift. All engines expose the same handle so the registry and router
 * stay engine-agnostic.
 */
export async function createPitchNode(
    engine: PitchEngine,
    ctx: AudioContext,
    semitones: number
): Promise<PitchNodeHandle> {
    const url = await resolveWorkletUrl(WORKLET_PATHS[engine]);

    switch (engine) {
        case "soundtouch": {
            await SoundTouchNode.register(ctx, url);
            const node = new SoundTouchNode({ context: ctx });
            node.pitchSemitones.value = semitones;
            return {
                node,
                setSemitones: (s) => {
                    node.pitchSemitones.value = s;
                },
            };
        }
        case "signalsmith-stretch": {
            // The module resolves its worklet script through this static URL.
            (
                SignalsmithStretch as unknown as { moduleUrl?: string }
            ).moduleUrl = url;
            const node = await SignalsmithStretch(ctx, {
                numberOfInputs: 1,
                numberOfOutputs: 1,
                outputChannelCount: [2],
            });
            await node.schedule({ active: true, semitones });
            return {
                node,
                setSemitones: (s) => void node.schedule({ semitones: s }),
            };
        }
    }
}
