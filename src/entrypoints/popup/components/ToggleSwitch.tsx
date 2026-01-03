import React from "react";
import "./ToggleSwitch.css";

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
}

function ToggleSwitch({ checked, onChange, id }: ToggleSwitchProps): React.JSX.Element {
    return (
        <label className="toggle-switch" id={id}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider"></span>
        </label>
    );
}

export default ToggleSwitch;
