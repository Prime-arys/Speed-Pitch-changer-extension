import ipc_kco from '../utils/char_kcode.js';
import { onError, message, Settings } from "../utils/utils_BG.js";

var hidden = false;
var master = false;
var cad_sett;
var ddd = 0;
var fkc = 0;
var commandk = null
var settings = new Settings();
//console.log("Chargement de la page");


function logTabs(tabs) {
  for (let tab of tabs) {
    hidden = tab.incognito;
  }
  master = main();
}

function msgforyou(m, reset) {
  let zlm = document.getElementById("CMs");
  if (reset == false) {
    zlm.textContent = m;
    /*ajout une classe*/
    zlm.classList.add("surligne");
  } else {
    zlm.textContent = "Commands (customize) :";
    /*supprime la classe*/
    zlm.classList.remove("surligne");
  }

}

var querying = browser.tabs.query({ currentWindow: true, active: true });
querying.then(logTabs, onError);

async function main() {

  var cad_sett = (await message('get_cstt')).cstt; //return cstt

  const dres = document.getElementById("res");
  const dsup = document.getElementById("sup");
  const dsdw = document.getElementById("sdw");
  const dset = document.getElementById("set");
  const aply = document.getElementById("apl");
  const rad_st = document.getElementsByName("btn_meth");
  const rad_2val = document.getElementById("rad2val");
  const rad_3val = document.getElementById("rad3val");

  dres.textContent = ipc_kco[settings.get('commands_reset')];
  dsup.textContent = ipc_kco[settings.get('commands_speedUP')];
  dsdw.textContent = ipc_kco[settings.get('commands_speedDOWN')];
  dset.textContent = ipc_kco[settings.get('commands_speedSET')];


  var ca_kc = cad_sett.split(",")
  var fres = parseInt(ca_kc[0])
  var fsup = parseInt(ca_kc[1])
  var fsdw = parseInt(ca_kc[2])
  var fset = parseInt(ca_kc[3])
  var ffkc = [fres, fsup, fsdw, fset, ca_kc[4], ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8], ca_kc[9]];

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
  rad_2val.value = settings.get('radio_speed_custom_plus_minus');
  rad_3val.value = settings.get('radio_speed_custom_multiply_divide');

  dres.onclick = function cm_dres() { getKC(); commandk = ['commands_reset', 'commands_code_reset']; }
  dsup.onclick = function cm_dsup() { getKC(); commandk = ['commands_speedUP', 'commands_code_speedUP']; }
  dsdw.onclick = function cm_dsdw() { getKC(); commandk = ['commands_speedDOWN', 'commands_code_speedDOWN']; }
  dset.onclick = function cm_dset() { getKC(); commandk = ['commands_speedSET', 'commands_code_speedSET']; }

  rad_st.forEach(function (item) {
    item.onclick = function () { rule_set(); }
    if (item.value == settings.get('radio_speed_preset')) item.checked = true, rule_set();
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
      rad_3val.disabled = true;
      rad_2val.disabled = false;
      settings.set('radio_speed_preset', 2);
      if (rad_2val.value <= 1.0) {
        settings.set('radio_speed_custom_multiply_divide', 1.001);
        msgforyou("The value must be greater than 1.0", false);
      }
      else {
        settings.set('radio_speed_custom_multiply_divide', rad_2val.value);
        msgforyou("", true);
      }

    }
    else if (rad_st[2].checked) {
      rad_2val.disabled = true;
      rad_3val.disabled = false;
      settings.set('radio_speed_preset', 3);
      if (rad_3val.value <= 0) {
        settings.set('radio_speed_custom_plus_minus', 0.001);
        msgforyou("The value must be greater than 0", false);
      }
      else {
        settings.set('radio_speed_custom_plus_minus', rad_3val.value);
        msgforyou("", true);
      }
    }
    //message('set_cstt', ca_kc.join(","));
    settings.save();
  };


  document.onkeydown = function (evt) {
    let keyboardEvent = document.createEvent("KeyboardEvent");
    let initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    let tKC = evt.keyCode;
    let tC = evt.code;

    //console.log(tKC)
    //console.log(cad_sett)
    if (ddd == 0) {
      if (tKC == settings.get('commands_reset')) { document.getElementById("res").style.background = "#ECCDAC"; };
      if (tKC == settings.get('commands_speedUP')) { document.getElementById("sup").style.background = "#ECCDAC"; };
      if (tKC == settings.get('commands_speedDOWN')) { document.getElementById("sdw").style.background = "#ECCDAC"; };
      if (tKC == settings.get('commands_speedSET')) { document.getElementById("set").style.background = "#ECCDAC"; };

      /* if (tC == settings.get('commands_code_reset')) { document.getElementById("res").style.background = "#ECCDAC"; };
      if (tC == settings.get('commands_code_speedUP')) { document.getElementById("sup").style.background = "#ECCDAC"; };
      if (tC == settings.get('commands_code_speedDOWN')) { document.getElementById("sdw").style.background = "#ECCDAC"; };
      if (tC == settings.get('commands_code_speedSET')) { document.getElementById("set").style.background = "#ECCDAC"; }; */


    }
    if (ddd == 1) {
      if (commandk !== null) {
        settings.set(commandk[0], tKC);
        settings.set(commandk[1], tC);
        console.log(commandk[0], tKC, commandk[1], tC);
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
      if (tKC == settings.get('commands_reset')) { document.getElementById("res").style.background = "#D9DAE8"; };
      if (tKC == settings.get('commands_speedUP')) { document.getElementById("sup").style.background = "#D9DAE8"; };
      if (tKC == settings.get('commands_speedDOWN')) { document.getElementById("sdw").style.background = "#D9DAE8"; };
      if (tKC == settings.get('commands_speedSET')) { document.getElementById("set").style.background = "#D9DAE8"; };

      /* if (tC == settings.get('commands_code_reset')) { document.getElementById("res").style.background = "#D9DAE8"; };
      if (tC == settings.get('commands_code_speedUP')) { document.getElementById("sup").style.background = "#D9DAE8"; };
      if (tC == settings.get('commands_code_speedDOWN')) { document.getElementById("sdw").style.background = "#D9DAE8"; };
      if (tC == settings.get('commands_code_speedSET')) { document.getElementById("set").style.background = "#D9DAE8"; }; */
    }
    if (ddd == 1) {
      //console.log(ffkc)
      ddd = 0
      var cad_sett = (await message('get_cstt')).cstt; //return cstt
      var ca_kc = cad_sett.split(",");
      msgforyou("", true);

      //var updK = [ffkc[0], ffkc[1], ffkc[2], ffkc[3], ca_kc[4], ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8], ca_kc[9]];
      //set_cstt(updK);
      //message('set_cstt', updK);
      settings.save();
      window.location.reload()


    }


  };


 
  document.getElementById("on_off_sp").checked = settings.get('switch_preserve_pitch'); // true or false
  document.getElementById("on_off_bt").checked = settings.get('switch_shortcuts');
  document.getElementById("on_off_ignoretxt").checked = settings.get('switch_ignore_text_field');


  var Checkbox = document.querySelector('input[value="isenable_sp"]');
  Checkbox.onchange = async function () {
    /* var cad_sett = (await message('get_cstt')).cstt; //return cstt
    var ca_kc = cad_sett.split(",");

    if (Checkbox.checked) {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], 1, ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8], ca_kc[9]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox.checked);

    } else {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], !1, ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8], ca_kc[9]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox.checked);

    } */
    settings.set('switch_preserve_pitch', Checkbox.checked);

  }

  var Checkbox2 = document.querySelector('input[value="isenable_bt"]');
  Checkbox2.onchange = async function () {
   /*  var cad_sett = (await message('get_cstt')).cstt; //return cstt
    var ca_kc = cad_sett.split(",");


    if (Checkbox2.checked) {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], 1, ca_kc[6], ca_kc[7], ca_kc[8], ca_kc[9]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox2.checked);

    } else {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], 0, ca_kc[6], ca_kc[7], ca_kc[8], ca_kc[9]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox2.checked);

    } */
    settings.set('switch_shortcuts', Checkbox2.checked);

  }


  var Checkbox3 = document.querySelector('input[value="isenable_ignoretxt"]');
  Checkbox3.onchange = async function () {
   /*  var cad_sett = (await message('get_cstt')).cstt; //return cstt
    var ca_kc = cad_sett.split(",");


    if (Checkbox3.checked) {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8], 1];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox3.checked);

    } else {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8], 0];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox3.checked);

    } */
    settings.set('switch_ignore_text_field', Checkbox3.checked);

  }


  aply.onclick = function aplu() {
    settings.save();
    browser.runtime.reload()
  }
}



function getKC() {
  ddd = 1
  msgforyou("Press a key", false);
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
