(function () {
	'use strict';

	function NestedProxy(target) {
		return new Proxy(target, {
			get(target, prop) {
				if (typeof target[prop] !== 'function') {
					return new NestedProxy(target[prop]);
				}
				return (...arguments_) =>
					new Promise((resolve, reject) => {
						target[prop](...arguments_, result => {
							if (chrome.runtime.lastError) {
								reject(new Error(chrome.runtime.lastError.message));
							} else {
								resolve(result);
							}
						});
					});
			}
		});
	}
	const chromeP = globalThis.chrome && new NestedProxy(globalThis.chrome);

	const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;
	const isFirefox = typeof navigator === 'object' && navigator.userAgent.includes('Firefox/');
	const allStarsRegex = isFirefox ? /^(https?|wss?):[/][/][^/]+([/].*)?$/ : /^https?:[/][/][^/]+([/].*)?$/;
	const allUrlsRegex = /^(https?|file|ftp):[/]+/;
	function getRawRegex(matchPattern) {
	    if (!patternValidationRegex.test(matchPattern)) {
	        throw new Error(matchPattern + ' is an invalid pattern, it must match ' + String(patternValidationRegex));
	    }
	    let [, protocol, host, pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);
	    protocol = protocol
	        .replace('*', isFirefox ? '(https?|wss?)' : 'https?')
	        .replace(/[/]/g, '[/]');
	    host = (host !== null && host !== void 0 ? host : '')
	        .replace(/^[*][.]/, '([^/]+.)*')
	        .replace(/^[*]$/, '[^/]+')
	        .replace(/[.]/g, '[.]')
	        .replace(/[*]$/g, '[^.]+');
	    pathname = pathname
	        .replace(/[/]/g, '[/]')
	        .replace(/[.]/g, '[.]')
	        .replace(/[*]/g, '.*');
	    return '^' + protocol + host + '(' + pathname + ')?$';
	}
	function patternToRegex(...matchPatterns) {
	    if (matchPatterns.length === 0) {
	        return /$./;
	    }
	    if (matchPatterns.includes('<all_urls>')) {
	        return allUrlsRegex;
	    }
	    if (matchPatterns.includes('*://*/*')) {
	        return allStarsRegex;
	    }
	    return new RegExp(matchPatterns.map(x => getRawRegex(x)).join('|'));
	}

	const gotNavigation = typeof chrome === 'object' && 'webNavigation' in chrome;
	async function isOriginPermitted(url) {
	    return chromeP.permissions.contains({
	        origins: [new URL(url).origin + '/*'],
	    });
	}
	async function wasPreviouslyLoaded(tabId, frameId, args) {
	    const loadCheck = (key) => {
	        const wasLoaded = document[key];
	        document[key] = true;
	        return wasLoaded;
	    };
	    const result = await chromeP.tabs.executeScript(tabId, {
	        frameId,
	        code: `(${loadCheck.toString()})(${JSON.stringify(args)})`,
	    });
	    return result === null || result === void 0 ? void 0 : result[0];
	}
	async function registerContentScript(contentScriptOptions, callback) {
	    const { js = [], css = [], matchAboutBlank, matches, runAt, } = contentScriptOptions;
	    let { allFrames } = contentScriptOptions;
	    if (gotNavigation) {
	        allFrames = false;
	    }
	    else if (allFrames) {
	        console.warn('`allFrames: true` requires the `webNavigation` permission to work correctly: https://github.com/fregante/content-scripts-register-polyfill#permissions');
	    }
	    const matchesRegex = patternToRegex(...matches);
	    const inject = async (url, tabId, frameId) => {
	        if (!matchesRegex.test(url)
	            || !await isOriginPermitted(url)
	            || await wasPreviouslyLoaded(tabId, frameId, { js, css })
	        ) {
	            return;
	        }
	        for (const file of css) {
	            void chrome.tabs.insertCSS(tabId, {
	                ...file,
	                matchAboutBlank,
	                allFrames,
	                frameId,
	                runAt: runAt !== null && runAt !== void 0 ? runAt : 'document_start',
	            });
	        }
	        let lastInjection;
	        for (const file of js) {
	            if ('code' in file) {
	                await lastInjection;
	            }
	            lastInjection = chromeP.tabs.executeScript(tabId, {
	                ...file,
	                matchAboutBlank,
	                allFrames,
	                frameId,
	                runAt,
	            });
	        }
	    };
	    const tabListener = async (tabId, { status }, { url }) => {
	        if (status && url) {
	            void inject(url, tabId);
	        }
	    };
	    const navListener = async ({ tabId, frameId, url }) => {
	        void inject(url, tabId, frameId);
	    };
	    if (gotNavigation) {
	        chrome.webNavigation.onCommitted.addListener(navListener);
	    }
	    else {
	        chrome.tabs.onUpdated.addListener(tabListener);
	    }
	    const registeredContentScript = {
	        async unregister() {
	            if (gotNavigation) {
	                chrome.webNavigation.onCommitted.removeListener(navListener);
	            }
	            else {
	                chrome.tabs.onUpdated.removeListener(tabListener);
	            }
	        },
	    };
	    if (typeof callback === 'function') {
	        callback(registeredContentScript);
	    }
	    return registeredContentScript;
	}

	if (typeof chrome === 'object' && !chrome.contentScripts) {
	    chrome.contentScripts = { register: registerContentScript };
	}

}());