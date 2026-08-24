import { defineConfig } from "wxt";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import babel from "@rolldown/plugin-babel";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-react"],
    //modules: ["@wxt-dev/module-react", "@wxt-dev/webextension-polyfill"],

    vite: () => ({
        plugins: [
            tailwindcss(),
            babel({
                presets: [reactCompilerPreset()],
            }),
        ],
    }),

    srcDir: "src",
    manifest: {
        // ...
        web_accessible_resources: [
            {
                resources: [
                    // Worklet scripts, loaded by AudioWorklet.addModule() from
                    // the MAIN world.
                    "signalsmith-stretch-worklet.js",
                    "soundtouch-processor.js",
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
        browser_specific_settings: {
            gecko: {
                data_collection_permissions: {},
                id: "SpeedPitch_changer@despaa.id",
            },
        },
    },
});
