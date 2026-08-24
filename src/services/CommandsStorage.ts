import { storage } from "#imports";
import {
    DEFAULT_PITCH_ENGINE,
    type CommandsData,
} from "@/models/CommandsData";

export class CommandsStorage {
    private dataStorage: globalThis.WxtStorageItem<CommandsData, Record<string, never>>;

    constructor() {
        this.dataStorage = storage.defineItem<CommandsData>("local:commands", {
            version: 1,
            init: () => defaultCommandsStorage,
            
        });
    }

    async save(data: CommandsData): Promise<void> {
        await this.dataStorage.setValue(data);
    }

    async load(): Promise<CommandsData> {
        return this.dataStorage.getValue();
    }

    async reset(): Promise<void> {
        await this.dataStorage.setValue(defaultCommandsStorage);
    }
}

export const defaultCommandsStorage: CommandsData = {
    commands: {
        reset: "NumpadMultiply" as KeyboardEvent["code"],
        speedUp: "NumpadAdd" as KeyboardEvent["code"],
        speedDown: "NumpadSubtract" as KeyboardEvent["code"],
        speedSet: "NumpadDecimal" as KeyboardEvent["code"],
    },
    switch: {
        preserve_pitch: false,
        shortcuts: true,
        ignore_text_field: true,
    },
    radio: {
        speed: {
            preset: 1,
            custom: {
                plus_minus: 0.1,
                multiply_divide: 1.2,
            },
        },
        pitch: {
            preset: 1,
            custom: {
                plus_minus: 0.1,
                multiply_divide: 1.2,
            },
        },
    },
    pitch: {
        engine: DEFAULT_PITCH_ENGINE,
    },
};
