//Utilities Background

//Shared

export function onError(error) {
    console.error(`Error: ${error}`);
}


//POP


export function message(head, body = null) {
    return new Promise(function (resolve) {
        browser.runtime.sendMessage({ type: head, val: body }).then(response => {
            if (response !== undefined) {
                resolve(response);
            }
      }).catch(onError);
    });
  }