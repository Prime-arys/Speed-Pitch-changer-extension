import type { SpeedSettings } from "@/effects/SpeedEffect";
import type { CommandsData } from "@/models/CommandsData";
import { sendWindowMessage } from "@/utils/messaging-window";
import { SEMITONE_MULTIPLIER, semitoneToRate } from "@/utils/semitone";

function parseSemitone(val: string): number {
    // ? may avoid magic "t"
    if (val[0] === "t") {
        return semitoneToRate(parseFloat(val.slice(1)));
    }
    return parseFloat(val);
}

/**
 * Speed commands, on the isolated side.
 *
 * Turns user intent (a shortcut, a popup button, a prompt) into a playback
 * rate, following the presets in the settings, then hands that rate to the
 * MAIN world where the media live. It never touches a media element itself.
 */
export class SpeedController {
    private playbackRate: number = 1;
    private preservesPitch: boolean;
    private settings: CommandsData;

    constructor(settings: CommandsData) {
        this.settings = settings;
        this.preservesPitch = settings.switch.preserve_pitch;
    }

    /** Send the initial state, so the page starts with the configured options. */
    init(): void {
        this.push();
    }

    speedUp(): void {
        this.playbackRate = this.updateSpeedUp(
            this.playbackRate,
            this.settings.radio.speed.preset
        );
        this.push();
    }

    speedDown(): void {
        this.playbackRate = this.updateSpeedDown(
            this.playbackRate,
            this.settings.radio.speed.preset
        );
        this.push();
    }

    reset(): void {
        this.playbackRate = 1;
        this.push();
    }

    promptSpeed(): void {
        const input = prompt(
            "New playback speed, t[value] to set as semitone:", // ? may avoid magic "t"
            this.playbackRate.toString()
        );
        if (input) {
            this.playbackRate = parseSemitone(input);
            this.push();
        }
    }

    getPlaybackRate(): number {
        return this.playbackRate;
    }

    /**
     * Directly set the playback rate
     * (will also push the change to the media)
     * @param rate
     */
    setPlaybackRate(rate: number): void {
        this.playbackRate = rate;
        this.push();
    }

    setPreservesPitch(preservesPitch: boolean): void {
        this.preservesPitch = preservesPitch;
        this.push();
    }

    private get value(): SpeedSettings {
        return {
            rate: this.playbackRate,
            preservesPitch: this.preservesPitch,
        };
    }

    /** Hand the current state to the speed effect running in the MAIN world. */
    private push(): void {
        sendWindowMessage("setSpeed", this.value).catch((error) => {
            console.error("[SpeedController] MAIN world unreachable", error);
        });
    }

    private updateSpeedUp(playbackRate: number, preset: number): number {
        switch (preset) {
            case 1:
                return playbackRate * SEMITONE_MULTIPLIER;
            case 2:
                return (
                    playbackRate * this.settings.radio.speed.custom.multiply_divide
                );
            case 3:
                return (
                    playbackRate + this.settings.radio.speed.custom.plus_minus
                );
            default:
                return playbackRate;
        }
    }

    private updateSpeedDown(playbackRate: number, preset: number): number {
        switch (preset) {
            case 1:
                return playbackRate / SEMITONE_MULTIPLIER;
            case 2:
                return (
                    playbackRate / this.settings.radio.speed.custom.multiply_divide
                );
            case 3:
                return (
                    playbackRate - this.settings.radio?.speed.custom.plus_minus
                );
            default:
                return playbackRate;
        }
    }
}
