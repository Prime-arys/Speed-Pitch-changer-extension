import JObject from './jobject.js';

export default class Settings {
    constructor(_settings = new JObject()) {
        this.settings = _settings
        this.selfApply();

    }

    default = new JObject({
        version: 2,
        commands: {
            reset: {
                code: "NumpadMultiply",
                key: "MULTIPLY",
            },
            speedUP: {
                code: "NumpadAdd",
                key: "ADD",
            },
            speedDOWN: {
                code: "NumpadSubtract",
                key: "SUBTRACT",
            },
            speedSET: {
                code: "NumpadDecimal",
                key: "DECIMAL",
            },
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
                    plus_minus: 1.1,
                    multiply_divide: 1.1,
                },
            },
            pitch: {
                preset: 1,
                custom: {
                    plus_minus: 1.1,
                },
            },
        },
    });

    set_default() {
        this.settings = this.default
    }

    selfApply() {
        for (const [key, value] of Object.entries(this.settings)) {
            if (value instanceof JObject) {
                this[key] = value;
            } else if (typeof value === 'object' && value !== null) {
                this[key] = new JObject(value);
            } else {
                this[key] = value;
            }
        }
    }


}