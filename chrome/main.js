var rkc=[0,0,0,0,0,0]
var ytSpeed=false;

function main(){
  var ytSpeed;void 0===ytSpeed&&(ytSpeed={playbackRate:1,preservesPitch:(rkc[4] === '1'),init:function(){new MutationObserver(function(a){ytSpeed.updateVideos()}).observe(document.querySelector("body"),{attributes:!0,childList:!0,characterData:!0,subtree:!0}),ytSpeed.updateVideos()},updateVideos:function(){for(var a=document.querySelectorAll("video,audio"),b=0;b<a.length;++b){var c=a[b];c.playbackRate=this.playbackRate,c.preservesPitch=this.preservesPitch&&1!=this.playbackRate}},speedUp:function(){this.playbackRate*=1.05946309436,ytSpeed.updateVideos()},speedDown:function(){this.playbackRate/=1.05946309436,ytSpeed.updateVideos()},reset:function(){this.playbackRate=1,ytSpeed.updateVideos()},prompt:function(){var a=prompt("New playback speed:",this.playbackRate);a&&(this.playbackRate=a,ytSpeed.updateVideos())}},ytSpeed.init());
  console.log("LOADED")
  return ytSpeed;
}

function handleResponse (message) {
  //console.log('e1')
  if (typeof message !== 'undefined'){
    var setg = message.response_dm1.split(',');
    //var tst0=message.response_dm1;
    //console.log('e2')
    rkc = setg;
    //console.log(setg);
    //console.log(rkc[4]);
    //console.log(tst0)
    ytSpeed=main();
  }
}


function notifyBackgroundPage(e,xfg) {
  //console.log('a1');
  chrome.runtime.sendMessage({setit : e, xdf : xfg}, function(response){handleResponse(response);});
  //console.log('a2');
}

notifyBackgroundPage("dm1");

/*function lg(){console.log(ytSpeed.playbackRate)}*/

function xpup(){
  ytSpeed.speedUp();
  //lg();
}

function xpdw(){
  ytSpeed.speedDown();
  //lg(); 
}

function xpres(){
  ytSpeed.reset();
  var player = document.querySelector(".html5-main-video");
  //lg();
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

    switch (evt.keyCode)
    {
      case parseInt(rkc[0]): notifyBackgroundPage("xpres"); break;
      case parseInt(rkc[1]): notifyBackgroundPage("xpup"); break;
      case parseInt(rkc[2]): notifyBackgroundPage("xpdw"); break;
      case parseInt(rkc[3]): xpdef(); break;

    }
  }
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //console.log("Message from the background script:");
  //console.log(request.greeting);
  //console.log(ytSpeed.playbackRate);
  if (request.greeting == "bgs"){
    //console.log("is bgs?Ok")
    sendResponse({response: ytSpeed.playbackRate}) 
  //return Promise.resolve({response: ytSpeed.playbackRate});
}
});

