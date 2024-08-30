import Settings from "./settings.js";
import JObject from './jobject.js';


export default class SettingsBG extends Settings {

    constructor(rkc = false) {
        super();
        this._rkc = rkc; // old settings format
        this._empty = false;
        this.#init();
        this.selfApply();
    }

    #init() {
        if (this._rkc != false) {
            //let rkc = this._rkc;
            this.set_default(); // set default settings (it will reset rkc)
            this.transistion_settings_from_rkc(this._rkc);
            this.save();
        }

        let _settings = this.load();

        if (_settings && this._rkc == false) {
            // check if all settings are present
            let settings_keys = Object.keys(this.settings.toObject());
            let default_keys = Object.keys(this.default.toObject());

            let has_missing_keys = false;
            for (let key of default_keys) {
                if (!settings_keys.includes(key)) {
                    this.settings.set(key, this.default.get(key));
                    has_missing_keys = true;
                }
            }
            if (has_missing_keys) {
                this.save();
            }

        }
        else {
            this._empty = true;
        }

    }

    transistion_settings_from_rkc(rkc) {

        function bool(value) {
            return value === 'true' || value === true || value === 1 || value === '1';
        }

        if (rkc.length < 10) {
            for (let i = rkc.length; i < 10; i++) {
                rkc.push(null);
            }
        }

        let mergeObject = {};

        if (rkc[0] !== null) {
            mergeObject.commands = mergeObject.commands || {};
            mergeObject.commands.reset = {
                code: keyCodeToCodeMap[parseInt(rkc[0])],
                key: keyboardMap[rkc[0]]
            };
        }

        if (rkc[1] !== null) {
            mergeObject.commands = mergeObject.commands || {};
            mergeObject.commands.speedUP = {
                code: keyCodeToCodeMap[parseInt(rkc[1])],
                key: keyboardMap[rkc[1]]
            };
        }

        if (rkc[2] !== null) {
            mergeObject.commands = mergeObject.commands || {};
            mergeObject.commands.speedDOWN = {
                code: keyCodeToCodeMap[parseInt(rkc[2])],
                key: keyboardMap[rkc[2]]
            };
        }

        if (rkc[3] !== null) {
            mergeObject.commands = mergeObject.commands || {};
            mergeObject.commands.speedSET = {
                code: keyCodeToCodeMap[parseInt(rkc[3])],
                key: keyboardMap[rkc[3]]
            };
        }

        if (rkc[4] !== null) {
            mergeObject.switch = mergeObject.switch || {};
            mergeObject.switch.preserve_pitch = bool(rkc[4]);
        }

        if (rkc[5] !== null) {
            mergeObject.switch = mergeObject.switch || {};
            mergeObject.switch.shortcuts = bool(rkc[5]);
        }

        if (rkc[6] !== null || rkc[7] !== null || rkc[8] !== null) {
            mergeObject.radio = { speed: { custom: {} } };
            if (rkc[6] !== null) mergeObject.radio.speed.preset = parseInt(rkc[6]);
            if (rkc[7] !== null) mergeObject.radio.speed.custom.plus_minus = parseInt(rkc[7]);
            if (rkc[8] !== null) mergeObject.radio.speed.custom.multiply_divide = parseInt(rkc[8]);
        }

        this.settings.deepMerge(mergeObject);
    }

    save() {
        localStorage.setItem('settings', this.settings.toJSON());
    }

    load() {
        try {
            let reg_settings = localStorage.getItem('settings');
            if (reg_settings) {
                this.settings = JObject.fromJSON(reg_settings);
                //return JObject.fromJSON(reg_settings);
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    reset() {
        this.set_default();
        this.selfApply();
        this.save();
    }


}


