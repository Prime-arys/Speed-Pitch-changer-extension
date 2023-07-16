// Taken and adapted from: https://github.com/faf0/spotitySpeedExtension/tree/faf0/fix-issue-7
//console.log("initEvent_SPOTIFY")
//var mcd1 = false;
"use strict";
var mdc2 = true;
var ace2 = `
console.log("ace2")
// Création de la fonction qui remplacera la méthode createElement
var SpeedPitchChanger_despaEll_2 = [];

var originalCreateElement = Document.prototype.createElement;
Document.prototype.createElement_origin = originalCreateElement;
Document.prototype.createElement = Document.prototype.createElement_origin;

Document.prototype.createElement = function (tagName) {
	//console.log(this, tagName);
	
	let p = this.createElement_origin(tagName);
	if (tagName === 'video' || tagName === 'audio') {
		//console.log('SpeedPitchChanger_despaEll_2 elt : ',p);
		SpeedPitchChanger_despaEll_2.push(p);
		
		//Document.prototype.createElement = Document.prototype.createElement_origin;
	}
	return p;

};
`;

window.eval(ace2);


/*
var script2 = document.createElement('script');
script2.textContent = ace2;
(document.head || document.documentElement).appendChild(script2);
script2.remove();
*/

  

/*
console.log("ace2")
// Création de la fonction qui remplacera la méthode createElement
var SpeedPitchChanger_despaEll_2 = [];

var originalCreateElement = Document.prototype.createElement;
Document.prototype.createElement_origin = originalCreateElement;
Document.prototype.createElement = Document.prototype.createElement_origin;

Document.prototype.createElement = function (tagName) {
	//console.log(this, tagName);
	
	var p = this.createElement_origin(tagName);
	if (tagName === 'video' || tagName === 'audio') {
		SpeedPitchChanger_despaEll_2.push(p);
		//Document.prototype.createElement = Document.prototype.createElement_origin;
	}
	return p;

};*/