import ipc_kco from './char_kcode.js';

var cad_sett = localStorage.getItem('Xytspch_sett');
var ddd = 0;
var fkc=0;
var xxch=0;

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

document.onkeyup = function(evt)
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
    var cad_sett = localStorage.getItem('Xytspch_sett');
    var ca_kc = cad_sett.split(",");
  	var zlm = document.getElementById("CMs");
    zlm.textContent = "Commands (custom) :";
    var updK = [ffkc[0],ffkc[1],ffkc[2],ffkc[3],ca_kc[4],ca_kc[5]]
    localStorage.setItem('Xytspch_sett', updK);
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
Checkbox.onchange = function(){
  var cad_sett = localStorage.getItem('Xytspch_sett');
  var ca_kc = cad_sett.split(",");
  
  if(Checkbox.checked) {
    var tmp_rkc=[ca_kc[0],ca_kc[1],ca_kc[2],ca_kc[3],1,ca_kc[5]];
    localStorage.setItem('Xytspch_sett',tmp_rkc );
    console.log(Checkbox.checked);

  } else {

      var tmp_rkc=[ca_kc[0],ca_kc[1],ca_kc[2],ca_kc[3],!1,ca_kc[5]];
      localStorage.setItem('Xytspch_sett',tmp_rkc );
      console.log(Checkbox.checked);

  }

}

var Checkbox2 = document.querySelector('input[value="isenable_bt"]');
Checkbox2.onchange = function(){
  var cad_sett = localStorage.getItem('Xytspch_sett');
  var ca_kc = cad_sett.split(",");
  
  if(Checkbox2.checked) {
    var tmp_rkc=[ca_kc[0],ca_kc[1],ca_kc[2],ca_kc[3],ca_kc[4],1];
    localStorage.setItem('Xytspch_sett',tmp_rkc );
    console.log(Checkbox2.checked);

  } else {

      var tmp_rkc=[ca_kc[0],ca_kc[1],ca_kc[2],ca_kc[3],ca_kc[4],0];
      localStorage.setItem('Xytspch_sett',tmp_rkc );
      console.log(Checkbox2.checked);

  }

}


aply.onclick = function aplu(){
	browser.runtime.reload()
}