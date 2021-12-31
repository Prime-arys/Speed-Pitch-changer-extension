var hidden = false;
var getting = true;
var cad_isen = localStorage.getItem('Xytspch_isen');
var cad_sett = localStorage.getItem('Xytspch_sett');
if (cad_isen == null){
  localStorage.setItem('Xytspch_isen', 'no');
}

if (cad_isen == 'yes'){
  document.getElementById("on_off").checked = true;
}

if (cad_sett == null){
  rkc = [106,107,109,110,!1,1];
  localStorage.setItem('Xytspch_sett', rkc);
  var cad_sett = localStorage.getItem('Xytspch_sett');
}
var ca_kc = cad_sett.split(",");
//console.log(cad_sett)

function onGot(page) {
  if (hidden == false){
    var a=page.ms();
    //console.log(a)
  } else{
    browser.runtime.sendMessage({type: 'get_tab'}).then(response5 => {
      getting =  response5.response
    }) //INCOGNITO COMPATIBLE METHODE
    
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

if (typeof ver !== 'undefined') {
          var aver = document.getElementById("ver");
          aver.textContent = browser.runtime.getManifest().version;
      }


/*var getting = browser.runtime.getBackgroundPage() // ERROR  Incognito  https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getBackgroundPage
getting.then(onGot, onError);*/
var CMi = document.getElementById("CM");
var acid = document.getElementById("CM_lnk");
function onOpen(ishiden) {

  if (typeof xui !== 'undefined') {var alm = document.getElementById("xui");alm.textContent = "(passive)";}
  if (ishiden == true){
    hidden = true;
    browser.runtime.sendMessage({ type: "get_cstt" });
    var hiddenST = localStorage.getItem('hidden_1st');
    if (hiddenST == null){localStorage.setItem('hidden_1st', 'yes');var hiddenST = localStorage.getItem('hidden_1st');}
    onGot();

    var acid1 = document.getElementById("ish_sw");acid1.style.display = "none";
    acid.textContent = "*"; acid.title = "Personal commands are not \r\neditable in incognito mode"
    CMi.style.marginRight = "-4px";
    var acid2 = document.getElementById("CM_props");
    if (hiddenST == "yes") { acid2.textContent = "*:Personal commands are not \neditable in incognito mode"; localStorage.setItem('hidden_1st', 'no'); }
    else { acid2.textContent = ""; }

  } else {
    getting = browser.runtime.getBackgroundPage();
    getting.then(onGot, onError);
    // should I switch everything to the INCOGNITO COMPATIBLE METHOD ?
    // maybe not, the classical method seems faster

    
  }
  ifcmdis();

}
function ifcmdis() {
  if (ca_kc[5] == 0) {
    acid.textContent = "**";
    acid.title = "Shortcuts are disabled";
    CMi.style.marginRight = "-8px";
  }
}


browser.runtime.onMessage.addListener(
    function(request) {
        if (request.msg === "pup") {
          if (typeof xui !== 'undefined') {
            var alm = document.getElementById("xui");
            alm.textContent = request.val;
          }
        }
        if (request.msg === "pup2") { cad_sett = request.val; ca_kc = cad_sett.split(","); ifcmdis();}
    }
);


 
 if (ca_kc[4]=='1') {
  if (typeof xui !== 'undefined') {var alm = document.getElementById("desc");alm.textContent = "(preserved pitch mode)";}
}


function logTabs(tabs) {
  for (let tab of tabs) {
    // tab.url requires the `tabs` permission
    var data = tab.url.split("://");
    //var protocol = data[0];
    //data = data[1].split("/");
    //var domain = data[0];
    var ishiden = tab.incognito;
    //console.log(domain);
    //console.log(tabs);
    //console.log(tab);
    //console.log(ishiden);
    onOpen(ishiden)
  }
}

var querying = browser.tabs.query({currentWindow: true, active: true});
querying.then(logTabs, onError);


var Checkbox = document.querySelector('input[value="isenable"]');
Checkbox.onchange = function(){
	
	if(Checkbox.checked) {
    localStorage.setItem('Xytspch_isen', 'yes');
		console.log(Checkbox.checked);

    //var executing = browser.tabs.executeScript({code: "document.location.reload();"});

    browser.runtime.reload()
  } else {

    localStorage.setItem('Xytspch_isen', 'no');
  	console.log(Checkbox.checked);

    //var executing = browser.tabs.executeScript({code: "document.location.reload();"});

    browser.runtime.reload()
  }
}



var spUp = document.getElementById("sUp");
var spRes = document.getElementById("sRes");
var spDw = document.getElementById("sDw");
var spDef = document.getElementById("sDef");

spUp.onclick = function yt_spUp(){
  var executing = browser.tabs.executeScript({
  code: "xpup();",
  allFrames: true
});
  if (hidden == false){getting.then(onGot, onError)}else{onGot();};
}

spDw.onclick = function yt_spDw(){
  var executing = browser.tabs.executeScript({
  code: "xpdw();",
  allFrames: true
});
  if (hidden == false){getting.then(onGot, onError)}else{onGot();};
}

spRes.onclick = function yt_spRes(){
  var executing = browser.tabs.executeScript({
  code: "xpres();",
  allFrames: true
});
  if (hidden == false){getting.then(onGot, onError)}else{onGot();};
}

spDef.onclick = function yt_spDef(){
  var executing = browser.tabs.executeScript({
  code: "xpdef();"
  //allFrames: true
});
  if (hidden == false){getting.then(onGot, onError)}else{onGot();};
}

spUp.addEventListener("mouseover",function(){sUp.src="icons/clean_svg/uph.svg";})
spUp.addEventListener("mouseout",function(){sUp.src="icons/clean_svg/up.svg";})

spDw.addEventListener("mouseover",function(){sDw.src="icons/clean_svg/dwh.svg";})
spDw.addEventListener("mouseout",function(){sDw.src="icons/clean_svg/dw.svg";})

spRes.addEventListener("mouseover",function(){spRes.src="icons/clean_svg/resh.svg";})
spRes.addEventListener("mouseout",function(){spRes.src="icons/clean_svg/res.svg";})

spDef.addEventListener("mouseover",function(){sDef.src="icons/clean_svg/defh.svg";})
spDef.addEventListener("mouseout",function(){sDef.src="icons/clean_svg/def.svg";})
