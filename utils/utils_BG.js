//Utilities Background
import { keyCodeToCodeMap, keyboardMap } from "./char_kcode.js";

//Shared

export function onError(error) {
    console.error(`Error: ${error}`);
}


//POP


export function message(head, body = null) {
    return new Promise(function (resolve) {
        browser.runtime.sendMessage({ type: head, val: body }).then(response => {
            if (response !== undefined) {
                resolve(response);
            }
      }).catch(onError);
    });
}
  

//Background

export async function register(hosts,myfile,run,blacklist) {
    //console.log(blacklist);
    return await browser.contentScripts.register({
      "matches": hosts,
      "excludeMatches": blacklist,
      "js": [{file: myfile}], // "./file.js"
      "allFrames": true,
      "runAt": run, // "document_idle" | "document_start"
      "matchAboutBlank": true
    });
  
}
  
export async function BWlist_manager(blacklist, action, domain, listHost = "Xytspch_blacklist") {
    //console.log("Blacklist manager");
    domain = "*://"+domain+"/*";
    if (action == "add") {
        //console.log("Adding domain to blacklist");
        blacklist.push(domain);
        localStorage.setItem(listHost, blacklist);
    }
    else if (action == "del") {
        //console.log("Removing domain from blacklist");
      var index = blacklist.indexOf(domain);
      if (index > -1) {
          blacklist.splice(index, 1);
          localStorage.setItem(listHost, blacklist);
        }
        else {
          console.log("Domain not found in blacklist");
        }
    }
    else if (action == "get") {
        //console.log("Getting blacklist");
      return blacklist;
    }
    else if (action == "is_in") {
        //console.log("Checking if domain is in blacklist");
        //console.log(blacklist.includes(domain));
      return blacklist.includes(domain);
    }
    else {
      return false;
    }
}

  

export class Settings {

  constructor(rkc = false) {
    this.version = 2;
    this.commands_code_reset = null;
    this.commands_code_speedUP = null;
    this.commands_code_speedDOWN = null;
    this.commands_code_speedSET = null;
    this.switch_preserve_pitch = null;
    this.switch_shortcuts = null;
    this.switch_ignore_text_field = null;
    this.radio_speed_preset = null;
    this.radio_speed_custom_plus_minus = null;
    this.radio_speed_custom_multiply_divide = null;
    this.radio_pitch_preset = null;
    this.radio_pitch_custom_plus_minus = null;
    this.rkc = rkc; // rkc is an array of 10 elements (old settings format)
    this.init();
  }


  init() {

    
    if (this.rkc != false) {
      let rkc = this.rkc;
      this.set_default(); // set default settings (it will reset rkc)
      this.transistion_settings_from_rkc(rkc);
      this.save();
    }

    let settings = this.load();

    if (settings && this.rkc == false) {
      Object.assign(this, settings);
      // check if all settings are present
      let default_settings = Object.keys(this);
      let loaded_settings = Object.keys(settings);
      let missing_settings = default_settings.filter(setting => !loaded_settings.includes(setting));
      // check if all settings elements are present
      if (missing_settings.length > 0) {
        this.update(settings);
      }
      // check if all settings are valid (not null)
      let invalid_settings = Object.keys(this).filter(setting => this[setting] == null);
      if (invalid_settings.length > 0) {
        this.update_null_settings(invalid_settings);
      }

    }
    
    else {
      // if no settings are found, set default settings
      this.set_default();
      this.save();
    }
  }

  set_default() {
    this.version = 2;
    /* this.commands_reset = 106;
    this.commands_speedUP = 107;
    this.commands_speedDOWN = 109;
    this.commands_speedSET = 110; */
    this.commands_code_reset = {
      code: 'NumpadMultiply',
      key: '*'
    }
    this.commands_code_speedUP = {
      code: 'NumpadAdd',
      key: '+'
    }
    this.commands_code_speedDOWN = {
      code: 'NumpadSubtract',
      key: '-'
    }
    this.commands_code_speedSET = {
      code: 'NumpadDecimal',
      key: '.'
    }
    this.switch_preserve_pitch = false;
    this.switch_shortcuts = true;
    this.switch_ignore_text_field = true;
    this.radio_speed_preset = 1;
    this.radio_speed_custom_plus_minus = 1.1;
    this.radio_speed_custom_multiply_divide = 1.1;
    this.radio_pitch_preset = 1;
    this.radio_pitch_custom_plus_minus = 1.1;
    this.rkc = false;
  }


  get_all() {
    return this;
  }

  get(setting) {
    return this[setting]; //this[setting] is equivalent to this.setting
  }

  set(setting, value) {
    this[setting] = value;
  }

  save() {
    localStorage.setItem('Xytspch_sett', JSON.stringify(this));
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem('Xytspch_sett'));
    }
    catch (e) {
      //console.log("Error loading settings");
      return false;
    }
  }

  reset() {
    this.set_default();
    this.save();
  }

  export() {
    return JSON.stringify(this);
  }

  import(json) {
    this.set_default();
    Object.assign(this, JSON.parse(json));
    this.save();
  }

  update(new_settings) {
    this.set_default();
    Object.assign(this, new_settings);
    this.save();
  }

  update_null_settings(settings) {
    console.log(this.default);
    settings.forEach(setting => {
      this[setting] = this.default[setting];
    });
    this.save();
  }

  
  transistion_settings_from_rkc(rkc) {

    function bool(value) {
      if (value == 1 || value == "true") {
        return true;
      }
      else {
        return false;
      }
    }

    console.log("Transistion settings from rkc");
    console.log(rkc);
    console.log(rkc.length);
    if (rkc.length < 10) {
      for (let i = rkc.length; i < 10; i++) {
        rkc.push(null);
      }
    }

    /* this.commands_reset = parseInt(rkc[0]);
    this.commands_speedUP = parseInt(rkc[1]);
    this.commands_speedDOWN = parseInt(rkc[2]);
    this.commands_speedSET = parseInt(rkc[3]); */
    this.commands_code_reset = rkc[0] === null ? null : {
      code: keyCodeToCodeMap[parseInt(rkc[0])],
      key: keyboardMap[rkc[0]] // Temporarily using keyboardMap to get the key name
    } 
    this.commands_code_speedUP = rkc[1] === null ? null : {
      code: keyCodeToCodeMap[parseInt(rkc[1])],
      key: keyboardMap[rkc[1]]
    }
    this.commands_code_speedDOWN = rkc[2] === null ? null : {
      code: keyCodeToCodeMap[parseInt(rkc[2])],
      key: keyboardMap[rkc[2]]
    }
    this.commands_code_speedSET = rkc[3] === null ? null : {
      code: keyCodeToCodeMap[parseInt(rkc[3])],
      key: keyboardMap[rkc[3]]
    }
    this.switch_preserve_pitch = bool(rkc[4]);
    this.switch_shortcuts = bool(rkc[5]);
    this.radio_speed_preset = parseInt(rkc[6]);
    this.radio_speed_custom_plus_minus = parseInt(rkc[8]);
    this.radio_speed_custom_multiply_divide = parseInt(rkc[7]);

  }


}
