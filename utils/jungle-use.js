

// Stuff from:
// https://github.com/mmckegg/soundbank-pitch-shift/blob/master/index.js
// https://github.com/foxdog-studios/pitch-shifter-chrome-extension/blob/master/src/jungle.js
// (original) https://github.com/cwilso/Audio-Input-Effects/blob/master/js/jungle.js

//original copyright:

// Copyright 2012, Google Inc.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//     * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.



//VARs
var delayTime_SpeedPitchChanger_despaEll_jungle = 0.100;
var fadeTime_SpeedPitchChanger_despaEll_jungle = 0.050;
var bufferTime_SpeedPitchChanger_despaEll_jungle = 0.100;
var previousPitch_SpeedPitchChanger_despaEll_jungle = -1;


function createFadeBuffer(context, activeTime, fadeTime_SpeedPitchChanger_despaEll_jungle) {
    var length1 = activeTime * context.sampleRate;
    var length2 = (activeTime - 2*fadeTime_SpeedPitchChanger_despaEll_jungle) * context.sampleRate;
    var length = length1 + length2;
    var buffer = context.createBuffer(1, length, context.sampleRate);
    var p = buffer.getChannelData(0);

    var fadeLength = fadeTime_SpeedPitchChanger_despaEll_jungle * context.sampleRate;

    var fadeIndex1 = fadeLength;
    var fadeIndex2 = length1 - fadeLength;

    // 1st part of cycle
    for (var i = 0; i < length1; ++i) {
        var value;

        if (i < fadeIndex1) {
            value = Math.sqrt(i / fadeLength);
        } else if (i >= fadeIndex2) {
            value = Math.sqrt(1 - (i - fadeIndex2) / fadeLength);
        } else {
            value = 1;
        }

        p[i] = value;
    }

    // 2nd part
    for (var i = length1; i < length; ++i) {
        p[i] = 0;
    }


    return buffer;
}

function createDelayTimeBuffer(context, activeTime, fadeTime_SpeedPitchChanger_despaEll_jungle, shiftUp) {
    var length1 = activeTime * context.sampleRate;
    var length2 = (activeTime - 2*fadeTime_SpeedPitchChanger_despaEll_jungle) * context.sampleRate;
    var length = length1 + length2;
    var buffer = context.createBuffer(1, length, context.sampleRate);
    var p = buffer.getChannelData(0);

    // 1st part of cycle
    for (var i = 0; i < length1; ++i) {
        if (shiftUp)
          // This line does shift-up transpose
          p[i] = (length1-i)/length;
        else
          // This line does shift-down transpose
          p[i] = i / length1;
    }

    // 2nd part
    for (var i = length1; i < length; ++i) {
        p[i] = 0;
    }

    return buffer;
}



function Jungle(context) {
    this.context = context;
    // Create nodes for the input and output of this "module".
    var input = context.createGain();
    var output = context.createGain();
    this.input = input;
    this.output = output;

    this.previousPitch_SpeedPitchChanger_despaEll_jungle = 0;
    this.previousPitchNumber_SpeedPitchChanger_despaEll_jungle = 0;

    // Delay modulation.
    var mod1 = context.createBufferSource();
    var mod2 = context.createBufferSource();
    var mod3 = context.createBufferSource();
    var mod4 = context.createBufferSource();
    this.shiftDownBuffer = createDelayTimeBuffer(context, bufferTime_SpeedPitchChanger_despaEll_jungle, fadeTime_SpeedPitchChanger_despaEll_jungle, false);
    this.shiftUpBuffer = createDelayTimeBuffer(context, bufferTime_SpeedPitchChanger_despaEll_jungle, fadeTime_SpeedPitchChanger_despaEll_jungle, true);
    mod1.buffer = this.shiftDownBuffer;
    mod2.buffer = this.shiftDownBuffer;
    mod3.buffer = this.shiftUpBuffer;
    mod4.buffer = this.shiftUpBuffer;
    mod1.loop = true;
    mod2.loop = true;
    mod3.loop = true;
    mod4.loop = true;

    // for switching between oct-up and oct-down
    var mod1Gain = context.createGain();
    var mod2Gain = context.createGain();
    var mod3Gain = context.createGain();
    mod3Gain.gain.value = 0;
    var mod4Gain = context.createGain();
    mod4Gain.gain.value = 0;

    mod1.connect(mod1Gain);
    mod2.connect(mod2Gain);
    mod3.connect(mod3Gain);
    mod4.connect(mod4Gain);

    // Delay amount for changing pitch.
    var modGain1 = context.createGain();
    var modGain2 = context.createGain();

    var delay1 = context.createDelay(5);
    var delay2 = context.createDelay(5);
    mod1Gain.connect(modGain1);
    mod2Gain.connect(modGain2);
    mod3Gain.connect(modGain1);
    mod4Gain.connect(modGain2);
    modGain1.connect(delay1.delayTime);
    modGain2.connect(delay2.delayTime);

    // Crossfading.
    var fade1 = context.createBufferSource();
    var fade2 = context.createBufferSource();
    var fadeBuffer = createFadeBuffer(context, bufferTime_SpeedPitchChanger_despaEll_jungle, fadeTime_SpeedPitchChanger_despaEll_jungle);
    fade1.buffer = fadeBuffer
    fade2.buffer = fadeBuffer;
    fade1.loop = true;
    fade2.loop = true;

    var mix1 = context.createGain();
    var mix2 = context.createGain();
    mix1.gain.value = 0;
    mix2.gain.value = 0;

    fade1.connect(mix1.gain);
    fade2.connect(mix2.gain);

    // Connect processing graph.
    input.connect(delay1);
    input.connect(delay2);
    delay1.connect(mix1);
    delay2.connect(mix2);
    mix1.connect(output);
    mix2.connect(output);

    // Start
    var t = context.currentTime + 0.050;
    var t2 = t + bufferTime_SpeedPitchChanger_despaEll_jungle - fadeTime_SpeedPitchChanger_despaEll_jungle;
    mod1.start(t);
    mod2.start(t2);
    mod3.start(t);
    mod4.start(t2);
    fade1.start(t);
    fade2.start(t2);

    this.mod1 = mod1;
    this.mod2 = mod2;
    this.mod1Gain = mod1Gain;
    this.mod2Gain = mod2Gain;
    this.mod3Gain = mod3Gain;
    this.mod4Gain = mod4Gain;
    this.modGain1 = modGain1;
    this.modGain2 = modGain2;
    this.fade1 = fade1;
    this.fade2 = fade2;
    this.mix1 = mix1;
    this.mix2 = mix2;
    this.delay1 = delay1;
    this.delay2 = delay2;

    this.setDelay(delayTime_SpeedPitchChanger_despaEll_jungle);
}

Jungle.prototype.setDelay = function(delayTime_SpeedPitchChanger_despaEll_jungle) {
    this.modGain1.gain.setTargetAtTime(0.5 * delayTime_SpeedPitchChanger_despaEll_jungle, this.context.currentTime, 0.010);
    this.modGain2.gain.setTargetAtTime(0.5 * delayTime_SpeedPitchChanger_despaEll_jungle, this.context.currentTime, 0.010);
}


Jungle.prototype.setPitchOffset = function (mult, transpose) {
  this.previousPitchNumber_SpeedPitchChanger_despaEll_jungle = mult;
  //console.log("MULT: " + mult);
    if (transpose) {
      // Divide by 2 for semitones
      //mult = this.transpose(mult / 2);
      //mult = mult / 6;
      mult = this.SemiToneTranspose(mult);
      //console.log("MULT out: " + mult);
    }
    if (mult>0) { // pitch up
        this.mod1Gain.gain.value = 0;
        this.mod2Gain.gain.value = 0;
        this.mod3Gain.gain.value = 1;
        this.mod4Gain.gain.value = 1;
    } else { // pitch down
        this.mod1Gain.gain.value = 1;
        this.mod2Gain.gain.value = 1;
        this.mod3Gain.gain.value = 0;
        this.mod4Gain.gain.value = 0;
    }
    this.setDelay(delayTime_SpeedPitchChanger_despaEll_jungle*Math.abs(mult));
    this.previousPitch_SpeedPitchChanger_despaEll_jungle = mult;
    previousPitch_SpeedPitchChanger_despaEll_jungle = mult;
}


/* Jungle.prototype.transpose = function (x) {
  console.log("Transpose Mult in: " + x);

  if (x<0){
    return x/12
  } else if (x == 0) {
    return 0;
  } else {
    var a5 = 1.8149080040913423e-7
    var a4 = -0.000019413043101157434
    var a3 = 0.0009795096626987743
    var a2 = -0.014147877819596033
    var a1 = 0.23005591195033048
    var a0 = 0.02278153473118749

    var x1 = x
    var x2 = x*x
    var x3 = x*x*x
    var x4 = x*x*x*x
    var x5 = x*x*x*x*x

    console.log("Transpose Mult out: " + (a0 + x1*a1 + x2*a2 + x3*a3 + x4*a4 + x5*a5));
    return a0 + x1*a1 + x2*a2 + x3*a3 + x4*a4 + x5*a5
  }

} */


Jungle.prototype.SemiToneTranspose = function (x) {
  // Suite géométrique des demi-tons / Geometric series of semitones
  let a = 1.0594630943592953
  return (Math.pow(a, x) - 1) * 2
}


var jungleCode_0 = `
var delayTime_SpeedPitchChanger_despaEll_jungle = 0.100;
var fadeTime_SpeedPitchChanger_despaEll_jungle = 0.050;
var bufferTime_SpeedPitchChanger_despaEll_jungle = 0.100;
var previousPitch_SpeedPitchChanger_despaEll_jungle = -1;
`
var jungleCode_1 = createFadeBuffer.toString();
var jungleCode_2 = createDelayTimeBuffer.toString();
var jungleCode_3 = Jungle.toString();
var jungleCode_4 = "Jungle.prototype.setDelay = " + Jungle.prototype.setDelay.toString();
var jungleCode_5 = "Jungle.prototype.setPitchOffset = " + Jungle.prototype.setPitchOffset.toString();
var jungleCode_6 = "Jungle.prototype.SemiToneTranspose = " + Jungle.prototype.SemiToneTranspose.toString();

var jungleCode = jungleCode_0 +"\n\n"+ jungleCode_1 +"\n\n"+ jungleCode_2 +"\n\n"+ jungleCode_3 +"\n\n"+ jungleCode_4 +"\n\n"+ jungleCode_5 +"\n\n"+ jungleCode_6 +"\n\n";

//console.log(jungleCode);
window.eval(jungleCode);
/*
window.eval(jungleCode_0);
window.eval(jungleCode_1);
window.eval(jungleCode_2);
window.eval(jungleCode_3);
window.eval(jungleCode_4);
window.eval(jungleCode_5);
window.eval(jungleCode_6);
*/


/*
//########### TEST #############

// Create a new audio context.
var context_SpeedPitchChanger_despaEll_jungle = new AudioContext();

// get the video element
var ell_SpeedPitchChanger_despaEll_jungle = document.querySelectorAll('video, audio');

// Set up the audio source as a element.
var source_SpeedPitchChanger_despaEll_jungle = [];
for (var i=0; i<ell_SpeedPitchChanger_despaEll_jungle.length; i++){
  source_SpeedPitchChanger_despaEll_jungle.push(context_SpeedPitchChanger_despaEll_jungle.createMediaElementSource(ell_SpeedPitchChanger_despaEll_jungle[i]));
}

// Create a new Jungle object.
var jungle_SpeedPitchChanger_despaEll_jungle = new Jungle(context_SpeedPitchChanger_despaEll_jungle);

// Connect the Jungle to the destination.
jungle_SpeedPitchChanger_despaEll_jungle.output.connect(context_SpeedPitchChanger_despaEll_jungle.destination);

// Connect the source to the Jungle.

source_SpeedPitchChanger_despaEll_jungle.forEach(element => {
    element.connect(jungle_SpeedPitchChanger_despaEll_jungle.input);
    
});

// Set the pitch offset.
jungle_SpeedPitchChanger_despaEll_jungle.setPitchOffset(0, true); // value between -24 and 24 (true for semitones); 0 is no change;

*/

