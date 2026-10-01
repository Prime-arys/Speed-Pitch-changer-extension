import { readFile } from "node:fs/promises";
import { defineConfig } from "wxt";
import { minify } from "vite";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import babel from "@rolldown/plugin-babel";


// Worklet scripts, loaded by AudioWorklet.addModule() from the MAIN world.
// (on /public folder)
const WORKLETS = ["signalsmith-stretch-worklet.js", "soundtouch-processor.js"];

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

    hooks: {
        // Minification of worklet scripts on production build
        "build:publicAssets": async (wxt, files) => {
            if (wxt.config.mode !== "production") return;
            for (const [index, file] of files.entries()) {
                if (!("absoluteSrc" in file) || !WORKLETS.includes(file.relativeDest)) {
                    continue;
                }
                const source = await readFile(file.absoluteSrc, "utf8");
                const { code, errors } = await minify(file.relativeDest, source, {
                    module: true,
                });
                if (errors.length > 0) {
                    throw new Error(`Failed to minify ${file.relativeDest}`, {
                        cause: errors,
                    });
                }
                files[index] = { relativeDest: file.relativeDest, contents: code };
            }
        },
    },

    srcDir: "src",
    manifest: {
        // ...
        web_accessible_resources: [
            {
                resources: WORKLETS,
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
        host_permissions: ["<all_urls>"],
        browser_specific_settings: {
            gecko: {
                data_collection_permissions: {},
                id: "SpeedPitch_changer@despaa.id",
            },
        },
    },
});
