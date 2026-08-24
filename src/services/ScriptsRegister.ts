import type { ConfigData } from "@/models/ConfigData";

type ScriptsType = "main" | "main-world" | "hooks-optional";

const SCRIPTS: Record<ScriptsType, string[]> = {
    main: ["main"], // isolated world: settings, shortcuts, background messaging
    "main-world": ["main-world"], // page world: media detection and effects
    "hooks-optional": ["hooks-optional"], // page world: opt-in playbackRate guard
};

class ScriptsRegister {
    async registerScript(
        scriptName: ScriptsType,
        runAt: "document_start" | "document_end" | "document_idle",
        world: "ISOLATED" | "MAIN" = "ISOLATED", // 2 worlds: ISOLATED (default) and MAIN (for content scripts that need to run in the page context)
        config: ConfigData,
        options?: { specificDomainsOnly?: boolean }
    ): Promise<void> {
        if (options?.specificDomainsOnly && config.specificList!.length === 0) {
            return; // Cancel registration if no specific domains are set
        }
        await browser.scripting.registerContentScripts([
            {
                id: `${scriptName}-script`,
                js: SCRIPTS[scriptName].map((file) => `/${file}.js`),
                matches: options?.specificDomainsOnly
                    ? config.specificList!.map((domain) => `*://${domain}/*`)
                    : ["<all_urls>"],
                excludeMatches:
                    config.blacklist!.map((domain) => `*://${domain}/*`) || [],
                runAt: runAt,
                allFrames: true,
                world: world,
            },
        ]);
    }
}

export const scriptsRegister = new ScriptsRegister();
