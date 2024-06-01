import { keyboardMap } from '../utils/char_kcode.js';
import { onError, message, Settings } from "../utils/utils_BG.js";

var hidden = false;
var master = false;
var ddd = 0;
var commandk = null
var settings = new Settings();
//console.log("Chargement de la page");


const tg_kbs = document.getElementById("tg_kbs");
const tg_kbs_innerHTML = tg_kbs.innerHTML;
const tg_pm = document.getElementById("tg_pm");
const tg_pm_innerHTML = tg_pm.innerHTML;
const tg_bd = document.getElementById("tg_bd");
const tg_bd_innerHTML = tg_bd.innerHTML;
const collapse_kbs = document.getElementById("collapse_kbs");
const collapse_pm = document.getElementById("collapse_pm");
const collapse_bd = document.getElementById("collapse_bd");

const list = [tg_pm, tg_bd, tg_kbs];
const list2 = [collapse_pm, collapse_bd, collapse_kbs];




function force_collapse(list, list2) {
  list.forEach(tg => {
    tg.classList.remove("toggle_force");
    tg.children[tg.children.length - 1]
      .textContent = "▼";
  });
  list2.forEach(collapse => {
    if (collapse.classList.contains("show")) {
      collapse.classList.remove("show");
    }
  });
}

list.forEach(tg => {
  //console.log(tg);
  tg.addEventListener("click", function () {
    let index = list.indexOf(tg);
    if (tg.classList.contains("toggle_force")) {
      tg.children[tg.children.length - 1].textContent = tg.children[tg.children.length - 1].textContent == "▼" ? "▲" : "▼";
      tg.classList.remove("toggle_force");
      list2[index].classList.remove("show");
      //console.log("toggle_force: ", tg);
      return;
    }
    force_collapse(list, list2)
    tg.classList.toggle("toggle_force");
    tg.children[tg.children.length - 1].textContent = tg.children[tg.children.length - 1].textContent == "▼" ? "▲" : "▼";
    
    list2[index].classList.toggle("show");
  });
});



function logTabs(tabs) {
  for (let tab of tabs) {
    hidden = tab.incognito;
  }
  master = main();
}

function msgforyou(m, reset, zlm) {
  zlm.innerHTML = m;
  if (reset == false) {
    /*ajout une classe*/
    zlm.classList.add("surligne");
    zlm.classList.remove("toggle_force");
  } else {
    if (zlm.classList.contains("surligne")) {
      zlm.classList.remove("surligne");
      zlm.classList.add("toggle_force");
    }
  }

}

var querying = browser.tabs.query({ currentWindow: true, active: true });
querying.then(logTabs, onError);

async function main() {

  const dres = document.getElementById("res");
  const dsup = document.getElementById("sup");
  const dsdw = document.getElementById("sdw");
  const dset = document.getElementById("set");
  const aply = document.getElementById("apl");
  const rad_st = document.getElementsByName("btn_meth");
  const rad_st2 = document.getElementsByName("btn_meth2");
  const rad_2val = document.getElementById("rad2val");
  const rad_3val = document.getElementById("rad3val");
  const rad_2bval = document.getElementById("rad2bval");

/*   dres.textContent = keyboardMap[settings.get('commands_reset')];
  dsup.textContent = keyboardMap[settings.get('commands_speedUP')];
  dsdw.textContent = keyboardMap[settings.get('commands_speedDOWN')];
  dset.textContent = keyboardMap[settings.get('commands_speedSET')]; */

  dres.textContent = settings.get('commands_code_reset').key;
  dsup.textContent = settings.get('commands_code_speedUP').key;
  dsdw.textContent = settings.get('commands_code_speedDOWN').key;
  dset.textContent = settings.get('commands_code_speedSET').key;


  dres.addEventListener("mouseover", function () { dres.style.background = "#EFDBC8" })
  dres.addEventListener("mouseout", function () { dres.style.background = "#D9DAE8" })
  dsup.addEventListener("mouseover", function () { dsup.style.background = "#EFDBC8" })
  dsup.addEventListener("mouseout", function () { dsup.style.background = "#D9DAE8" })
  dsdw.addEventListener("mouseover", function () { dsdw.style.background = "#EFDBC8" })
  dsdw.addEventListener("mouseout", function () { dsdw.style.background = "#D9DAE8" })
  dset.addEventListener("mouseover", function () { dset.style.background = "#EFDBC8" })
  dset.addEventListener("mouseout", function () { dset.style.background = "#D9DAE8" })

  rad_2val.addEventListener("change", function () { rule_set(); });
  rad_3val.addEventListener("change", function () { rule_set(); });
  rad_2bval.addEventListener("change", function () { rule_set(); });
  rad_2val.value = settings.get('radio_speed_custom_plus_minus');
  rad_3val.value = settings.get('radio_speed_custom_multiply_divide');
  rad_2bval.value = settings.get('radio_pitch_custom_plus_minus');

  dres.onclick = function cm_dres() { getKC(); commandk = ['commands_reset', 'commands_code_reset']; }
  dsup.onclick = function cm_dsup() { getKC(); commandk = ['commands_speedUP', 'commands_code_speedUP']; }
  dsdw.onclick = function cm_dsdw() { getKC(); commandk = ['commands_speedDOWN', 'commands_code_speedDOWN']; }
  dset.onclick = function cm_dset() { getKC(); commandk = ['commands_speedSET', 'commands_code_speedSET']; }

  rad_st.forEach(function (item) {
    item.onclick = function () { rule_set(); }
    if (item.value == settings.get('radio_speed_preset')) item.checked = true, rule_set();
    else item.checked = false;
  });

  rad_st2.forEach(function (item) {
    item.onclick = function () { rule_set(); }
    if (item.value == settings.get('radio_pitch_preset')) item.checked = true, rule_set();
    else item.checked = false;
  });



  async function rule_set() {
    var cad_sett = (await message('get_cstt')).cstt; //return cstt
    var ca_kc = cad_sett.split(",");

    if (rad_st[0].checked) {
      rad_2val.disabled = true;
      rad_3val.disabled = true;
      settings.set('radio_speed_preset', 1);
      /*ca_kc[7] = 1.1;*/
    }
    else if (rad_st[1].checked) {
      rad_2val.disabled = false;
      rad_3val.disabled = true;
      settings.set('radio_speed_preset', 2);
      if (rad_2val.value <= 1.0) {
        settings.set('radio_speed_custom_plus_minus', 1.001);
        msgforyou("The value must be greater than 1.0", false, tg_pm);
      }
      else {
        settings.set('radio_speed_custom_plus_minus', rad_2val.value);
        msgforyou(tg_pm_innerHTML, true, tg_pm);
      }

    }
    else if (rad_st[2].checked) {
      rad_2val.disabled = true;
      rad_3val.disabled = false;
      settings.set('radio_speed_preset', 3);
      if (rad_3val.value <= 0) {
        settings.set('radio_speed_custom_multiply_divide', 0.001);
        msgforyou("The value must be greater than 0", false, tg_pm);
      }
      else {
        settings.set('radio_speed_custom_multiply_divide', rad_3val.value);
        msgforyou(tg_pm_innerHTML, true, tg_pm);
      }
    }


    if (rad_st2[0].checked) {
      rad_2bval.disabled = true;
      settings.set('radio_pitch_preset', 1);
      /*ca_kc[7] = 1.1;*/
    }
    else if (rad_st2[1].checked) {
      rad_2bval.disabled = false;
      settings.set('radio_pitch_preset', 2);
      if (rad_2bval.value <= 0) {
        settings.set('radio_pitch_custom_plus_minus', 0.001);
        msgforyou("The value must be greater than 0", false, tg_bd);
      }
      else {
        settings.set('radio_pitch_custom_plus_minus', rad_2bval.value);
        msgforyou(tg_bd_innerHTML, true, tg_bd);
      }
    }
    //message('set_cstt', ca_kc.join(","));
    settings.save();
  };


  document.onkeydown = function (evt) {
    let keyboardEvent = document.createEvent("KeyboardEvent");
    let initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    let tKC = null;
    let tC = evt.code;
    try {
      tKC = evt.keyCode;
    }
    catch (e) {
      tKC = null;
    }

    //console.log(tKC)
    //console.log(cad_sett)
    if (ddd == 0) {
      /* if (tKC == settings.get('commands_reset')) { document.getElementById("res").style.background = "#ECCDAC"; };
      if (tKC == settings.get('commands_speedUP')) { document.getElementById("sup").style.background = "#ECCDAC"; };
      if (tKC == settings.get('commands_speedDOWN')) { document.getElementById("sdw").style.background = "#ECCDAC"; };
      if (tKC == settings.get('commands_speedSET')) { document.getElementById("set").style.background = "#ECCDAC"; };
 */
      if (tC == settings.get('commands_code_reset').code) { document.getElementById("res").style.background = "#ECCDAC"; };
      if (tC == settings.get('commands_code_speedUP').code) { document.getElementById("sup").style.background = "#ECCDAC"; };
      if (tC == settings.get('commands_code_speedDOWN').code) { document.getElementById("sdw").style.background = "#ECCDAC"; };
      if (tC == settings.get('commands_code_speedSET').code) { document.getElementById("set").style.background = "#ECCDAC"; };


    }
    if (ddd == 1) {
      if (commandk !== null) {
        //settings.set(commandk[0], tKC);
        settings.set(commandk[1], { 
          code: evt.code, 
          key: tKC !== null ? keyboardMap[tKC] : evt.key.toUpperCase() // will use legacy key name if keyCode is available
        });
        //console.log(commandk[0], tKC, commandk[1], tC);
      }

    }


  };

  document.onkeyup = async function (evt) {
    let keyboardEvent = document.createEvent("KeyboardEvent");
    let initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    let tKC = evt.keyCode;
    let tC = evt.code;
    //console.log(tKC)
    //console.log(cad_sett)
    if (ddd == 0) {
      /* if (tKC == settings.get('commands_reset')) { document.getElementById("res").style.background = "#D9DAE8"; };
      if (tKC == settings.get('commands_speedUP')) { document.getElementById("sup").style.background = "#D9DAE8"; };
      if (tKC == settings.get('commands_speedDOWN')) { document.getElementById("sdw").style.background = "#D9DAE8"; };
      if (tKC == settings.get('commands_speedSET')) { document.getElementById("set").style.background = "#D9DAE8"; }; */

      if (tC == settings.get('commands_code_reset').code) { document.getElementById("res").style.background = "#D9DAE8"; };
      if (tC == settings.get('commands_code_speedUP').code) { document.getElementById("sup").style.background = "#D9DAE8"; };
      if (tC == settings.get('commands_code_speedDOWN').code) { document.getElementById("sdw").style.background = "#D9DAE8"; };
      if (tC == settings.get('commands_code_speedSET').code) { document.getElementById("set").style.background = "#D9DAE8"; };
    }
    if (ddd == 1) {
      //console.log(ffkc)
      ddd = 0
      msgforyou(tg_kbs_innerHTML, true, tg_kbs);

      settings.save();
      window.location.reload()


    }


  };



  document.getElementById("on_off_sp").checked = settings.get('switch_preserve_pitch'); // true or false
  document.getElementById("on_off_bt").checked = settings.get('switch_shortcuts');
  document.getElementById("on_off_ignoretxt").checked = settings.get('switch_ignore_text_field');


  var Checkbox = document.querySelector('input[value="isenable_sp"]');
  Checkbox.onchange = async function () {

    settings.set('switch_preserve_pitch', Checkbox.checked);

  }

  var Checkbox2 = document.querySelector('input[value="isenable_bt"]');
  Checkbox2.onchange = async function () {

    settings.set('switch_shortcuts', Checkbox2.checked);

  }


  var Checkbox3 = document.querySelector('input[value="isenable_ignoretxt"]');
  Checkbox3.onchange = async function () {

    settings.set('switch_ignore_text_field', Checkbox3.checked);

  }


  aply.onclick = function aplu() {
    settings.save();
    browser.runtime.reload()
  }
}



function getKC() {
  ddd = 1
  msgforyou("Press a key", false, tg_kbs);
}

function pressKey(keyCode) {
  var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent("Events");

  if (eventObj.initEvent) {
    eventObj.initEvent("keydown", true, true);
  }

  eventObj.keyCode = keyCode;
  eventObj.shiftKey = true;

  if (document.dispatchEvent) {
    document.dispatchEvent(eventObj);
  }
  else {
    document.fireEvent("onkeydown", eventObj);
  }
}


