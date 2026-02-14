import { defineConfig } from "wxt";
// import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-react"],
    //modules: ["@wxt-dev/module-react", "@wxt-dev/webextension-polyfill"],
    react: {
        vite: {
            babel: {
                plugins: ["babel-plugin-react-compiler"],
            },
        },
    },

    vite: () => ({
        plugins: [tailwindcss()],
    }),

    srcDir: "src",
    manifest: {
        // ...
        web_accessible_resources: [
            {
                resources: [
                    "main-world-injected.js",
                    "signalsmith-stretch-worklet.js",
                ],
                matches: ["<all_urls>"],
            },
        ],
        permissions: [
            "tabs",
            "storage",
            "scripting", // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting
            "webRequest",
            "activeTab",
            "<all_urls>",
        ],
    },
});
