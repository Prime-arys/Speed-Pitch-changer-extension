//console.log("loaded_backG")
const defaultHosts = "*://*/*";
var cad_isen = localStorage.getItem('ytspch_isen');
var cad_sett = localStorage.getItem('Xytspch_sett');
//console.log(localStorage.getItem('ytspch_isen'));
var executing = chrome.tabs.executeScript({code: "document.location.reload();"});

var setg = cad_sett.split(',');
//console.log(setg)

if (setg.length < 6){
    var tmp_rkc=[setg[0],setg[1],setg[2],setg[3],!1,1];
    localStorage.setItem('Xytspch_sett', tmp_rkc);
    cad_sett=tmp_rkc;
    console.log("updated !")
    chrome.runtime.reload()
}


if (cad_isen == 'yes'){
async function register(hosts) {

  return await chrome.contentScripts.register({
    "matches": [hosts],
    "js": [{file: "/main.js"}],
    "allFrames": true,
    "runAt": "document_idle"
  });

}

var registered = register(defaultHosts);
}
else {chrome.browserAction.setIcon({path: "icons/border-16d.png"});}


function topop(value){
  //console.log(value)
chrome.runtime.sendMessage({
    msg:"pup",
    val: value
});
}

"use strict";

function onError(error) {
  console.error(`Error: ${error}`);
}

function sendMessageToTabs(tabs) {
  //console.log(tabs)
  //console.log(tabs.id)

    chrome.tabs.sendMessage(
      tabs.id,
      {greeting: "bgs"},
      function(response){topop(response.response);}
      //function(response) {var klp=response.response; topop(klp);}
    ); 
}

function ms(){
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {sendMessageToTabs(tabs[0])});
};


//chrome.runtime.onMessage.addListener(handleMessage);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.setit == "dm1"){
    sendResponse({response_dm1: cad_sett});
    //console.log(request.setit)
  }
  //console.log("good")
  if(request.setit == "xpup"){
    var executing = chrome.tabs.executeScript({code: "xpup();",allFrames: true});
  }
  if(request.setit == "xpdw"){
    var executing = chrome.tabs.executeScript({code: "xpdw();",allFrames: true});
  }
  if(request.setit == "xpres"){
    var executing = chrome.tabs.executeScript({code: "xpres();",allFrames: true});
  }
  if(request.setit == "xpdef"){
    var fdef = "zpdef("+request.xdf+");"
    //console.log(fdef)
    var executing = chrome.tabs.executeScript({code: fdef,allFrames: true});
  }
  
});