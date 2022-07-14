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
async function register(hosts) {

  return await browser.contentScripts.register({
    "matches": [hosts],
    "js": [{file: "/main.js"}],
    "allFrames": true,
    "runAt": "document_idle",
    "matchAboutBlank": true
  });

}

var registered = register(defaultHosts);
}
else {browser.browserAction.setIcon({path: "icons/border-16d.png"});}


function topop(value, key) {
browser.runtime.sendMessage({
    msg: key,
    val: value
});
}



"use strict";

function onError(error) {
  console.error(`Error: ${error}`);
}

function sendMessageToTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.sendMessage(
      tab.id,
      {greeting: "bgs"}
    ).then(response => {
      //console.log(response.response);
      var klp=response.response;
      topop(klp,"pup");
    }).catch(onError);
  }
}

function ms(){
  var btqz = browser.tabs.query({currentWindow: true, active: true});
  btqz.then(sendMessageToTabs).catch(onError);
  
};




function handleMessage(request, sender, sendResponse) {
  if(request.setit == "dm1"){
    sendResponse({response_dm1: cad_sett});
  }
  if(request.setit == "xpup"){
    var executing = browser.tabs.executeScript({code: "xpup();",allFrames: true, matchAboutBlank: true});
  }
  if(request.setit == "xpdw"){
    var executing = browser.tabs.executeScript({code: "xpdw();",allFrames: true, matchAboutBlank: true});
  }
  if(request.setit == "xpres"){
    var executing = browser.tabs.executeScript({code: "xpres();",allFrames: true, matchAboutBlank: true});
  }
  if(request.setit == "xpdef"){
    var fdef = "zpdef(" + request.xdf + ");";
    var executing = browser.tabs.executeScript({code: fdef,allFrames: true, matchAboutBlank: true});
  }
  // incognito
  if (request.type == 'get_tab') {
    ms();
  }
  if (request.type == "get_cstt") {
    //topop(cad_sett, "pup2");
    //renvoi cad_sett en réponse
    cad_sett = localStorage.getItem('Xytspch_sett');
    sendResponse({ response_cstt: cad_sett });
  }
  if (request.type == "get_isen") {
    //topop(cad_sett, "pup2");
    //renvoi cad_isen en réponse
    cad_isen = localStorage.getItem('Xytspch_isen');
    sendResponse({ response_isen: cad_isen });
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
