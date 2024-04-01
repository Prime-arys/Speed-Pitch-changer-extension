//console.log("MAIN loaded")

//INITIAL

let rkc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // settings
var ytSpeed = false;
const Elem = "video,audio,source";

let context_SpeedPitchChanger_despaEll_jungle;
let ell_SpeedPitchChanger_despaEll_jungle;
let source_SpeedPitchChanger_despaEll_jungle;
let jungle_SpeedPitchChanger_despaEll_jungle;
let jungle_inject = false;

if (typeof mdc1 == 'undefined') {
  var mdc1 = false;
}

if (typeof mdc2 == 'undefined') {
  var mdc2 = false;
}


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

function semitone2magic(val) {
  let from_semitone = Math.pow(2, val / 12); // is this correct?
  return from_semitone.toFixed(16);

  /*
  // more accurate ? (but slower)
  let from_semitone = 1;
  for (let i = 0; i < math.abs(val); i++) {
    if (val > 0) {
      from_semitone *= 1.05946309436;
    } else {
      from_semitone /= 1.05946309436;
    }
  
  }
  return from_semitone;
  */

}

function ifsemitone(val) {
  if (val[0] == 't') {
    return semitone2magic(val.slice(1));
  }
  else {
    return val;
  }
  }

function main() {
  var ytSpeed; void 0 === ytSpeed && (ytSpeed = { playbackRate: 1, preservesPitch: (rkc[4] === '1'), init: function () { new MutationObserver(function (a) { ytSpeed.updateVideos() }).observe(document.querySelector("body"), { attributes: !0, childList: !0, characterData: !0, subtree: !0 }), ytSpeed.updateVideos() }, updateVideos: function () { for (var a = document.querySelectorAll(Elem), b = 0; b < a.length; ++b) { var c = a[b]; c.playbackRate = this.playbackRate, c.defaultPlaybackRate = this.playbackRate/*ensure*/,c.playbackRate_origin = this.playbackRate, c.defaultPlaybackRate_origin = this.playbackRate, c.mozPreservesPitch = this.preservesPitch, c.preservesPitch = this.preservesPitch/*add ff101+ compatibility*/ } }, speedUp: function () { this.playbackRate = meth_upd_p(this.playbackRate, rkc[6]), ytSpeed.updateVideos() }, speedDown: function () { this.playbackRate = meth_upd_m(this.playbackRate, rkc[6]), ytSpeed.updateVideos() }, reset: function () { this.playbackRate = 1, ytSpeed.updateVideos() }, prompt: function () { var a = prompt("New playback speed, t[value] to set as semitone:", this.playbackRate); a && (this.playbackRate = ifsemitone(a), ytSpeed.updateVideos()) } }, ytSpeed.init());
  return ytSpeed;
}

function handleResponse(message) {
  if (typeof message !== 'undefined') {
    //let setg = message.dm1.split(','); //get the settings from BG
    //rkc = setg;
    rkc = message.dm1.split(','); //get the settings from BG
    ytSpeed = main(); //active main fx

  }
}

//START

notifyBackgroundPage("dm1"); //request settings


/*function lg(){console.log(ytSpeed.playbackRate)}*/

function xpup() {
  ytSpeed.speedUp();
  ace_next();
}

function xpdw() {
  ytSpeed.speedDown();
  ace_next();
}

function xpres() {
  ytSpeed.reset();
  //var player = document.querySelector(".html5-main-video");
  ace_next();
  //ytSpeed.playbackRate=1;
}

function xpdef() {
  ytSpeed.prompt();
  notifyBackgroundPage("xpdef", ytSpeed.playbackRate);
  //lg();

}

function zpdef(x) {
  ytSpeed.playbackRate = x;
  ytSpeed.updateVideos()
  //console.log(x)
  ace_next();
}




function inject_jungle() {

  context_SpeedPitchChanger_despaEll_jungle = new AudioContext();
  ell_SpeedPitchChanger_despaEll_jungle = document.querySelectorAll("video,audio");
  //console.log(ell_SpeedPitchChanger_despaEll_jungle);
  source_SpeedPitchChanger_despaEll_jungle = [];
  for (let i = 0; i < ell_SpeedPitchChanger_despaEll_jungle.length; i++) {
    source_SpeedPitchChanger_despaEll_jungle.push(context_SpeedPitchChanger_despaEll_jungle.createMediaElementSource(ell_SpeedPitchChanger_despaEll_jungle[i]));
  }
  jungle_SpeedPitchChanger_despaEll_jungle = new Jungle(context_SpeedPitchChanger_despaEll_jungle);
  jungle_SpeedPitchChanger_despaEll_jungle.output.connect(context_SpeedPitchChanger_despaEll_jungle.destination);
  source_SpeedPitchChanger_despaEll_jungle.forEach(element => {
    element.connect(jungle_SpeedPitchChanger_despaEll_jungle.input);
  });
  jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(0, true); // value between -24 and 24 (true for semitones); 0 is no change;
  jungle_inject = true;
}

function inject_jungle_unDOM() {

  context_SpeedPitchChanger_despaEll_jungle = new AudioContext();
  ell_SpeedPitchChanger_despaEll_jungle = SpeedPitchChanger_despaEll_1.concat(SpeedPitchChanger_despaEll_2);
  //console.log(ell_SpeedPitchChanger_despaEll_jungle);
  source_SpeedPitchChanger_despaEll_jungle = [];
  for (let i = 0; i < ell_SpeedPitchChanger_despaEll_jungle.length; i++) {
    source_SpeedPitchChanger_despaEll_jungle.push(context_SpeedPitchChanger_despaEll_jungle.createMediaElementSource(ell_SpeedPitchChanger_despaEll_jungle[i]));
  }
  jungle_SpeedPitchChanger_despaEll_jungle = new Jungle(context_SpeedPitchChanger_despaEll_jungle);
  jungle_SpeedPitchChanger_despaEll_jungle.output.connect(context_SpeedPitchChanger_despaEll_jungle.destination);
  source_SpeedPitchChanger_despaEll_jungle.forEach(element => {
    element.connect(jungle_SpeedPitchChanger_despaEll_jungle.input);
  });
  jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(0, true); // value between -24 and 24 (true for semitones); 0 is no change;
  jungle_inject = true;
}

function vpup() {
  if (jungle_inject == false) {
    inject_jungle();
    window.eval(inject_jungle_unDOM.toString() + "inject_jungle_unDOM();");
    //console.log("INJECT JUNGLE");
  }
  let a = jungle_SpeedPitchChanger_despaEll_jungle.previousPitchNumber_SpeedPitchChanger_despaEll_jungle;
  jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(a + 1, true);
  window.eval("jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(jungle_SpeedPitchChanger_despaEll_jungle.previousPitchNumber_SpeedPitchChanger_despaEll_jungle + 1, true);")
  //var a = jungle_SpeedPitchChanger_despaEll_jungle.previousPitchNumber_SpeedPitchChanger_despaEll_jungle;jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(a + 1, true);
}

function vpdw() {
  if (jungle_inject == false) {
    inject_jungle();
    window.eval(inject_jungle_unDOM.toString() + "inject_jungle_unDOM();");
    //console.log("INJECT JUNGLE");
  }
  let a = jungle_SpeedPitchChanger_despaEll_jungle.previousPitchNumber_SpeedPitchChanger_despaEll_jungle;
  jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(a - 1, true);
  window.eval("jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(jungle_SpeedPitchChanger_despaEll_jungle.previousPitchNumber_SpeedPitchChanger_despaEll_jungle - 1, true);")
  //var a = jungle_SpeedPitchChanger_despaEll_jungle.previousPitchNumber_SpeedPitchChanger_despaEll_jungle;jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(a - 1, true);
}

function vpres() {
  if (jungle_inject == false) {
    inject_jungle();
    window.eval(inject_jungle_unDOM.toString() + "inject_jungle_unDOM();");
    //console.log("INJECT JUNGLE");
  }
  jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(0, true);
  window.eval("jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(0, true);")
  //jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(0, true);
}





document.onkeydown = function (evt) {
  if (rkc[5] == 1) {
    let keyboardEvent = document.createEvent("KeyboardEvent");
    let initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
    //console.log(evt.keyCode)

    // check if the user is typing in a text field
    if ((document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") && rkc[9] == 1) {
      return;
    }

    switch (evt.keyCode) {
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
  if (request.greeting == "actual_speed") {
    let a = 0;
    try {
      a = jungle_SpeedPitchChanger_despaEll_jungle.previousPitchNumber_SpeedPitchChanger_despaEll_jungle;
    } catch (error) {
      a = 0;
    }
    let mess = {
      actual_speed: ytSpeed.playbackRate,
      actual_pitch: a
    };
    return Promise.resolve(mess);
  };

  if (request.dmn == "actual_domain") {
    return Promise.resolve({ actual_domain: document.domain });
  };
});




function ace_next() {
  //console.log("ace : ",ytSpeed.playbackRate);

  var ace1 =
    `
    //console.log("ace1")
    //console.log(SpeedPitchChanger_despaEll_1);


    if(typeof SpeedPitchChanger_despaEll_1 == "undefined" || SpeedPitchChanger_despaEll_1 == []){

    console.log("ERROR: SpeedPitchChanger_despaEll_1 is undefined, init failed")
        
    } else {
      //Audio.prototype.play = Audio.prototype.original_play;
      SpeedPitchChanger_despaEll_1.forEach(function (spc_audio_element) {
        spc_audio_element.playbackRate = ${ytSpeed.playbackRate};
        spc_audio_element.playbackRate_origin = ${ytSpeed.playbackRate};
        spc_audio_element.defaultPlaybackRate = ${ytSpeed.playbackRate};
        spc_audio_element.defaultPlaybackRate_origin = ${ytSpeed.playbackRate};
        spc_audio_element.mozPreservesPitch = ${ytSpeed.preservesPitch};
        spc_audio_element.preservesPitch = ${ytSpeed.preservesPitch};
      });
    }
    `


  var ace2 =
    `
    //console.log("ace2")
    //console.log(SpeedPitchChanger_despaEll_2);
    for(var i = 0; i < SpeedPitchChanger_despaEll_2.length; i++){ /* change speed for all elements found (i havent seen this be more than 1 but you never know) */
        SpeedPitchChanger_despaEll_2[i].playbackRate = ${ytSpeed.playbackRate};
        SpeedPitchChanger_despaEll_2[i].playbackRate_origin = ${ytSpeed.playbackRate};
        SpeedPitchChanger_despaEll_2[i].defaultPlaybackRate = ${ytSpeed.playbackRate};
        SpeedPitchChanger_despaEll_2[i].defaultPlaybackRate_origin = ${ytSpeed.playbackRate};
        SpeedPitchChanger_despaEll_2[i].preservesPitch = ${ytSpeed.preservesPitch};
        SpeedPitchChanger_despaEll_2[i].mozPreservesPitch = ${ytSpeed.preservesPitch};
			}
      `
  if (mdc1) {
    window.eval(ace1);
  }
  if (mdc2) {
    window.eval(ace2);
  }


}



