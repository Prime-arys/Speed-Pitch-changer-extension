import type { MediaRegistry } from "@/media/MediaRegistry";
import { DEFAULT_PITCH, PitchEffect } from "./PitchEffect";
import { DEFAULT_SPEED, SpeedEffect } from "./SpeedEffect";

export { MediaEffect } from "./MediaEffect";
export { PitchEffect, DEFAULT_PITCH, type PitchSettings } from "./PitchEffect";
export { SpeedEffect, DEFAULT_SPEED, type SpeedSettings } from "./SpeedEffect";

/** Every effect the extension can apply to the media of a page. */
export interface Effects {
    readonly speed: SpeedEffect;
    readonly pitch: PitchEffect;
}

/**
 * Build the effects on a registry and start them. Adding an effect means
 * adding it here and nothing else: it picks up the media already detected on
 * its own.
 */
export function createEffects(registry: MediaRegistry): Effects {
    const effects: Effects = {
        speed: new SpeedEffect(registry, DEFAULT_SPEED),
        pitch: new PitchEffect(registry, DEFAULT_PITCH),
    };

    Object.values(effects).forEach((effect) => effect.start());
    return effects;
}
