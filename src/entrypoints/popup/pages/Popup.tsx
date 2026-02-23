import React from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/utils/messaging";
import { ConfigData } from "@/models/ConfigData";
import { ConfigStorage } from "@/services/ConfigStorage";
import { rateToSemitone } from "@/utils/semitone";

// Components
import { ToggleSwitch, IconButton, ValueButton } from "../components";

// Import button icons
import minusIcon from "@/assets/buttons/minus.svg";
import resetIcon from "@/assets/buttons/reset.svg";
import plusIcon from "@/assets/buttons/plus.svg";
import promptIcon from "@/assets/buttons/prompt.svg";
import flatIcon from "@/assets/buttons/flat.svg";
import sharpIcon from "@/assets/buttons/sharp.svg";

async function updateConfig(newConfig: ConfigData): Promise<void> {
    const configStorage = new ConfigStorage();
    await configStorage.save(newConfig);
}

function isDomainProcessed(domain: string, config: ConfigData): boolean {
    if (domain === "" || config.blacklist.includes(domain)) {
        return false;
    }
    return true;
}

function isDomainProcessOptionalHooks(
    domain: string,
    config: ConfigData,
): boolean {
    if (domain === "" || config.specificList.includes(domain)) {
        return true;
    }
    return false;
}

function Popup(): React.JSX.Element {
    const queryClient = useQueryClient();

    // Config Data Query
    const configQuery = useQuery<ConfigData>({
        queryKey: ["configData"],
        queryFn: async () => {
            const response = await sendMessage("getConfig");
            return response;
        },
    });

    const activeDomain = useQuery<string>({
        queryKey: ["currentDomain"],
        queryFn: async () => {
            const response = await sendMessage("getCurrentDomain");
            return response;
        },
    });

    const updateConfigMutation = useMutation({
        mutationFn: async (newConfig: Partial<ConfigData>) => {
            // Update the config via your storage/messaging system

            const updatedConfig = { ...configQuery.data!, ...newConfig };
            await updateConfig(updatedConfig as ConfigData);
            return updatedConfig;
        },
        onSuccess: (updatedConfig) => {
            queryClient.setQueryData(["configData"], updatedConfig);
            browser.runtime.reload();
        },
    });

    const isEnabled = configQuery.data?.enabled ?? false;

    // Controllers Query
    const speed = useQuery<number | undefined>({
        queryKey: ["speed"],
        queryFn: async () => {
            if (
                !activeDomain.data ||
                !configQuery.data ||
                !isDomainProcessed(activeDomain.data, configQuery.data)
            )
                return undefined;
            const response = await sendMessage("retrieveCurrentPlaybackRate");
            return response;
        },
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!activeDomain.data && isEnabled,
    });

    const pitch = useQuery<number | undefined>({
        queryKey: ["pitch"],
        queryFn: async () => {
            if (
                !activeDomain.data ||
                !configQuery.data ||
                !isDomainProcessed(activeDomain.data, configQuery.data)
            )
                return undefined;
            const response = await sendMessage("retrieveCurrentPitch");
            return response;
        },
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!activeDomain.data && isEnabled,
    });

    return (
        <div className="text-center overflow-hidden w-full box-border">
            <h4 className="text-secondary font-title text-lg underline m-0 p-1.5 bg-primary">
                S/P Changer
            </h4>

            <div className="m-1 mt-4">
                <ToggleSwitch
                    id="enable-toggle"
                    checked={isEnabled}
                    onChange={(checked: boolean) => {
                        updateConfigMutation.mutate({ enabled: checked });
                    }}
                />
                <h6 className="flex justify-center m-1.5 mb-3.5 text-link no-underline text-lg font-bold font-title hover:text-link-hover">
                    <Link to="/settings">Settings</Link>
                </h6>
                <p className="whitespace-pre-line text-base -mt-1.5 mb-1.5"></p>
            </div>

            {/* Speed Controls */}
            <div className="flex m-auto justify-center align-baseline mt-3 px-3">
                <IconButton
                    id="speed-decrease"
                    src={minusIcon}
                    alt="Decrease Speed"
                    onClick={async () => {
                        await sendMessage("callSpeedDown");
                        queryClient.invalidateQueries({ queryKey: ["speed"] });
                    }}
                />
                <IconButton
                    id="speed-reset"
                    src={resetIcon}
                    alt="Reset Speed"
                    onClick={async () => {
                        await sendMessage("callResetSpeed");
                        queryClient.invalidateQueries({ queryKey: ["speed"] });
                    }}
                />
                <IconButton
                    id="speed-increase"
                    src={plusIcon}
                    alt="Increase Speed"
                    onClick={async () => {
                        await sendMessage("callSpeedUp");
                        queryClient.invalidateQueries({ queryKey: ["speed"] });
                    }}
                />
                <IconButton
                    id="speed-preset"
                    src={promptIcon}
                    alt="Speed Preset"
                    onClick={async () => {
                        await sendMessage("callPromptSpeed");
                        queryClient.invalidateQueries({ queryKey: ["speed"] });
                    }}
                />
            </div>

            <p className="mt-1">
                <span className="font-semibold">x {speed.data ?? "N/A"}</span>
            </p>
            <p className="text-lg">
                {"semitone : " + rateToSemitone(speed.data ?? 1).toFixed(2)}
            </p>

            {/* Pitch Controls */}
            <div className="flex m-auto items-center justify-center align-baseline mt-3 px-3">
                <IconButton
                    id="pitch-decrease"
                    src={flatIcon}
                    alt="Decrease Pitch"
                    onClick={async () => {
                        await sendMessage("callPitchDown");
                        queryClient.invalidateQueries({ queryKey: ["pitch"] });
                    }}
                />
                <ValueButton
                    id="pitch-value"
                    value={pitch.data?.toString() || "0"}
                    onClick={async () => {
                        await sendMessage("callResetPitch");
                        queryClient.invalidateQueries({ queryKey: ["pitch"] });
                    }}
                />
                <IconButton
                    id="pitch-increase"
                    src={sharpIcon}
                    alt="Increase Pitch"
                    onClick={async () => {
                        await sendMessage("callPitchUp");
                        queryClient.invalidateQueries({ queryKey: ["pitch"] });
                    }}
                />
            </div>

            {/* Domain Controls */}
            <div className="flex m-auto items-center justify-center align-baseline mt-3 gap-2 px-3">
                <p className="mr-2">{activeDomain.data || "(unreachable)"}</p>
                <input
                    type="checkbox"
                    id="domain-toggle"
                    checked={isDomainProcessed(
                        activeDomain.data || "",
                        configQuery.data!,
                    )}
                    disabled={!activeDomain.data}
                    style={{
                        display: activeDomain.data ? "inline-block" : "none",
                    }}
                    onChange={(e) => {
                        const domain = activeDomain.data || "";
                        if (!domain) return;
                        const config = configQuery.data!;
                        if (e.target.checked) {
                            // remove from blacklist
                            const newBlacklist = config.blacklist.filter(
                                (d) => d !== domain,
                            );
                            updateConfigMutation.mutate({
                                blacklist: newBlacklist,
                            });
                        } else {
                            // add to blacklist
                            const newBlacklist = [...config.blacklist, domain];
                            updateConfigMutation.mutate({
                                blacklist: newBlacklist,
                            });
                        }
                    }}
                />
            </div>

            {/* Enforce Mode */}
            <div className="flex m-auto items-center justify-center align-baseline gap-1 mt-1 px-3">
                <input
                    type="checkbox"
                    id="enforce-toggle"
                    checked={isDomainProcessOptionalHooks(
                        activeDomain.data || "",
                        configQuery.data!,
                    )}
                    disabled={!activeDomain.data}
                    style={{
                        display: activeDomain.data ? "inline-block" : "none",
                    }}
                    onChange={(e) => {
                        const domain = activeDomain.data || "";
                        if (!domain) return;
                        const config = configQuery.data!;
                        if (e.target.checked) {
                            // add to specificList
                            const newSpecificList = [
                                ...config.specificList,
                                domain,
                            ];
                            updateConfigMutation.mutate({
                                specificList: newSpecificList,
                            });
                        } else {
                            // remove from specificList
                            const newSpecificList = config.specificList.filter(
                                (d) => d !== domain,
                            );
                            updateConfigMutation.mutate({
                                specificList: newSpecificList,
                            });
                        }
                    }}
                />
                <p
                    className="ml-1"
                    style={{
                        display: activeDomain.data ? "inline-block" : "none",
                    }}
                >
                    {" "}
                    : enforce mode
                </p>
            </div>

            <p className="my-2 text-base">{`v${browser.runtime.getManifest().version}`}</p>
        </div>
    );
}

export default Popup;
