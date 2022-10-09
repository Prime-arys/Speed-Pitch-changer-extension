import { onError, message } from "./utils_BG.js";

var hidden = false;
var getting = true;
var cad_isen;
var cad_sett;
var master;


if (typeof aver == 'undefined') {
    var aver = document.getElementById("ver");
    aver.textContent = browser.runtime.getManifest().version;
}




async function main() {
  cad_sett = (await message('get_cstt')).cstt; //return cstt
  cad_isen = (await message('get_isen')).isen; //return isen

    if (cad_isen == 'yes') {
        document.getElementById("on_off").checked = true;
    }
      
    
    var ca_kc = cad_sett.split(",");

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


    function onGot() {
      //browser.runtime.sendMessage({ type: 'act_speed_val' });
      message('act_speed_val');
        }

    var CMi = document.getElementById("CM");
    var acid = document.getElementById("CM_lnk");
    
    function onOpen(ishiden) {

      if (typeof xui !== 'undefined') {var alm = document.getElementById("xui");alm.textContent = "(passive)";}
      if (ishiden == true) {
        hidden = true;
      }
      onGot();
      ifcmdis();

    }
    function ifcmdis() {
      if (ca_kc[5] == 0) {
        acid.textContent = "*";
        acid.title = "Shortcuts are disabled";
        CMi.style.marginRight = "-4px";
      }
    }


    browser.runtime.onMessage.addListener(
      function (request) {
            //request.msg = head of message from topop()
            if (request.msg === "pup") {
              if (typeof xui !== 'undefined') {
                var alm = document.getElementById("xui");
                alm.textContent = request.val; //.val = actual_speed value
              }
            }
            //if (request.msg === "pup2") { cad_sett = request.val; ca_kc = cad_sett.split(","); ifcmdis();}
        }
    );

    if (ca_kc[4]=='1') {
        if (typeof xui !== 'undefined') {var alm = document.getElementById("desc");alm.textContent = "(preserved pitch mode)";}
      }

      
    
      var Checkbox = document.querySelector('input[value="isenable"]');
      Checkbox.onchange = function(){
          
          if(Checkbox.checked) {
            message('set_isen', 'yes');
                console.log(Checkbox.checked);
      
          //var executing = browser.tabs.executeScript({code: "document.location.reload();"});
      
          browser.runtime.reload()
        } else {
      
            message('set_isen', 'no');
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
        allFrames: true,
        matchAboutBlank: true
    });
      onGot();
    }

    spDw.onclick = function yt_spDw(){
      var executing = browser.tabs.executeScript({
        code: "xpdw();",
        allFrames: true,
        matchAboutBlank: true
    });
      onGot();
    }

    spRes.onclick = function yt_spRes(){
      var executing = browser.tabs.executeScript({
        code: "xpres();",
        allFrames: true,
        matchAboutBlank: true
    });
      onGot();
    }

    spDef.onclick = function yt_spDef(){
      var executing = browser.tabs.executeScript({
      code: "xpdef();"
      //allFrames: true
    });
      onGot();
    }

    spUp.addEventListener("mouseover",function(){sUp.src="icons/clean_svg/uph.svg";})
    spUp.addEventListener("mouseout",function(){sUp.src="icons/clean_svg/up.svg";})

    spDw.addEventListener("mouseover",function(){sDw.src="icons/clean_svg/dwh.svg";})
    spDw.addEventListener("mouseout",function(){sDw.src="icons/clean_svg/dw.svg";})

    spRes.addEventListener("mouseover",function(){spRes.src="icons/clean_svg/resh.svg";})
    spRes.addEventListener("mouseout",function(){spRes.src="icons/clean_svg/res.svg";})

    spDef.addEventListener("mouseover",function(){sDef.src="icons/clean_svg/defh.svg";})
    spDef.addEventListener("mouseout",function(){sDef.src="icons/clean_svg/def.svg";})

    
}
main();

