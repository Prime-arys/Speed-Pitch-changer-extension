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
  

//Background

export async function register(hosts,myfile,run,blacklist) {
    //console.log(blacklist);
    return await browser.contentScripts.register({
      "matches": hosts,
      "excludeMatches": blacklist,
      "js": [{file: myfile}], // "./file.js"
      "allFrames": true,
      "runAt": run, // "document_idle" | "document_start"
      "matchAboutBlank": true
    });
  
}
  
export async function BWlist_manager(blacklist, action, domain, listHost = "Xytspch_blacklist") {
    //console.log("Blacklist manager");
    domain = "*://"+domain+"/*";
    if (action == "add") {
        //console.log("Adding domain to blacklist");
        blacklist.push(domain);
        localStorage.setItem(listHost, blacklist);
    }
    else if (action == "del") {
        //console.log("Removing domain from blacklist");
      var index = blacklist.indexOf(domain);
      if (index > -1) {
          blacklist.splice(index, 1);
          localStorage.setItem(listHost, blacklist);
        }
        else {
          console.log("Domain not found in blacklist");
        }
    }
    else if (action == "get") {
        //console.log("Getting blacklist");
      return blacklist;
    }
    else if (action == "is_in") {
        //console.log("Checking if domain is in blacklist");
        //console.log(blacklist.includes(domain));
      return blacklist.includes(domain);
    }
    else {
      return false;
    }
  }
