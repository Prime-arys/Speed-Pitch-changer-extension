import { defineExtensionStorage } from '@webext-core/storage';
import { CommandsData } from '@/models/CommandsData';
import { ConfigData } from '@/models/ConfigData';


export const extensionStorageCommands = defineExtensionStorage<CommandsData>(
  browser.storage.local,
);

export const extensionStorageConfig = defineExtensionStorage<ConfigData>(
  browser.storage.local,
);

