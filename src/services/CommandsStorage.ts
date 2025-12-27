import {
    CommandsData,
    Commands,
    Switch,
    Radio,
    SpeedPitch,
    CustomSpeedPitch,
} from "@/models/CommandsData";
import { extensionStorageCommands } from "@/utils/extensionStorage";

export class CommandsStorage extends CommandsData {
    constructor() {
        super();
    }

    async load(): Promise<undefined> {
        const data = await extensionStorageCommands.getItem("commands");
        if (data) {
            this.init(data);
        } else {
            this.init(defaultCommandsStorage);
            this.save();
        }
    }

    static async loadStatic(): Promise<CommandsStorage> {
        const data = await extensionStorageCommands.getItem("commands");
        if (data) {
            const commandsStorage = new CommandsStorage();
            commandsStorage.init(data);
            return commandsStorage;
        } else {
            const commandsStorage = new CommandsStorage();
            commandsStorage.init(defaultCommandsStorage);
            await commandsStorage.save();
            return commandsStorage;
        }
    }

    async save(): Promise<undefined> {
        await extensionStorageCommands.setItem("commands", this.toJSON());
    }

    async reset(): Promise<undefined> {
        this.init(defaultCommandsStorage);
        this.save();
    }

    async upgradeCheck(): Promise<boolean> {
        const data = await extensionStorageCommands.getItem("commands");
        if (data && data.version !== defaultCommandsStorage.version) {
            return true;
        }
        return false;
    }

    async upgrade(): Promise<undefined> {
        const data = await extensionStorageCommands.getItem("commands");
        if (data && data.version !== defaultCommandsStorage.version) {
            Object.assign(data, defaultCommandsStorage);
            this.init(data);
            this.save();
        }
    }

    static initStorageObject(commandsData: CommandsData): CommandsStorage {
        const commandsStorage = new CommandsStorage();
        commandsStorage.init(commandsData);
        return commandsStorage;
    }
}

export const defaultCommandsStorage: CommandsData = new CommandsData({
    version: 2,
    commands: new Commands({
        reset: "NumpadMultiply",
        speedUp: "NumpadAdd",
        speedDown: "NumpadSubtract",
        speedSet: "NumpadDecimal",
    }),
    switch: new Switch({
        preserve_pitch: false,
        shortcuts: true,
        ignore_text_field: true,
    }),
    radio: new Radio({
        speed: new SpeedPitch({
            preset: 1,
            custom: new CustomSpeedPitch({
                plus_minus: 0.1,
                multiply_divide: 1.2,
            }),
        }),
        pitch: new SpeedPitch({
            preset: 1,
            custom: new CustomSpeedPitch({
                plus_minus: 0.1,
                multiply_divide: 1.2,
            }),
        }),
    }),
});
