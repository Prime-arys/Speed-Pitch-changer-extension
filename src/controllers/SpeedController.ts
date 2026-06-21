import { CommandsData } from "@/models/CommandsData";
import { SEMITONE_MULTIPLIER, semitoneToRate } from "@/utils/semitone";

const ELEM_SELECTOR = "video,audio";

function parseSemitone(val: string): number {
    if (val[0] === "t") {
        return semitoneToRate(parseFloat(val.slice(1)));
    }
    return parseFloat(val);
}

export class SpeedController {
    private playbackRate: number = 1;
    private preservesPitch: boolean;
    private settings: CommandsData;

    constructor(settings: CommandsData) {
        this.settings = settings;
        this.preservesPitch = settings.switch?.preserve_pitch ?? true;
    }

    init(): void {
        if (document) {
            new MutationObserver(() => {
                this.updateVideos();
            }).observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true,
            });
            this.updateVideos();
        }
    }

    getDOMMediaElements(): NodeListOf<HTMLMediaElement> {
        return document.querySelectorAll<HTMLMediaElement>(ELEM_SELECTOR);
    }

    updateVideos(): void {
        const elements = this.getDOMMediaElements();
        elements.forEach((element) => {
            const mediaElement = element as HTMLMediaElement & {
                mozPreservesPitch?: boolean;
                [key: string]: unknown;
            };

            mediaElement.playbackRate = this.playbackRate;
            mediaElement.defaultPlaybackRate = this.playbackRate;
            mediaElement[`playbackRate_origin`] = this.playbackRate;
            mediaElement[`defaultPlaybackRate_origin`] = this.playbackRate;
            mediaElement.mozPreservesPitch = this.preservesPitch;
            mediaElement.preservesPitch = this.preservesPitch;
        });
    }

    speedUp(): void {
        this.playbackRate = this.updateSpeedUp(
            this.playbackRate,
            this.settings.radio?.speed.preset ?? 1
        );
        this.updateVideos();
    }

    speedDown(): void {
        this.playbackRate = this.updateSpeedDown(
            this.playbackRate,
            this.settings.radio?.speed.preset ?? 1
        );
        this.updateVideos();
    }

    reset(): void {
        this.playbackRate = 1;
        this.updateVideos();
    }

    promptSpeed(): void {
        const input = prompt(
            "New playback speed, t[value] to set as semitone:",
            this.playbackRate.toString()
        );
        if (input) {
            this.playbackRate = parseSemitone(input);
            this.updateVideos();
        }
    }

    getPlaybackRate(): number {
        return this.playbackRate;
    }

    /**
     * Directly set the playback rate
     * (will also call updateVideos() to apply the change)
     * @param rate 
     */
    setPlaybackRate(rate: number): void {
        this.playbackRate = rate;
        this.updateVideos();
    }

    private updateSpeedUp(playbackRate: number, preset: number): number {
        switch (preset) {
            case 1:
                return playbackRate * SEMITONE_MULTIPLIER;
            case 2:
                return (
                    playbackRate *
                    parseFloat(
                        this.settings.radio?.speed.custom.multiply_divide.toString() ||
                            "1"
                    )
                );
            case 3:
                return (
                    playbackRate +
                    parseFloat(
                        this.settings.radio?.speed.custom.plus_minus.toString() ||
                            "0"
                    )
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
                    playbackRate /
                    parseFloat(
                        this.settings.radio?.speed.custom.multiply_divide.toString() ||
                            "1"
                    )
                );
            case 3:
                return (
                    playbackRate -
                    parseFloat(
                        this.settings.radio?.speed.custom.plus_minus.toString() ||
                            "0"
                    )
                );
            default:
                return playbackRate;
        }
    }
}
