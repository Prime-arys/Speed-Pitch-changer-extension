import React from "react";
import TextButton from "./TextButton";

interface KeyBindingRowProps {
    readonly icon: string;
    readonly label: string;
    readonly currentKey: string;
    readonly isListening: boolean;
    readonly isPressed?: boolean;
    readonly onStartListening: () => void;
}

function KeyBindingRow({
    icon,
    label,
    currentKey,
    isListening,
    isPressed = false,
    onStartListening,
}: KeyBindingRowProps): React.JSX.Element {
    return (
        <div className="flex flex-row mx-2 my-1.5 pr-1 text-base font-body-secondary items-center">
            <img className="mr-1.5 w-7" src={icon} alt={label} />
            <div className="">
                <TextButton
                    text={isListening ? "<Press a key>" : currentKey}
                    stateEffect={isListening || isPressed}
                    onClick={onStartListening}
                />
            </div>
            <span className="ml-1">&nbsp;: {label}</span>
        </div>
    );
}

export default KeyBindingRow;
