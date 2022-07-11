import ipc_kco from './char_kcode.js';

function onError(error) {
    console.log(`Error: ${error}`);
  }

var hidden = false;
var master = false;
var cad_sett;
var ddd = 0;
var fkc =0;
var xxch = 0;
//console.log("Chargement de la page");

//async function get_cstt() qui recupère le contenu de localStorage grâce au message avec background.js à l'aide de la méthode sendMessage et d'une promesse
function get_cstt() {
  return new Promise(function (resolve) {
    browser.runtime.sendMessage({ type: "get_cstt" }).then(response => {
      resolve(response.response_cstt);
    }).catch(onError);
  });
}



function set_cstt(val) {
  browser.runtime.sendMessage({ type: "set_cstt", val: val });
}

function logTabs(tabs) {
  for (let tab of tabs) {
    hidden = tab.incognito;
  }
  master = main();
}

var querying = browser.tabs.query({currentWindow: true, active: true});
querying.then(logTabs, onError);

async function main() {

  var cad_sett = await get_cstt();

  var dres = document.getElementById("res");
  var dsup = document.getElementById("sup");
  var dsdw = document.getElementById("sdw");
  var dset = document.getElementById("set");
  var aply = document.getElementById("apl");
  var tKC =0;

  dres.textContent=ipc_kco[cad_sett.split(",")[0]];
  dsup.textContent=ipc_kco[cad_sett.split(",")[1]];
  dsdw.textContent=ipc_kco[cad_sett.split(",")[2]];
  dset.textContent=ipc_kco[cad_sett.split(",")[3]];


  var ca_kc = cad_sett.split(",")
  var	fres = parseInt(ca_kc[0])
  var	fsup = parseInt(ca_kc[1])
  var fsdw = parseInt(ca_kc[2])
  var fset = parseInt(ca_kc[3])
  var ffkc=[fres,fsup,fsdw,fset,ca_kc[4],ca_kc[5]];

  dres.addEventListener("mouseover",function(){dres.style.background = "#EFDBC8"})
  dres.addEventListener("mouseout",function(){dres.style.background = "#D9DAEA"})
  dsup.addEventListener("mouseover",function(){dsup.style.background = "#EFDBC8"})
  dsup.addEventListener("mouseout",function(){dsup.style.background = "#D9DAEA"})
  dsdw.addEventListener("mouseover",function(){dsdw.style.background = "#EFDBC8"})
  dsdw.addEventListener("mouseout",function(){dsdw.style.background = "#D9DAEA"})
  dset.addEventListener("mouseover",function(){dset.style.background = "#EFDBC8"})
  dset.addEventListener("mouseout",function(){dset.style.background = "#D9DAEA"})

  dres.onclick = function cm_dres(){getKC(0);xxch=0;}
  dsup.onclick = function cm_dsup(){getKC(1);xxch=1;}
  dsdw.onclick = function cm_dsdw(){getKC(2);xxch=2;}
  dset.onclick = function cm_dset(){getKC(3);xxch=3;}
  

  document.onkeydown = function(evt)
  {
    var keyboardEvent = document.createEvent("KeyboardEvent");
    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    tKC = evt.keyCode;
    //console.log(tKC)
    //console.log(cad_sett)
    if (ddd==0){
    	if(tKC == fres ){document.getElementById("res").style.background = "#ECCDAC";};
    	if(tKC == fsup ){document.getElementById("sup").style.background = "#ECCDAC";};
    	if(tKC == fsdw ){document.getElementById("sdw").style.background = "#ECCDAC";};
    	if(tKC == fset ){document.getElementById("set").style.background = "#ECCDAC";};
    }
    if (ddd==1){
    	fkc=tKC;
    	ffkc[xxch]=fkc;

    }


  };

  document.onkeyup = async function(evt)
  {
    var keyboardEvent = document.createEvent("KeyboardEvent");
    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    tKC = evt.keyCode;
    //console.log(tKC)
    //console.log(cad_sett)
    if (ddd==0){
    	if(tKC == fres ){document.getElementById("res").style.background = "#D9DAEA";};
    	if(tKC == fsup ){document.getElementById("sup").style.background = "#D9DAEA";};
    	if(tKC == fsdw ){document.getElementById("sdw").style.background = "#D9DAEA";};
    	if(tKC == fset ){document.getElementById("set").style.background = "#D9DAEA";};
  	}
    if (ddd==1) {
    	//console.log(ffkc)
    	ddd=0
      var cad_sett = await get_cstt();
      var ca_kc = cad_sett.split(",");
    	var zlm = document.getElementById("CMs");
      zlm.textContent = "Commands (custom) :";
      var updK = [ffkc[0], ffkc[1], ffkc[2], ffkc[3], ca_kc[4], ca_kc[5]];
      set_cstt(updK);
      window.location.reload()


    }


  };


  if (ca_kc[4] == 1){
    document.getElementById("on_off_sp").checked = true;
  }
  if (ca_kc[5] == 1){
    document.getElementById("on_off_bt").checked = true;
  }
 
  var Checkbox = document.querySelector('input[value="isenable_sp"]');
  Checkbox.onchange = async function(){
    var cad_sett = await get_cstt();
    var ca_kc = cad_sett.split(",");

    if(Checkbox.checked) {
      var tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], 1, ca_kc[5]];
      set_cstt(tmp_rkc);
      console.log(Checkbox.checked);
    
    } else {
    
        var tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], !1, ca_kc[5]];
        set_cstt(tmp_rkc);
        console.log(Checkbox.checked);
    
    }
   
  }
 
  var Checkbox2 = document.querySelector('input[value="isenable_bt"]');
  Checkbox2.onchange = async function(){
    var cad_sett = await get_cstt();
    var ca_kc = cad_sett.split(",");
    

    if(Checkbox2.checked) {
      var tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], 1];
      set_cstt(tmp_rkc);
      console.log(Checkbox2.checked);
    
    } else {
    
        var tmp_rkc = [ca_kc[0], ca_kc[1], ca_kc[2], ca_kc[3], ca_kc[4], 0];
        set_cstt(tmp_rkc);
        console.log(Checkbox2.checked);
    
    }
   
  }
  //if(hidden == true){Checkbox.disabled = true;Checkbox2.disabled = true;}
 
 
  aply.onclick = function aplu(){
    browser.runtime.reload()
  }
}



function getKC(xh) {
	ddd=1
	var zlm = document.getElementById("CMs");
    zlm.textContent = "Waiting for a key press";
}

function pressKey(keyCode)
{
  var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent("Events");

  if(eventObj.initEvent)
  {
    eventObj.initEvent("keydown", true, true);
  }

  eventObj.keyCode = keyCode;
  eventObj.shiftKey = true;

  if (document.dispatchEvent)
  {
    document.dispatchEvent(eventObj);
  }
  else
  {
    document.fireEvent("onkeydown", eventObj);
  }
}
