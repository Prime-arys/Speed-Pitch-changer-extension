//console.log("loaded")

//INITIAL

var rkc=[0,0,0,0,0,0,0,0,0] // settings
var ytSpeed = false;
var Elem = "video,audio,source";

function meth_upd_p(el, n) {
  //console.log("METH ",el,n)
  if (n == 1) return el *= 1.05946309436;
  else if (n == 2) return el *= parseFloat(rkc[7]);
  else if (n == 3) return el += parseFloat(rkc[8]);
  }

function meth_upd_m(el, n) {
  if (n == 1) return el /= 1.05946309436;
  else if (n == 2) return el /= parseFloat(rkc[7]);
  else if (n == 3) return el -= parseFloat(rkc[8]);
}

function main(){
  var ytSpeed;void 0===ytSpeed&&(ytSpeed={playbackRate:1,preservesPitch:(rkc[4] === '1'),init:function(){new MutationObserver(function(a){ytSpeed.updateVideos()}).observe(document.querySelector("body"),{attributes:!0,childList:!0,characterData:!0,subtree:!0}),ytSpeed.updateVideos()},updateVideos:function(){for(var a=document.querySelectorAll(Elem),b=0;b<a.length;++b){var c=a[b];c.playbackRate=this.playbackRate,c.defaultPlaybackRate=this.playbackRate/*ensure*/,(c.mozPreservesPitch=this.preservesPitch&&1!=this.playbackRate)||(c.preservesPitch=this.preservesPitch&&1!=this.playbackRate)/*add ff101+ compatibility*/}},speedUp:function(){this.playbackRate=meth_upd_p(this.playbackRate,rkc[6]),ytSpeed.updateVideos()},speedDown:function(){this.playbackRate=meth_upd_m(this.playbackRate,rkc[6]),ytSpeed.updateVideos()},reset:function(){this.playbackRate=1,ytSpeed.updateVideos()},prompt:function(){var a=prompt("New playback speed:",this.playbackRate);a&&(this.playbackRate=a,ytSpeed.updateVideos())}},ytSpeed.init());
  return ytSpeed;
}

function handleResponse (message) {
  if (typeof message !== 'undefined') {
    var setg = message.dm1.split(','); //get the settings from BG
    rkc = setg;
    ytSpeed=main(); //active main fx
    
  }
}

//START

notifyBackgroundPage("dm1"); //request settings

/*function lg(){console.log(ytSpeed.playbackRate)}*/

function xpup(){
  ytSpeed.speedUp();
  ace_next();
}

function xpdw(){
  ytSpeed.speedDown();
  ace_next(); 
}

function xpres(){
  ytSpeed.reset();
  //var player = document.querySelector(".html5-main-video");
  ace_next();
  //ytSpeed.playbackRate=1;
}

function xpdef(){
  ytSpeed.prompt();
  notifyBackgroundPage("xpdef",ytSpeed.playbackRate);
  //lg();
  
}

function zpdef(x){
  ytSpeed.playbackRate=x;
  ytSpeed.updateVideos()
  //console.log(x)
  ace_next();
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
  if (rkc[5] == 1) {
    var keyboardEvent = document.createEvent("KeyboardEvent");
    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    //console.log(evt.keyCode)

      switch (evt.keyCode)
      {
          case parseInt(rkc[0]): notifyBackgroundPage("xpres"); break;
          case parseInt(rkc[1]): notifyBackgroundPage("xpup"); break;
          case parseInt(rkc[2]): notifyBackgroundPage("xpdw"); break;
          case parseInt(rkc[3]): xpdef(); break;
  
    }
  }
};


browser.runtime.onMessage.addListener(request => {
  //console.log("Message from the background script:");
  //console.log(request.greeting);
  //console.log(ytSpeed.playbackRate);
  if (request.greeting == "actual_speed"){
    return Promise.resolve({actual_speed: ytSpeed.playbackRate});
  }
  if (request.dmn == "actual_domain"){
    return Promise.resolve({actual_domain: document.domain});
  }
});




function ace_next() {
  //console.log("ace : ",ytSpeed.playbackRate);

  var ace1 =
    `
    if(typeof SpeedPitchChangerEll == "undefined"){

    console.log("ERROR: SpeedPitchChangerEll is undefined, init failed")
        
    } else {
      Audio.prototype.play = Audio.prototype.original_play;
      SpeedPitchChangerEll.forEach(function (spc_audio_element) {
        spc_audio_element.playbackRate = ${ytSpeed.playbackRate};
        spc_audio_element.defaultPlaybackRate = ${ytSpeed.playbackRate};
        spc_audio_element.mozPreservesPitch = ${ytSpeed.preservesPitch};
        spc_audio_element.preservesPitch = ${ytSpeed.preservesPitch};
      });
    }
    `
  
  
  var ace2 =
    `
    for(var i = 0; i < spc_VideoElementsMade.length; i++){ /* change speed for all elements found (i havent seen this be more than 1 but you never know) */
      spc_VideoElementsMade[i].playbackRate = ${ytSpeed.playbackRate};
      spc_VideoElementsMade[i].defaultPlaybackRate = ${ytSpeed.playbackRate};
      spc_VideoElementsMade[i].preservesPitch = ${ytSpeed.preservesPitch};
      spc_VideoElementsMade[i].mozPreservesPitch = ${ytSpeed.preservesPitch};
			}
      `

  if (mdc1) { window.eval(ace1); }
  if (mdc2) { window.eval(ace2); }
}

