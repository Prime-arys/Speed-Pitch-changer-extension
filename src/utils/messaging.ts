import { defineExtensionMessaging } from '@webext-core/messaging';
import { ConfigData } from '@/models/ConfigData';
import { CommandsData } from '@/models/CommandsData';

export interface ProtocolMap {
  // From Background to Content Script or popup (retrieved intents)
  getConfig(): Promise<ConfigData>;
  getCommands(): Promise<CommandsData>;
  getCurrentDomain(): Promise<string>;  // will return the domain of the current active tab

  // From Content Script (received intents)
  speedUp(): Promise<void>;
  speedDown(): Promise<void>;
  resetSpeed(): Promise<void>;
  promptSpeed(): Promise<void>;
  promptSpeedPropagation(playbackRate: number): Promise<void>;
  getPlaybackRate(): Promise<number>;

  // From Content Script or Popup (sended intents)
  sendPlaybackRateUpdate(playbackRate: number): Promise<void>;
  callSpeedUp(): Promise<void>;
  callSpeedDown(): Promise<void>;
  callResetSpeed(): Promise<void>;
  callPromptSpeed(): Promise<void>;

  // From Popup to Background to Content Script (retrieved intents)
  retrieveCurrentPlaybackRate(): Promise<number | undefined>;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
