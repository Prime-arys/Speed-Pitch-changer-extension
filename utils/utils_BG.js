//Utilities Background
import { keyCodeToCodeMap, keyboardMap } from "./char_kcode.js";

//Shared

export function onError(error) {
    console.error(`Error: ${error}`);
}


//POP


export function message(head, body = null, target = "background") {
    return new Promise(function (resolve) {
        browser.runtime.sendMessage({ title: head, data: body, target: target }).then(response => {
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

export function removeBlanksFromList(list) {
  return list.filter(function (el) {
    return el != "";
  });
}
  
export async function BWlist_manager(blacklist, action, domain, listHost = "Xytspch_blacklist") {
    //console.log("Blacklist manager");
    domain = "*://"+domain+"/*";

    switch (action) {
      case "add":
        //console.log("Adding domain to blacklist");
        blacklist.push(domain);
        localStorage.setItem(listHost, blacklist);
        break;

      case "del":
        //console.log("Removing domain from blacklist");
        let index = blacklist.indexOf(domain);
        if (index > -1) {
            blacklist.splice(index, 1);
            localStorage.setItem(listHost, blacklist);
          }
          else {
            console.log("Domain not found in blacklist");
          }
        break;

      case "get":
        //console.log("Getting blacklist");
        return blacklist;

      case "is_in":
        //console.log("Checking if domain is in blacklist");
        //console.log(blacklist.includes(domain));
        return blacklist.includes(domain);
        
      default:
        return false;
        
    }
}

