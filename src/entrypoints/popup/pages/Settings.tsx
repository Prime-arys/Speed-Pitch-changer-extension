import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/utils/messaging";
import { CommandsData, Switch, CustomSpeedPitch, Radio } from "@/models/CommandsData";
import { CommandsStorage } from "@/services/CommandsStorage";
import { TextButton } from "../components";

// Sub-components
import CollapsibleSection from "../components/CollapsibleSection";
import KeyBindingRow from "../components/KeyBindingRow";
import SwitchRow from "../components/SwitchRow";
import RadioGroup from "../components/RadioGroup";

// Icons
import resetIcon from "@/assets/buttons/reset.svg";
import plusIcon from "@/assets/buttons/plus.svg";
import minusIcon from "@/assets/buttons/minus.svg";
import promptIcon from "@/assets/buttons/prompt.svg";
import flatIcon from "@/assets/buttons/flat.svg";
import sharpIcon from "@/assets/buttons/sharp.svg";

type CommandKey = keyof CommandsData["commands"];
type CollapsibleSectionStates = {
    keyboardShortcuts: boolean;
    speedBehavior: boolean;
    pitchBehavior: boolean;
};

async function saveCommands(commandsData: CommandsData): Promise<void> {
    const storage = new CommandsStorage();
    await storage.save(commandsData);
}

function collapsibleSectionStatesSetter(
    states: CollapsibleSectionStates,
    key: keyof CollapsibleSectionStates,
): CollapsibleSectionStates {
    // Enable only one section at a time
    const newStates: CollapsibleSectionStates = {
        keyboardShortcuts: false,
        speedBehavior: false,
        pitchBehavior: false,
    };
    newStates[key] = !states[key];
    return newStates;
}

const keyBindings: {
    key: CommandKey;
    label: string;
    icon: string;
}[] = [
    { key: "reset", label: "reset", icon: resetIcon },
    { key: "speedUp", label: "increase speed", icon: plusIcon },
    { key: "speedDown", label: "decrease speed", icon: minusIcon },
    { key: "speedSet", label: "set a value", icon: promptIcon },
];

function Settings(): React.JSX.Element {
    const queryClient = useQueryClient();

    // Load commands data
    const commandsQuery = useQuery<CommandsData>({
        queryKey: ["commandsData"],
        queryFn: async () => {
            const response = await sendMessage("getCommands");
            return response;
        },
    });

    // Local draft state - initialize from query data
    const [draft, setDraft] = useState<CommandsData | null>(null);
    const queryData = commandsQuery.data;

    if (queryData && !draft) {
        setDraft(structuredClone(queryData));
    }

    // Key listening state (shortcuts key assignment)
    const [listeningKey, setListeningKey] = useState<CommandKey | null>(null);
    const [keyHighlight, setKeyHighlight] = useState(false); // Highlight the section when listening for a key

    // Track currently held key codes for accent highlight
    const [pressedKeys, setPressedKeys] = useState<Set<KeyboardEvent["code"]>>(
        new Set(),
    );

    // Listen for keydown and keyup to track pressed keys for highlight
    useEffect(() => {
        if (!draft || listeningKey) return; // Don't apply highlights when waiting for a shortcut key change
        const onKeyDown = (e: KeyboardEvent) =>
            setPressedKeys((prev) =>
                prev.has(e.code) ? prev : new Set(prev).add(e.code),
            );
        const onKeyUp = (e: KeyboardEvent) =>
            setPressedKeys((prev) => {
                if (!prev.has(e.code)) return prev;
                const next = new Set(prev);
                next.delete(e.code);
                return next;
            });
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, [draft, listeningKey]);

    // Handle key assignment when listening for a shortcut key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!listeningKey || !draft) return;
            e.preventDefault();
            const newDraft = structuredClone(draft);
            newDraft.commands[listeningKey] = e.code;
            setDraft(newDraft);
            setListeningKey(null);
            setKeyHighlight(false);
        },
        [listeningKey, draft],
    );

    useEffect(() => {
        if (listeningKey) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [listeningKey, handleKeyDown]);

    // Save Settings Mutation (CommandsData)
    const saveMutation = useMutation({
        mutationFn: async (data: CommandsData) => {
            await saveCommands(data);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["commandsData"], data);
            browser.runtime.reload();
        },
    });

    // Validation
    const [speedError, setSpeedError] = useState<string | null>(null);
    const [pitchError, setPitchError] = useState<string | null>(null);

    // Collapsible sections state
    const [sectionsOpen, setSectionsOpen] = useState<CollapsibleSectionStates>({
        keyboardShortcuts: true, // open by default
        speedBehavior: false,
        pitchBehavior: false,
    });

    if (!draft) {
        return (
            <div className="text-center bg-secondary w-full box-border">
                <h4 className="text-secondary font-title text-lg m-0 underline py-1.5 bg-primary">
                    Settings
                </h4>
                <p>Loading...</p>
            </div>
        );
    }

    // Draft update helpers
    const updateSwitch = (key: keyof Switch, value: boolean) => {
        const newDraft = structuredClone(draft);
        newDraft.switch[key] = value;
        setDraft(newDraft);
    };

    const updateSpeedPreset = (
        preset: Radio["speed"]["preset"],
    ) => {
        const newDraft = structuredClone(draft);
        newDraft.radio.speed.preset = preset;
        setDraft(newDraft);
        setSpeedError(null);
    };

    const updateSpeedCustom = (
        field: keyof CustomSpeedPitch,
        value: number,
    ) => {
        const newDraft = structuredClone(draft);
        if (field === "multiply_divide") {
            if (value <= 1) {
                setSpeedError("The value must be greater than 1.0");
                newDraft.radio.speed.custom.multiply_divide = 1.001;
            } else {
                setSpeedError(null);
                newDraft.radio.speed.custom.multiply_divide = value;
            }
        } else if (value <= 0) {
            setSpeedError("The value must be greater than 0");
            newDraft.radio.speed.custom.plus_minus = 0.001;
        } else {
            setSpeedError(null);
            newDraft.radio.speed.custom.plus_minus = value;
        }
        setDraft(newDraft);
    };

    const updatePitchPreset = (
        preset: Radio["pitch"]["preset"],
    ) => {
        const newDraft = structuredClone(draft);
        newDraft.radio.pitch.preset = preset;
        setDraft(newDraft);
        setPitchError(null);
    };

    const updatePitchCustom = (value: number) => {
        const newDraft = structuredClone(draft);
        if (value <= 0) {
            setPitchError("The value must be greater than 0");
            newDraft.radio.pitch.custom.plus_minus = 0.001;
        } else {
            setPitchError(null);
            newDraft.radio.pitch.custom.plus_minus = value;
        }
        setDraft(newDraft);
    };

    return (
        <div className="text-center bg-secondary w-full box-border">
            <h4 className="text-secondary font-title text-lg m-0 underline py-1.5 bg-primary">
                Settings
            </h4>

            {/* Keyboard Shortcuts */}
            <CollapsibleSection
                title="Keyboard shortcuts"
                highlight={keyHighlight}
                state={{
                    open: sectionsOpen.keyboardShortcuts,
                    setOpen: () =>
                        setSectionsOpen((states) =>
                            collapsibleSectionStatesSetter(
                                states,
                                "keyboardShortcuts",
                            ),
                        ),
                }}
            >
                {keyBindings.map(({ key, label, icon }) => (
                    <KeyBindingRow
                        key={key}
                        icon={icon}
                        label={label}
                        currentKey={draft.commands[key]}
                        isListening={listeningKey === key}
                        isPressed={pressedKeys.has(draft.commands[key])}
                        onStartListening={() => {
                            setListeningKey(key);
                            setKeyHighlight(true);
                        }}
                    />
                ))}
                <SwitchRow
                    id="shortcut-toggle"
                    label="keyboard shortcut"
                    checked={draft.switch.shortcuts}
                    onChange={(checked) => updateSwitch("shortcuts", checked)}
                />
            </CollapsibleSection>

            <hr className="m-0 p-0 border-0 h-px bg-linear-to-r from-gray-400 via-gray-600 to-gray-400" />

            {/* Speed Behavior */}
            <CollapsibleSection
                title="Behavior"
                icons={[plusIcon, minusIcon]}
                state={{
                    open: sectionsOpen.speedBehavior,
                    setOpen: () =>
                        setSectionsOpen((states) =>
                            collapsibleSectionStatesSetter(
                                states,
                                "speedBehavior",
                            ),
                        ),
                }}
            >
                <SwitchRow
                    id="preserve-pitch-toggle"
                    label="preserved pitch"
                    checked={draft.switch.preserve_pitch}
                    onChange={(checked) =>
                        updateSwitch("preserve_pitch", checked)
                    }
                />
                <RadioGroup
                    name="speed-method"
                    selectedValue={draft.radio.speed.preset}
                    onSelect={(value) => updateSpeedPreset(value as Radio["speed"]["preset"])}
                    error={speedError}
                    options={[
                        {
                            id: "speed-default",
                            label: "default",
                            value: 1,
                        },
                        {
                            id: "speed-multiply",
                            label: "x ÷",
                            value: 2,
                            numberInput: {
                                step: 0.01,
                                min: 1.0,
                                currentValue:
                                    draft.radio.speed.custom.multiply_divide,
                                disabled: draft.radio.speed.preset !== 2,
                                onChange: (v) =>
                                    updateSpeedCustom("multiply_divide", v),
                            },
                        },
                        {
                            id: "speed-plusminus",
                            label: "+ -",
                            value: 3,
                            numberInput: {
                                step: 0.01,
                                min: 0,
                                currentValue:
                                    draft.radio.speed.custom.plus_minus,
                                disabled: draft.radio.speed.preset !== 3,
                                onChange: (v) =>
                                    updateSpeedCustom("plus_minus", v),
                            },
                        },
                    ]}
                />
            </CollapsibleSection>

            <hr className="m-0 p-0 border-0 h-px bg-linear-to-r from-gray-400 via-gray-600 to-gray-400" />

            {/* Pitch Behavior */}
            <CollapsibleSection
                title="Behavior"
                icons={[flatIcon, sharpIcon]}
                state={{
                    open: sectionsOpen.pitchBehavior,
                    setOpen: () =>
                        setSectionsOpen((states) =>
                            collapsibleSectionStatesSetter(
                                states,
                                "pitchBehavior",
                            ),
                        ),
                }}
            >
                <RadioGroup
                    name="pitch-method"
                    selectedValue={draft.radio.pitch.preset}
                    onSelect={(value) => updatePitchPreset(value as Radio["pitch"]["preset"])}
                    error={pitchError}
                    options={[
                        {
                            id: "pitch-default",
                            label: "default",
                            value: 1,
                        },
                        {
                            id: "pitch-plusminus",
                            label: "+ -",
                            value: 2,
                            numberInput: {
                                step: 0.01,
                                min: 0,
                                currentValue:
                                    draft.radio.pitch.custom.plus_minus,
                                disabled: draft.radio.pitch.preset !== 2,
                                onChange: updatePitchCustom,
                            },
                        },
                    ]}
                />
            </CollapsibleSection>

            <hr className="m-0 p-0 border-0 h-px bg-linear-to-r from-gray-400 via-gray-600 to-gray-400" />

            {/* Other */}
            <div className="my-2">
                <h4 className="mx-2 my-1.5 text-base font-semibold text-left">
                    Other :
                </h4>
                <SwitchRow
                    id="ignore-text-toggle"
                    label="ignore text field"
                    checked={draft.switch.ignore_text_field}
                    onChange={(checked) =>
                        updateSwitch("ignore_text_field", checked)
                    }
                />
            </div>

            {/* Save */}
            <div className="text-center my-3 font-semibold font-body-secondary">
                <TextButton
                    text="Save"
                    classTextSize="text-lg"
                    onClick={() => saveMutation.mutate(draft)}
                />
            </div>

            {/* Navigation */}
            <div className="flex justify-between px-2 pb-2">
                <Link
                    to="/"
                    className="mx-1 text-base font-[Liberation,sans-serif] no-underline text-link hover:text-link-hover"
                >
                    return
                </Link>
            </div>
        </div>
    );
}

export default Settings;
