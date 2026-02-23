import { storage } from "#imports";
import { ConfigData } from "@/models/ConfigData";

export class ConfigStorage {
    private dataStorage: globalThis.WxtStorageItem<ConfigData, Record<string, never>>;

    constructor() {
        this.dataStorage = storage.defineItem<ConfigData>("local:config", {
            version: 1,
            init: () => defaultConfigStorage,
        });
    }

    async save(data: ConfigData): Promise<void> {
        await this.dataStorage.setValue(data);
    }

    async load(): Promise<ConfigData> {
        return this.dataStorage.getValue();
    }

    async reset(): Promise<void> {
        await this.dataStorage.setValue(defaultConfigStorage);
    }
}

export const defaultConfigStorage: ConfigData = {
    enabled: true,
    blacklist: [],
    specificList: ["open.spotify.com"],
};
