import { defineExtensionMessaging } from "@webext-core/messaging";
import type { ConfigData } from "@/models/ConfigData";
import type { CommandsData } from "@/models/CommandsData";

export interface ProtocolMap {
    /**
     * send : Content Script / Popup
     * on : Background
     */
    getConfig(): Promise<ConfigData>;
    getCommands(): Promise<CommandsData>;
    getCurrentDomain(): Promise<string>; // will return the domain of the current active tab

    sendPlaybackRateUpdate(playbackRate: number): Promise<void>;
    callSpeedUp(): Promise<void>;
    callSpeedDown(): Promise<void>;
    callResetSpeed(): Promise<void>;
    callPromptSpeed(): Promise<void>;
    callPitchUp(): Promise<void>;
    callPitchDown(): Promise<void>;
    callResetPitch(): Promise<void>;

    // (popup)
    retrieveCurrentPlaybackRate(): Promise<number | undefined>;
    retrieveCurrentPitch(): Promise<number | undefined>;

    /**
     * send : Background
     * on : Content Script
     */
    speedUp(): Promise<void>;
    speedDown(): Promise<void>;
    resetSpeed(): Promise<void>;
    promptSpeed(): Promise<void>;
    promptSpeedPropagation(playbackRate: number): Promise<void>;
    getPlaybackRate(): Promise<number>;
    pitchUp(): Promise<void>;
    pitchDown(): Promise<void>;
    resetPitch(): Promise<void>;
    getPitch(): Promise<number>;
}

export const { sendMessage, onMessage } =
    defineExtensionMessaging<ProtocolMap>();
