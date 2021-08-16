function onGot(page) {
  var a=page.ms();
  //console.log(a)
}

function onError(error) {
  console.log(`Error: ${error}`);
}

if (typeof ver !== 'undefined') {
          var aver = document.getElementById("ver");
          aver.textContent = browser.runtime.getManifest().version;
      }


var getting = browser.runtime.getBackgroundPage()
getting.then(onGot, onError);

function onOpen(ishiden){
  if (true) {
    if (typeof xui !== 'undefined') {var alm = document.getElementById("xui");alm.textContent = "(incognito or passive)";}
    if (ishiden == true) {var acid = document.getElementById("ish_sw");acid.style.display = "none";};
  };
}


browser.runtime.onMessage.addListener(
    function(request) {
        if (request.msg === "pup") {
             if (typeof xui !== 'undefined') {
              var alm = document.getElementById("xui");
              alm.textContent = request.val;
            }
        }
    }
);

 
 var cad_isen = localStorage.getItem('Xytspch_isen');
 var cad_sett = localStorage.getItem('Xytspch_sett');
 //console.log(cad_sett)

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


function onExecuted(result) {
  console.log(`We executed in all subframes`);
}


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
  getting.then(onGot, onError);
}

spDw.onclick = function yt_spDw(){
  var executing = browser.tabs.executeScript({
  code: "xpdw();",
  allFrames: true
});
  getting.then(onGot, onError);
}

spRes.onclick = function yt_spRes(){
  var executing = browser.tabs.executeScript({
  code: "xpres();",
  allFrames: true
});
  getting.then(onGot, onError);
}

spDef.onclick = function yt_spDef(){
  var executing = browser.tabs.executeScript({
  code: "xpdef();"
  //allFrames: true
});
  getting.then(onGot, onError);
}

spUp.addEventListener("mouseover",function(){sUp.src="icons/clean_svg/uph.svg";})
spUp.addEventListener("mouseout",function(){sUp.src="icons/clean_svg/up.svg";})

spDw.addEventListener("mouseover",function(){sDw.src="icons/clean_svg/dwh.svg";})
spDw.addEventListener("mouseout",function(){sDw.src="icons/clean_svg/dw.svg";})

spRes.addEventListener("mouseover",function(){spRes.src="icons/clean_svg/resh.svg";})
spRes.addEventListener("mouseout",function(){spRes.src="icons/clean_svg/res.svg";})

spDef.addEventListener("mouseover",function(){sDef.src="icons/clean_svg/defh.svg";})
spDef.addEventListener("mouseout",function(){sDef.src="icons/clean_svg/def.svg";})

