import { ConfigData } from "@/models/ConfigData";

type ScriptsType = "main" | "hooks" | "hooks-optionnal";

const SCRIPTS: Record<ScriptsType, string[]> = {
    main: ["main"],
    hooks: ["hooks"],
    "hooks-optionnal": ["hooks-optionnal"],
};

class ScriptsRegister {
    async registerScript(
        scriptName: ScriptsType,
        runAt: "document_start" | "document_end" | "document_idle",
        world: "ISOLATED" | "MAIN" = "ISOLATED",
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
