//console.log("initEvent")
var mdc1 = true;
//var mcd2 = false;
var ace1 =
    `

    var OGP = Audio.prototype.play;
    var SpeedPitchChangerEll = [];

      Audio.prototype.original_play = OGP;

      Audio.prototype.play = Audio.prototype.original_play;

      Audio.prototype.play = function () {
        console.log(this)
        SpeedPitchChangerEll.push(this);
        Audio.prototype.play = Audio.prototype.original_play;
          this.original_play(arguments);
    }
    
    `

window.eval(ace1);