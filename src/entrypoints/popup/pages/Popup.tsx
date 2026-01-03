import React, { useState } from "react";
import { Link } from "react-router";
import "./Popup.css";
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
    const configStorage = ConfigStorage.initStorageObject(newConfig);
    await configStorage.save();
    return;
}

function isDomainProcessed(domain: string, config: ConfigData): boolean {
    if (domain === "" || config.blacklist.includes(domain)) {
        return false;
    }
    return true;
}

function isDomainProcessOptionalHooks(
    domain: string,
    config: ConfigData
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
            if (!activeDomain.data) return undefined
            const response = await sendMessage("retrieveCurrentPlaybackRate");
            return response;
        },
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!activeDomain.data && isEnabled,
    });

    const [pitch, setPitch] = useState(0); // TODO

    return (
        <div className="popup-container">
            <h4 className="popup-title">S/P Changer</h4>

            <div className="control-section">
                <ToggleSwitch
                    id="enable-toggle"
                    checked={isEnabled}
                    onChange={(checked: boolean) => {
                        updateConfigMutation.mutate({ enabled: checked });
                    }}
                />
                <h6 className="settings-link">
                    <Link to="/settings">Settings</Link>
                </h6>
                <p className="settings-info"></p>
            </div>

            {/* Speed Controls */}
            <div className="button-row speed-controls bonus-space">
                <IconButton
                    id="speed-decrease"
                    src={minusIcon}
                    alt="Decrease Speed"
                    onClick={
                        async () => {
                            await sendMessage("callSpeedDown");
                            queryClient.invalidateQueries({ queryKey: ["speed"] });
                        }
                    }
                />
                <IconButton
                    id="speed-reset"
                    src={resetIcon}
                    alt="Reset Speed"
                    onClick={
                        async () => {
                            await sendMessage("callResetSpeed");
                            queryClient.invalidateQueries({ queryKey: ["speed"] });
                        }
                    }
                />
                <IconButton
                    id="speed-increase"
                    src={plusIcon}
                    alt="Increase Speed"
                    onClick={
                        async () => {
                            await sendMessage("callSpeedUp");
                            queryClient.invalidateQueries({ queryKey: ["speed"] });
                        }
                    }
                />
                <IconButton
                    id="speed-preset"
                    src={promptIcon}
                    alt="Speed Preset"
                    onClick={
                        async () => {
                            await sendMessage("callPromptSpeed");
                            queryClient.invalidateQueries({ queryKey: ["speed"] });
                        }
                    }
                />
            </div>

            <p className="speed-display">
                x <span className="speed-value">{speed.data ?? "N/A"}</span>
            </p>
            <p className="speed-description">
                {
                    "semitone : " + rateToSemitone(speed.data ?? 1).toFixed(2)
                }
            </p>

            {/* Pitch Controls */}
            <div className="button-row pitch-controls bonus-space">
                <IconButton
                    id="pitch-decrease"
                    src={flatIcon}
                    alt="Decrease Pitch"
                />
                <ValueButton id="pitch-value" value={pitch} />
                <IconButton
                    id="pitch-increase"
                    src={sharpIcon}
                    alt="Increase Pitch"
                />
            </div>

            {/* Domain Controls */}
            <div className="button-row domain-controls bonus-space">
                <p className="active-domain">
                    {activeDomain.data || "(unreachable)"}
                </p>
                <input
                    type="checkbox"
                    id="domain-toggle"
                    checked={isDomainProcessed(
                        activeDomain.data || "",
                        configQuery.data!
                    )}
                    disabled={!activeDomain.data}
                    style={{
                        visibility: activeDomain.data ? "visible" : "collapse",
                    }}
                    onChange={(e) => {
                        const domain = activeDomain.data || "";
                        if (!domain) return;
                        const config = configQuery.data!;
                        if (e.target.checked) {
                            // remove from blacklist
                            const newBlacklist = config.blacklist.filter(
                                (d) => d !== domain
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
            <div className="button-row enforce-controls">
                <input
                    type="checkbox"
                    id="enforce-toggle"
                    checked={isDomainProcessOptionalHooks(
                        activeDomain.data || "",
                        configQuery.data!
                    )}
                    disabled={!activeDomain.data}
                    style={{
                        visibility: activeDomain.data ? "visible" : "collapse",
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
                                (d) => d !== domain
                            );
                            updateConfigMutation.mutate({
                                specificList: newSpecificList,
                            });
                        }
                    }}
                />
                <p className="enforce-label"> : enforce mode</p>
            </div>

            <p className="version-info">{`v${browser.runtime.getManifest().version}`}</p>
        </div>
    );
}

export default Popup;
