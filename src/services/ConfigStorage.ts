import { ConfigData } from "@/models/ConfigData";
import { extensionStorageConfig } from "@/utils/extensionStorage";

export class ConfigStorage extends ConfigData {
    constructor() {
        super();
    }

    async load(): Promise<undefined> {
        const data = await extensionStorageConfig.getItem("config");
        if (data) {
            this.init(data);
        } else {
            this.init(defaultConfigStorage);
            this.save();
        }
    }

    static async loadStatic(): Promise<ConfigStorage> {
        const data = await extensionStorageConfig.getItem("config");
        if (data) {
            const configStorage = new ConfigStorage();
            configStorage.init(data);
            return configStorage;
        } else {
            const configStorage = new ConfigStorage();
            configStorage.init(defaultConfigStorage);
            await configStorage.save();
            return configStorage;
        }
    }

    async save(): Promise<undefined> {
        await extensionStorageConfig.setItem("config", this.toJSON());
    }

    async reset(): Promise<undefined> {
        this.init(defaultConfigStorage);
        this.save();
    }

    async upgradeCheck(): Promise<boolean> {
        const data = await extensionStorageConfig.getItem("config");
        if (data && data.version !== defaultConfigStorage.version) {
            return true;
        }
        return false;
    }

    async upgrade(): Promise<undefined> {
        const data = await extensionStorageConfig.getItem("config");
        if (data && data.version !== defaultConfigStorage.version) {
            Object.assign(data, defaultConfigStorage);
            this.init(data);
            this.save();
        }
    }

    static initStorageObject(configData: ConfigData): ConfigStorage {
        const configStorage = new ConfigStorage();
        configStorage.init(configData);
        return configStorage;
    }
}


export const defaultConfigStorage: ConfigData = new ConfigData({
    version: 2,
    enabled: true,
    blacklist: [],
    specificList: ["open.spotify.com"],
});
