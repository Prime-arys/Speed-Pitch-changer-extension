import { defineWindowMessaging } from "@webext-core/messaging/page";
import type { MediaSummary } from "@/media/Media";
import type { SpeedSettings } from "@/effects/SpeedEffect";

/**
 * Bridge between the isolated content script and the MAIN world script.
 *
 * Only plain values cross it: the isolated side decides *what* to apply
 * (settings, presets, shortcuts) and the MAIN world side, which is the only one
 * that can see the page's media, decides *how* to apply it.
 */
export interface WindowProtocolMap {
    /**
     * send : Content Script
     * on : MAIN world
     */
    setSpeed(settings: SpeedSettings): Promise<void>;
    getSpeed(): Promise<SpeedSettings>;
    setPitch(semitones: number): Promise<void>;
    getPitch(): Promise<number>;
    /** What the registry currently holds, for the popup and for debugging. */
    getDetectedMedia(): Promise<MediaSummary>;

    /**
     * send : MAIN world
     * on : Content Script
     *
     * The MAIN world has no `browser.runtime`, so it asks for the URL of
     * web-accessible resources (the pitch worklet).
     */
    getExtensionUrl(path: string): Promise<string>;
}

export const { sendMessage: sendWindowMessage, onMessage: onWindowMessage } =
    defineWindowMessaging<WindowProtocolMap>({
        namespace: "speed-pitch-changer_window-messaging",
    });
