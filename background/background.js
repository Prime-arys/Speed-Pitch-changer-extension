import { onError, message, register } from "../utils/utils_BG.js";

const defaultHosts = "<all_urls>";
var cad_isen = localStorage.getItem('Xytspch_isen');
var cad_sett = localStorage.getItem('Xytspch_sett');
var executing = browser.tabs.executeScript({ code: "document.location.reload();" });

//console.log("BG Load")
var default_sett = [106, 107, 109, 110, !1, 1, 1, 1.1, 1.1];

if (cad_sett == null) {
  cad_sett = default_sett;
  localStorage.setItem('Xytspch_sett', cad_sett);
}

if (cad_isen == null) {
  cad_isen = "no";
  localStorage.setItem('Xytspch_isen', cad_isen);
  browser.runtime.reload()
}

var setg = cad_sett.split(',');

if (setg.length < 9){
  //Update settings
  var tmp_rkc = [];
  default_sett.forEach(function (value, index) {
    if (typeof setg[index] == 'undefined') {
      tmp_rkc.push(default_sett[index]);
    }
    else {
      tmp_rkc.push(setg[index]);
    }
    //console.log(tmp_rkc);
  });
    //var tmp_rkc=[setg[0],setg[1],setg[2],setg[3],!1,1,1,1.1,1.1];
    localStorage.setItem('Xytspch_sett', tmp_rkc);
    cad_sett=tmp_rkc;
    console.log("updated !")
    browser.runtime.reload()
}

if (cad_isen == 'yes'){

  register(defaultHosts, "../utils/utils_CO.js", "document_start");
  register(defaultHosts, "../utils/ace1.js", "document_start");
  register(defaultHosts, "../utils/ace2.js", "document_start");
  register(defaultHosts, "../contentScript/main.js", "document_idle");
  
}
else {
  var plat = navigator.userAgent.toLowerCase();
  if (!plat.includes("android")) {
    /*pas de changement d'icone sur android*/
    browser.browserAction.setIcon({ path: "../icons/border-16d.png" });
  }
}


function topop(value, key) {
browser.runtime.sendMessage({
    msg: key,
    val: value
});
}


"use strict";
/*
function onError(error) {
  console.error(`Error: ${error}`);
}*/


function sendMessageToTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.sendMessage(
      tab.id,
      {greeting: "actual_speed"}
    ).then(response => {
      var klp=response.actual_speed;
      topop(klp,"pup");
    }).catch(onError);
  }
}

function ms(){
  var btqz = browser.tabs.query({currentWindow: true, active: true});
  btqz.then(sendMessageToTabs).catch(onError);
  
};




function handleMessage(request, sender, sendResponse) {
  //FOR MAIN
  if(request.title == "dm1"){
    sendResponse({dm1: cad_sett});
  }
  if(request.title == "xpup"){
    var executing = browser.tabs.executeScript({code: "xpup();",allFrames: true, matchAboutBlank: true});
  }
  if(request.title == "xpdw"){
    var executing = browser.tabs.executeScript({code: "xpdw();",allFrames: true, matchAboutBlank: true});
  }
  if(request.title == "xpres"){
    var executing = browser.tabs.executeScript({code: "xpres();",allFrames: true, matchAboutBlank: true});
  }
  if(request.title == "xpdef"){
    var fdef = "zpdef(" + request.data + ");";
    var executing = browser.tabs.executeScript({code: fdef,allFrames: true, matchAboutBlank: true});
  }

  //FOR POP

  if (request.type == 'act_speed_val') {
    ms();
  }
  if (request.type == "get_cstt") {
    //renvoie cad_sett en réponse
    cad_sett = localStorage.getItem('Xytspch_sett');
    sendResponse({ cstt: cad_sett });
  }
  if (request.type == "get_isen") {
    //renvoie cad_isen en réponse
    cad_isen = localStorage.getItem('Xytspch_isen');
    sendResponse({ isen: cad_isen });
  }
  if (request.type == "set_cstt") {
    cad_sett = request.val;
    localStorage.setItem('Xytspch_sett', cad_sett);
  }
  if (request.type == "set_isen") {
    cad_isen = request.val;
    localStorage.setItem('Xytspch_isen', cad_isen);
  }
}

browser.runtime.onMessage.addListener(handleMessage);
