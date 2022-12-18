var mdc2=true;
var ace2 =
    `
  var base = document.createElement; /* A backup reference to the browser's original document.createElement */
	var VideoElementsMade = []; /* Array of video/audio elements made by spotify's scripts */
	function debugLog(text) {
		console.log(text)
	}
	
	/* Replacing the DOM's original reference to the browser's createElement function */
	document.createElement = function(message) {
		/* base.apply is calling the backup reference of createElement with the arguments sent to our function and assigning it to our variable named element */
		var element = base.apply(this, arguments); 
		
		/* we check the first argument sent to us Examp. document.createElement('video') would have message = 'video' */
		/* ignores the many document.createElement('div'), document.createElement('nav'), ect... */
		if(message === 'video' || message === 'audio'){ /* Checking if spotify scripts are making a video or audio element */
			VideoElementsMade.push(element); /* Add a reference to the element in our array. Arrays hold references not copies by default in javascript. */
		}
		return element /* return the element and complete the loop so the page is allowed to be made */
	};
  `

window.eval(ace2);