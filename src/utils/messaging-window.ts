import { defineWindowMessaging } from "@webext-core/messaging/page";
import type { ConfigData } from "@/models/ConfigData";
import type { CommandsData } from "@/models/CommandsData";


export interface WindowProtocolMap {
    /**
     * send : Injected Script / Window
     * on : Content Script
     */
    getConfig(): Promise<ConfigData>;
    getCommands(): Promise<CommandsData>;
    getExtensionWebAccessibleUrl(): Promise<string>;

    /**
     * send : Content Script
     * on : Injected Script / Window
     */
    pitchUp(amount?: number): Promise<void>;
    pitchDown(amount?: number): Promise<void>;
    resetPitch(): Promise<void>;
    retrieveCurrentPitch(): Promise<number | undefined>;
}

export const { sendMessage: sendWindowMessage, onMessage: onWindowMessage } =
    defineWindowMessaging<WindowProtocolMap>({
        namespace: "speed-pitch-changer_window-messaging",
    });
