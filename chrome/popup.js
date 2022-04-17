function onGot(page) {
  var a=page.ms();
  //console.log(a)
}

function onError(error) {
  console.log(`Error: ${error}`);
}


if (typeof ver !== 'undefined') {
          var aver = document.getElementById("ver");
          aver.textContent = chrome.runtime.getManifest().version+"-cr";
      }


var getting = chrome.extension.getBackgroundPage()
//getting.then(onGot, onError);
onGot(getting)



chrome.runtime.onMessage.addListener(
    function(request) {
        if (request.msg === "pup") {
             if (typeof xui !== 'undefined') {
              var alm = document.getElementById("xui");
              alm.textContent = request.val;
            }
        }
    }
);


var cad_isen = localStorage.getItem('ytspch_isen');
var cad_sett = localStorage.getItem('Xytspch_sett');
//console.log(cad_isen)
if (cad_isen == 'null'){
  localStorage.setItem('ytspch_isen', 'no');
  //console.log("st_no")
}

if (cad_isen == 'yes'){
  document.getElementById("on_off").checked = true;
  //console.log("st_yes")

}
if (cad_sett == null){
  rkc = [106,107,109,110,!1,1];
  localStorage.setItem('Xytspch_sett', rkc);
  var cad_sett = localStorage.getItem('Xytspch_sett');
}

var ca_kc = cad_sett.split(",");
var acid = document.getElementById("CM_lnk");
var CMi = document.getElementById("CM");
if (ca_kc[4]=='1') {
 if (typeof xui !== 'undefined') {var alm = document.getElementById("desc");alm.textContent = "(preserved pitch mode)";}
}
if (ca_kc[5] == '0') {
  acid.textContent = "*";
  acid.title = "Shortcuts are disabled";
  CMi.style.marginRight = "-4px";
  CMi.style.marginBottom = "-2px";
}



var Checkbox = document.querySelector('input[value="isenable"]');
Checkbox.onchange = function(){
	
	if(Checkbox.checked) {
    localStorage.setItem('ytspch_isen', 'yes');
		//console.log(Checkbox.checked);
    chrome.runtime.reload()

    //var executing = chrome.tabs.executeScript({code: "localStorage.setItem('ytspch_isen', 'yes');document.location.reload();"});
  } else {
      localStorage.setItem('ytspch_isen', 'no');
  		//console.log(Checkbox.checked);
      chrome.runtime.reload()

    //var executing = chrome.tabs.executeScript({code: "localStorage.setItem('ytspch_isen', 'no');document.location.reload();"});
  }
}


var spUp = document.getElementById("sUp");
var spRes = document.getElementById("sRes");
var spDw = document.getElementById("sDw");
var spDef = document.getElementById("sDef");

spUp.onclick = function yt_spUp(){
  var executing = chrome.tabs.executeScript({
    code: "xpup();",
    allFrames: true
  
});
  onGot(getting)
}

spDw.onclick = function yt_spDw(){
  var executing = chrome.tabs.executeScript({
    code: "xpdw();",
    allFrames: true
  
});
  onGot(getting)
}

spRes.onclick = function yt_spRes(){
  var executing = chrome.tabs.executeScript({
    code: "xpres();",
    allFrames: true
  
  
});
  onGot(getting)
}
spDef.onclick = function yt_spDef(){
  var executing = chrome.tabs.executeScript({
    code: "xpdef();"
  
  
});
  onGot(getting)
}


spUp.addEventListener("mouseover",function(){sUp.src="icons/clean_svg/uph.svg";})
spUp.addEventListener("mouseout",function(){sUp.src="icons/clean_svg/up.svg";})

spDw.addEventListener("mouseover",function(){sDw.src="icons/clean_svg/dwh.svg";})
spDw.addEventListener("mouseout",function(){sDw.src="icons/clean_svg/dw.svg";})

spRes.addEventListener("mouseover",function(){spRes.src="icons/clean_svg/resh.svg";})
spRes.addEventListener("mouseout",function(){spRes.src="icons/clean_svg/res.svg";})

spDef.addEventListener("mouseover",function(){sDef.src="icons/clean_svg/defh.svg";})
spDef.addEventListener("mouseout",function(){sDef.src="icons/clean_svg/def.svg";})
