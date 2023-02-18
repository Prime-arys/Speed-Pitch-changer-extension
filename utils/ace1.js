//console.log("initEvent")
"use strict";
var mdc1 = true;
//var mcd2 = false;
var ace1 =
  `
  console.log("ace1")
  var SpeedPitchChanger_despaEll_firstPlay = true;
  var SpeedPitchChanger_despaEll_ct = 0;
  if (SpeedPitchChanger_despaEll_firstPlay == true) {
  var OGP = Audio.prototype.play;
  }
  var SpeedPitchChanger_despaEll_1 = [];
  

    Audio.prototype.original_play = OGP;

    Audio.prototype.play = Audio.prototype.original_play;

    Audio.prototype.play = function () {
      SpeedPitchChanger_despaEll_ct++;
      console.log("play ct: ", SpeedPitchChanger_despaEll_ct);
      console.log(this)
      //verifier si l'element est deja dans le tableau
      if (SpeedPitchChanger_despaEll_1.includes(this)) {
        console.log("already in array");
        console.log(SpeedPitchChanger_despaEll_1);
      } else {
        SpeedPitchChanger_despaEll_1.push(this);
      }
      var p = this.original_play(arguments);
      if (SpeedPitchChanger_despaEll_firstPlay == true) {
        console.log("first play");
        this.pause();
        //SpeedPitchChanger_despaEll_firstPlay = false;
      }
      
      return p;
}

var OGPu = Audio.prototype.pause;

Audio.prototype.original_pause = OGPu;

Audio.prototype.pause = Audio.prototype.original_pause;

Audio.prototype.pause = function () {
  console.log(this)
  //verifier si l'element est deja dans le tableau
  if (SpeedPitchChanger_despaEll_1.includes(this)) {
    console.log("already in array");
    console.log(SpeedPitchChanger_despaEll_1);
  } else {
    SpeedPitchChanger_despaEll_1.push(this);
  }
  if (SpeedPitchChanger_despaEll_firstPlay == true) {
    console.log("first play");
    SpeedPitchChanger_despaEll_firstPlay = false;
    this.play();
    
  }
  var p = this.original_pause(arguments);
  
  return p;
}




    `;

//wait for the page to load

  console.log("ace1")
window.eval(ace1);








//ajout le script dans la page
/*
var script = document.createElement('script');
script.textContent = ace1;
(document.head || document.documentElement).appendChild(script);
script.remove();
*/


/*
console.log("ace1")
    const OGP = Audio.prototype.play;
    var SpeedPitchChanger_despaEll_1 = [];

      Audio.prototype.original_play = OGP;

      Audio.prototype.play = Audio.prototype.original_play;

      Audio.prototype.play = function () {
        console.log(this)
        SpeedPitchChanger_despaEll_1.push(this);
        Audio.prototype.play = Audio.prototype.original_play;
          this.original_play(arguments);
}*/
    
/*
console.log("ace1")
    var OGP = Audio.prototype.play;
    var SpeedPitchChanger_despaEll_1 = [];

      Audio.prototype.original_play = OGP;

      Audio.prototype.play = Audio.prototype.original_play;

      Audio.prototype.play = function () {
        console.log(this)
        var p = this.original_play(arguments);
        //verifier si l'element est deja dans le tableau
        if (SpeedPitchChanger_despaEll_1.includes(this)) {
          console.log("already in array");
        } else {
          SpeedPitchChanger_despaEll_1.push(this);
        }
        
        return p;
}

*/


