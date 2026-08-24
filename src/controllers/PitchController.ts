import type { PitchSettings } from "@/effects/PitchEffect";
import {
    type CommandsData,
    type PitchEngine,
} from "@/models/CommandsData";
import { sendWindowMessage } from "@/utils/messaging-window";

/**
 * Pitch commands, on the isolated side.
 *
 * The mirror of {@link import("./SpeedController").SpeedController}: it applies
 * the presets from the settings to get a number of semitones and hands it to
 * the pitch effect running in the MAIN world, which is the only side able to
 * reach the page's audio graph.
 */
export class PitchController {
    private semitones: number = 0;
    private settings: CommandsData;

    constructor(settings: CommandsData) {
        this.settings = settings;
    }

    /** Send the initial state (a no-op shift, unless one is restored later). */
    init(): void {
        this.push();
    }

    /** Semitones added by one step, per the configured preset. */
    private get step(): number {
        switch (this.settings.radio.pitch.preset) {
            case 2:
                return this.settings.radio.pitch.custom.plus_minus;
            case 1:
            default:
                return 1;
        }
    }

    pitchUp(): void {
        this.setPitch(this.semitones + this.step);
    }

    pitchDown(): void {
        this.setPitch(this.semitones - this.step);
    }

    resetPitch(): void {
        this.setPitch(0);
    }

    /**
     * Directly set the pitch shift
     * (will also push the change to the media)
     * @param semitones - positive raises the pitch, negative lowers it
     */
    setPitch(semitones: number): void {
        this.semitones = semitones;
        this.push();
    }

    getPitch(): number {
        return this.semitones;
    }

    /** The engine picked in the settings (the default one until set). */
    private get engine(): PitchEngine {
        return this.settings.pitch.engine;
    }

    private get value(): PitchSettings {
        return { semitones: this.semitones, engine: this.engine };
    }

    /** Hand the current state to the pitch effect running in the MAIN world. */
    private push(): void {
        sendWindowMessage("setPitch", this.value).catch((error) => {
            console.error("[PitchController] MAIN world unreachable", error);
        });
    }
}
