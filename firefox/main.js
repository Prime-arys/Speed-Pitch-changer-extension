//console.log("loaded")
var rkc=[0,0,0,0,0,0]
var ytSpeed=false;

function main(){
  var ytSpeed;void 0===ytSpeed&&(ytSpeed={playbackRate:1,preservesPitch:(rkc[4] === '1'),init:function(){new MutationObserver(function(a){ytSpeed.updateVideos()}).observe(document.querySelector("body"),{attributes:!0,childList:!0,characterData:!0,subtree:!0}),ytSpeed.updateVideos()},updateVideos:function(){for(var a=document.querySelectorAll("video,audio"),b=0;b<a.length;++b){var c=a[b];c.playbackRate=this.playbackRate,c.mozPreservesPitch=this.preservesPitch&&1!=this.playbackRate}},speedUp:function(){this.playbackRate*=1.05946309436,ytSpeed.updateVideos()},speedDown:function(){this.playbackRate/=1.05946309436,ytSpeed.updateVideos()},reset:function(){this.playbackRate=1,ytSpeed.updateVideos()},prompt:function(){var a=prompt("New playback speed:",this.playbackRate);a&&(this.playbackRate=a,ytSpeed.updateVideos())}},ytSpeed.init());
  return ytSpeed;
}

function handleResponse (message) {
  if (typeof message !== 'undefined'){
    var setg = message.response_dm1.split(',');
    rkc = setg;
    ytSpeed=main();
    //console.log(setg);
    //console.log(rkc[4]);
  }
}

function handleError(error) {
  console.log(`Error: ${error}`);

}

function notifyBackgroundPage(e,xfg) {
  var sending = browser.runtime.sendMessage({
    setit: e,
    xdf: xfg
  });
  sending.then(handleResponse, handleError);
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
  if (request.greeting == "bgs"){
  return Promise.resolve({response: ytSpeed.playbackRate});}
});
