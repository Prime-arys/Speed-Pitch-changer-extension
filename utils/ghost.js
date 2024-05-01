//console.log("ace2");
// Création de la fonction qui remplacera la méthode createElement

"use strict";
var mdc_ghost = true;
/*
var ghost_ace = `
console.log("ace ghost");
var originalPlaybackRateProtoype_spcdespa = HTMLMediaElement.prototype.playbackRate;
var originalDefaultPlaybackRateProtoype_spcdespa = HTMLMediaElement.prototype.defaultPlaybackRate
HTMLMediaElement.prototype.playbackRate_origin = originalPlaybackRateProtoype_spcdespa;
HTMLMediaElement.prototype.defaultPlaybackRate_origin = originalDefaultPlaybackRateProtoype_spcdespa;

HTMLMediaElement.prototype.playbackRate = function (val) {

    // This will cancel the original method
    console.log("HTMLMediaElement.prototype.playbackRate", val);
    return null;

};

HTMLMediaElement.prototype.defaultPlaybackRate = function (val) {
    
    // This will cancel the original method
    console.log("HTMLMediaElement.prototype.defaultPlaybackRate", val);
    return null;
    
};


console.log(HTMLMediaElement.prototype.playbackRate);
console.log(HTMLMediaElement.prototype.defaultPlaybackRate);



`;
*/


var ghost_ace = `
console.log("ace ghost");

originalPlaybackRateDescriptor_spcdespa = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
originalDefaultPlaybackRateDescriptor_spcdespa = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'defaultPlaybackRate');


Object.defineProperty(HTMLMediaElement.prototype,'playbackRate',{
    set:function(value){
        if(typeof value === "object" && value[1] === "spcdespa"){
            originalPlaybackRateDescriptor_spcdespa.set.call(this,value[0]);
            //console.log('value changed',value);
        }
        else{
            //console.log('value not changed',this,value);
        }
    },
    get:originalPlaybackRateDescriptor_spcdespa.get
});



Object.defineProperty(HTMLMediaElement.prototype,'defaultPlaybackRate',{
    set:function(value){
        if(typeof value === "object" && value[1] === "spcdespa"){
            originalDefaultPlaybackRateDescriptor_spcdespa.set.call(this,value[0]);
            //console.log('value changed',value);
        }
    },
    get:originalDefaultPlaybackRateDescriptor_spcdespa.get
});


Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate_origin_${Random}', {
    set: function(newRate) {
        // appel de la méthode originale avec les deux paramètres
        //console.log("playbackRate_origin", this, newRate);
        this.playbackRate = [newRate, "spcdespa"];
        
    }
});

Object.defineProperty(HTMLMediaElement.prototype, 'defaultPlaybackRate_origin_${Random}', {
    set: function(newRate) {
        this.defaultPlaybackRate = [newRate, "spcdespa"];

    }
});



`;



window.eval(ghost_ace);