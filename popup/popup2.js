import { onError, message } from "../utils/utils_BG.js";

var hidden = false;
var cad_isen;
var cad_sett;
var cad_upd;
var actual_domain;
//console.log("POP Load")


if (typeof aver == 'undefined') {
    let aver = document.getElementById("ver");
    aver.textContent = browser.runtime.getManifest().version;
}



async function main() {
  cad_sett = (await message('get_cstt')).cstt; //return cstt
  cad_isen = (await message('get_isen')).isen; //return isen
  cad_upd = (await message('get_upd')).upd; //return upd

    if (cad_isen == 'yes') {
        document.getElementById("on_off").checked = true;
    }
      
  cad_upd = cad_upd.split(",");
  if (cad_upd[0] != "nan") {
    aver.textContent = browser.runtime.getManifest().version + "*";
    aver.title = "New version available: " + cad_upd[0];
    aver.style.color = "#6f5600";
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
      message('get_domain');
        }

    var CMi = document.getElementById("CM");
    var acid = document.getElementById("CM_lnk");
    
    function onOpen(ishiden) {

      if (typeof xui !== 'undefined') {let alm = document.getElementById("xui");alm.textContent = "(passive)";}
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
                let alm = document.getElementById("xui");
                alm.textContent = request.val; //.val = actual_speed value
              }

        }
        if (request.msg === "pup2") { 
          if (typeof xui2 !== 'undefined') {
            let alm2 = document.getElementById("xui2");
            alm2.textContent = request.val; //.val = actual_pitch value
          }
        };
        if (request.msg === "mDom") {
          actual_domain = request.val;
          var dmn = document.getElementById("act_domain");
          //console.log("Act domain: " + actual_domain);
          dmn.textContent = actual_domain[0];
          dmn.title = actual_domain[1];
          if (actual_domain[0] == "developer.mozilla.org") {
            btban.style.display = "none";
            dmn.title = "This domain can't be treated by this extension";
          }
          if(actual_domain[1] == false){
            btban.checked = true;
          }
          else{
            btban.checked = false;
          }

        }
            //if (request.msg === "pup2") { cad_sett = request.val; ca_kc = cad_sett.split(","); ifcmdis();}
        }
    );

    if (ca_kc[4]=='1') {
        if (typeof xui !== 'undefined') {let alm = document.getElementById("desc");alm.textContent = "(preserved pitch mode)";}
      }

      
    
      var Checkbox = document.querySelector('input[value="isenable"]');
      Checkbox.onchange = function(){
          
          if(Checkbox.checked) {
            message('set_isen', 'yes');
                console.log(Checkbox.checked);
      
          //var executing = browser.tabs.executeScript({code: "document.location.reload();"});
      
            browser.runtime.reload();
            //window.location.reload();
            //force quit popup on android
            if (navigator.userAgent.indexOf("Android") != -1) {
              window.close();
            }
            
        } else {
      
            message('set_isen', 'no');
            console.log(Checkbox.checked);
      
          //var executing = browser.tabs.executeScript({code: "document.location.reload();"});
      
            browser.runtime.reload();
            //window.location.reload();
            //force quit popup on android
            if (navigator.userAgent.indexOf("Android") != -1) {
              window.close();
            }
        }
    }
    
    const spUp = document.getElementById("sUp");
    const spRes = document.getElementById("sRes");
    const spDw = document.getElementById("sDw");
    const spDef = document.getElementById("sDef");
    const btban = document.getElementById("btn_ban");
    const spRight = document.getElementById("pR");
    const spLeft = document.getElementById("pL");
  
    const spJuRes = document.getElementById("xui2");
  
  btban.onchange = function () {
    if (btban.checked) {
      message('set_unban', actual_domain[0]);
      console.log(btban.checked);
    } else {
      
      message('set_ban', actual_domain[0]);
      console.log(btban.checked);
    }
  }

    spUp.onclick = function yt_spUp(){
      let executing = browser.tabs.executeScript({
        code: "xpup();",
        allFrames: true,
        matchAboutBlank: true
    });
      onGot();
    }

    spDw.onclick = function yt_spDw(){
      let executing = browser.tabs.executeScript({
        code: "xpdw();",
        allFrames: true,
        matchAboutBlank: true
    });
      onGot();
    }

    spRes.onclick = function yt_spRes(){
      let executing = browser.tabs.executeScript({
        code: "xpres();",
        allFrames: true,
        matchAboutBlank: true
    });
      onGot();
    }

    spDef.onclick = function yt_spDef(){
      let executing = browser.tabs.executeScript({
      code: "xpdef();"
      //allFrames: true
    });
      onGot();
  }

  spRight.onclick = function yt_spRight() {
    let executing = browser.tabs.executeScript({
      code: "vpup();",
      allFrames: true,
      matchAboutBlank: true
    });
    onGot();
  }

  spLeft.onclick = function yt_spLeft() {
    let executing = browser.tabs.executeScript({
      code: "vpdw();",
      allFrames: true,
      matchAboutBlank: true
    });
    onGot();
  }

  spJuRes.onclick = function yt_spJuRes() {
    let executing = browser.tabs.executeScript({
      code: "vpres();",
      allFrames: true,
      matchAboutBlank: true
    });
    onGot();
  }


  

    spUp.addEventListener("mouseover",function(){sUp.src="../icons/clean_svg/uph.svg";})
    spUp.addEventListener("mouseout",function(){sUp.src="../icons/clean_svg/up.svg";})

    spDw.addEventListener("mouseover",function(){sDw.src="../icons/clean_svg/dwh.svg";})
    spDw.addEventListener("mouseout",function(){sDw.src="../icons/clean_svg/dw.svg";})

    spRes.addEventListener("mouseover",function(){spRes.src="../icons/clean_svg/resh.svg";})
    spRes.addEventListener("mouseout",function(){spRes.src="../icons/clean_svg/res.svg";})

    spDef.addEventListener("mouseover",function(){sDef.src="../icons/clean_svg/defh.svg";})
    spDef.addEventListener("mouseout", function () { sDef.src = "../icons/clean_svg/def.svg"; })
  
    spRight.addEventListener("mouseover", function () { pR.src = "../icons/clean_svg/rightS.svg"; })
    spRight.addEventListener("mouseout", function () { pR.src = "../icons/clean_svg/right.svg"; })

    spLeft.addEventListener("mouseover", function () { pL.src = "../icons/clean_svg/leftS.svg"; })
    spLeft.addEventListener("mouseout", function () { pL.src = "../icons/clean_svg/left.svg"; })

    
}
main();

