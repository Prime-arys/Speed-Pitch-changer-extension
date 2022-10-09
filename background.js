import { onError, message, register } from "./utils_BG.js";

const defaultHosts = "<all_urls>";
var cad_isen = localStorage.getItem('Xytspch_isen');
var cad_sett = localStorage.getItem('Xytspch_sett');
var executing = browser.tabs.executeScript({ code: "document.location.reload();" });

if (cad_sett == null) {
  cad_sett = [106, 107, 109, 110, !1, 1];
  localStorage.setItem('Xytspch_sett', cad_sett);
}

if (cad_isen == null) {
  cad_isen = "no";
  localStorage.setItem('Xytspch_isen', cad_isen);
  browser.runtime.reload()
}

var setg = cad_sett.split(',');

if (setg.length < 6){
    var tmp_rkc=[setg[0],setg[1],setg[2],setg[3],!1,1];
    localStorage.setItem('Xytspch_sett', tmp_rkc);
    cad_sett=tmp_rkc;
    console.log("updated !")
    browser.runtime.reload()
}

if (cad_isen == 'yes'){

  register(defaultHosts, "./utils_CO.js", "document_start");
  register(defaultHosts, "./main.js", "document_idle");
  
  
}
else {browser.browserAction.setIcon({path: "icons/border-16d.png"});}


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
