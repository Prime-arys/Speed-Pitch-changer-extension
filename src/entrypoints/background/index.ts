import { CommandsStorage } from "@/services/CommandsStorage";
import { ConfigStorage } from "@/services/ConfigStorage";
import { onMessage } from "@/utils/messaging";
import { scriptsRegister } from "@/services/ScriptsRegister";

export default defineBackground(async () => {
    console.log("Hello background!", { id: browser.runtime.id });
    browser.tabs.reload();

    const configStorage = new ConfigStorage();
    const commandsStorage = new CommandsStorage();

    const config = await configStorage.load();
    const commands = await commandsStorage.load();

    console.log("Config loaded:", config);
    console.log("Commands loaded:", commands);

    if (config.enabled) {
        await scriptsRegister.registerScript(
            "hooks-optional",
            "document_start",
            "MAIN",
            config,
            { specificDomainsOnly: true }
        );
        await scriptsRegister.registerScript(
            "main-world",
            "document_start",
            "MAIN",
            config
        );
        await scriptsRegister.registerScript(
            "main",
            "document_idle",
            "ISOLATED",
            config
        );
    } else if (!navigator.userAgent.toLowerCase().includes("android")) {
        // use specific icon for disabled state (not on android due to limitations)
        browser.browserAction.setIcon({ path: "icon/16d.png" });
    }

    async function getCurrentTab(): Promise<Browser.tabs.Tab | undefined> {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        return tabs[0];
    }

    // Message handlers

    /// Sending info From Background to Content Script or popup
    onMessage("getConfig", async () => {
        return config;
    });
    onMessage("getCommands", async () => {
        return commands;
    });
    onMessage("getCurrentDomain", async () => {
        const tab = await getCurrentTab();
        return tab?.url ? new URL(tab.url).hostname : "";
    });

    /// Calling action from popup or content script to Background to Content Script
    onMessage("callSpeedUp", async () => {
        console.log("callSpeedUp received");
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("speedUp", undefined, { tabId: tab.id });
        }
    });

    onMessage("callSpeedDown", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("speedDown", undefined, { tabId: tab.id });
        }
    });

    onMessage("callResetSpeed", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("resetSpeed", undefined, { tabId: tab.id });
        }
    });

    onMessage("callPromptSpeed", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("promptSpeed", undefined, { tabId: tab.id, frameId: 0 });
        }
    });

    onMessage("sendPlaybackRateUpdate", async (message) => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("promptSpeedPropagation", message.data, {
                tabId: tab.id,
            });
        }
    });

    onMessage("callPitchUp", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("pitchUp", undefined, { tabId: tab.id });
        }
    });

    onMessage("callPitchDown", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("pitchDown", undefined, { tabId: tab.id });
        }
    });

    onMessage("callResetPitch", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            sendMessage("resetPitch", undefined, { tabId: tab.id });
        }
    });

    /// Retrieving info From Content Script to Background to popup
    onMessage("retrieveCurrentPlaybackRate", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            return sendMessage("getPlaybackRate", undefined, { tabId: tab.id });
        }
        return undefined;
    });

    onMessage("retrieveCurrentPitch", async () => {
        const tab = await getCurrentTab();
        if (tab?.id) {
            return sendMessage("getPitch", undefined, { tabId: tab.id });
        }
        return undefined;
    });
});
