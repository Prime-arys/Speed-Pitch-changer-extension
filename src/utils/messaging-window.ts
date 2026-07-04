import { defineWindowMessaging } from "@webext-core/messaging/page";
import type { PitchEngine } from "@/models/CommandsData";

export interface WindowProtocolMap {
    /**
     * send : Injected Script / Window
     * on : Content Script
     */
    getExtensionWebAccessibleUrl(): Promise<string>;
    getPitchEngine(): Promise<PitchEngine>;

    /**
     * send : Content Script
     * on : Injected Script / Window
     */
    setPitch(semitones: number): Promise<void>;
    getPitch(): Promise<number>;
}

export const { sendMessage: sendWindowMessage, onMessage: onWindowMessage } =
    defineWindowMessaging<WindowProtocolMap>({
        namespace: "speed-pitch-changer_window-messaging",
    });
