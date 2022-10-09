//Utilities contents

function handleError(error) {
    console.log(`Error: ${error}`);
  
}
  
function notifyBackgroundPage(e,xfg) {
    var sending = browser.runtime.sendMessage({
      title: e,
      data: xfg
    });
    sending.then(handleResponse, handleError);
}
  