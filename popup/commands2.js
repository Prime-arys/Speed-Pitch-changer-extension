import ipc_kco from '../utils/char_kcode.js';
import { onError, message } from "../utils/utils_BG.js";

var hidden = false;
var master = false;
var cad_sett;
var ddd = 0;
var fkc = 0;
var xxch = 0;
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
  var tKC = 0;

  dres.textContent = ipc_kco[cad_sett.split(",")[0]];
  dsup.textContent = ipc_kco[cad_sett.split(",")[1]];
  dsdw.textContent = ipc_kco[cad_sett.split(",")[2]];
  dset.textContent = ipc_kco[cad_sett.split(",")[3]];


  var ca_kc = cad_sett.split(",")
  var fres = parseInt(ca_kc[0])
  var fsup = parseInt(ca_kc[1])
  var fsdw = parseInt(ca_kc[2])
  var fset = parseInt(ca_kc[3])
  var ffkc = [fres, fsup, fsdw, fset, ca_kc[4], ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8]];

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
  rad_2val.value = ca_kc[7];
  rad_3val.value = ca_kc[8];

  dres.onclick = function cm_dres() { getKC(0); xxch = 0; }
  dsup.onclick = function cm_dsup() { getKC(1); xxch = 1; }
  dsdw.onclick = function cm_dsdw() { getKC(2); xxch = 2; }
  dset.onclick = function cm_dset() { getKC(3); xxch = 3; }

  rad_st.forEach(function (item) {
    item.onclick = function () { rule_set(); }
    if (item.value == ca_kc[6]) item.checked = true, rule_set();
    else item.checked = false;
  });



  async function rule_set() {
    var cad_sett = (await message('get_cstt')).cstt; //return cstt
    var ca_kc = cad_sett.split(",");

    if (rad_st[0].checked) {
      rad_2val.disabled = true;
      rad_3val.disabled = true;
      ca_kc[6] = 1;
      /*ca_kc[7] = 1.1;*/
    }
    else if (rad_st[1].checked) {
      rad_3val.disabled = true;
      rad_2val.disabled = false;
      ca_kc[6] = 2;
      if (rad_2val.value <= 1.0) {
        ca_kc[7] = 1.001;
        msgforyou("The value must be greater than 1.0", false);
      }
      else {
        ca_kc[7] = rad_2val.value;
        msgforyou("", true);
      }

    }
    else if (rad_st[2].checked) {
      rad_2val.disabled = true;
      rad_3val.disabled = false;
      ca_kc[6] = 3;
      if (rad_3val.value <= 0) {
        ca_kc[8] = 0.001;
        msgforyou("The value must be greater than 0", false);
      }
      else {
        ca_kc[8] = rad_3val.value;
        msgforyou("", true);
      }
    }
    message('set_cstt', ca_kc.join(","));
  };


  document.onkeydown = function (evt) {
    var keyboardEvent = document.createEvent("KeyboardEvent");
    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    tKC = evt.keyCode;
    //console.log(tKC)
    //console.log(cad_sett)
    if (ddd == 0) {
      if (tKC == fres) { document.getElementById("res").style.background = "#ECCDAC"; };
      if (tKC == fsup) { document.getElementById("sup").style.background = "#ECCDAC"; };
      if (tKC == fsdw) { document.getElementById("sdw").style.background = "#ECCDAC"; };
      if (tKC == fset) { document.getElementById("set").style.background = "#ECCDAC"; };
    }
    if (ddd == 1) {
      fkc = tKC;
      ffkc[xxch] = fkc;

    }


  };

  document.onkeyup = async function (evt) {
    var keyboardEvent = document.createEvent("KeyboardEvent");
    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    tKC = evt.keyCode;
    //console.log(tKC)
    //console.log(cad_sett)
    if (ddd == 0) {
      if (tKC == fres) { document.getElementById("res").style.background = "#D9DAE8"; };
      if (tKC == fsup) { document.getElementById("sup").style.background = "#D9DAE8"; };
      if (tKC == fsdw) { document.getElementById("sdw").style.background = "#D9DAE8"; };
      if (tKC == fset) { document.getElementById("set").style.background = "#D9DAE8"; };
    }
    if (ddd == 1) {
      //console.log(ffkc)
      ddd = 0
      var cad_sett = (await message('get_cstt')).cstt; //return cstt
      var ca_kc = cad_sett.split(",");
      msgforyou("", true);

      var updK = [ffkc[0], ffkc[1], ffkc[2], ffkc[3], ca_kc[4], ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8]];
      //set_cstt(updK);
      message('set_cstt', updK);
      window.location.reload()


    }


  };


  if (ca_kc[4] == 1) {
    document.getElementById("on_off_sp").checked = true;
  }
  if (ca_kc[5] == 1) {
    document.getElementById("on_off_bt").checked = true;
  }

  var Checkbox = document.querySelector('input[value="isenable_sp"]');
  Checkbox.onchange = async function () {
    var cad_sett = (await message('get_cstt')).cstt; //return cstt
    var ca_kc = cad_sett.split(",");

    if (Checkbox.checked) {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], 1, ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox.checked);

    } else {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], !1, ca_kc[5], ca_kc[6], ca_kc[7], ca_kc[8]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox.checked);

    }

  }

  var Checkbox2 = document.querySelector('input[value="isenable_bt"]');
  Checkbox2.onchange = async function () {
    var cad_sett = (await message('get_cstt')).cstt; //return cstt
    var ca_kc = cad_sett.split(",");


    if (Checkbox2.checked) {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], 1, ca_kc[6], ca_kc[7], ca_kc[8]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox2.checked);

    } else {
      let tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], 0, ca_kc[6], ca_kc[7], ca_kc[8]];
      message('set_cstt', tmp_rkc);
      console.log(Checkbox2.checked);

    }

  }

  aply.onclick = function aplu() {
    browser.runtime.reload()
  }
}



function getKC(xh) {
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
