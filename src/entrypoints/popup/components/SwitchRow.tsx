import React from "react";
import ToggleSwitch from "./ToggleSwitch";

interface SwitchRowProps {
    readonly id: string;
    readonly label: string;
    readonly checked: boolean;
    readonly onChange: (checked: boolean) => void;
}

function SwitchRow({
    id,
    label,
    checked,
    onChange,
}: SwitchRowProps): React.JSX.Element {
    return (
        <div className="flex flex-row m-2 items-center gap-2 text-base font-body-secondary">
            <ToggleSwitch id={id} classAdditional="scale-94" checked={checked} onChange={onChange} />
            <span className="m-0 pb-1.5 font-body-secondary">: {label}</span>
        </div>
    );
}

export default SwitchRow;
