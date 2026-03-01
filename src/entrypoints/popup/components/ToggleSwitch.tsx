import React from "react";

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    classAdditional?: string;
}

function ToggleSwitch({
    checked,
    onChange,
    id,
    classAdditional = "",
}: ToggleSwitchProps): React.JSX.Element {
    return (
        <label
            id={id}
            className={`relative inline-block w-12.5 h-6 py-1 ${classAdditional}`}
        >
            <input
                type="checkbox"
                className="peer opacity-0 w-0 h-0"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span
                className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-3xl transition-all duration-400 
                           before:absolute before:content-[''] before:h-4.5 before:w-4.5 before:left-0.75 before:bottom-0.75 
                           before:bg-white before:rounded-full before:transition-all before:duration-400
                           peer-checked:bg-[#5686F3] peer-focus:shadow-[0_0_1px_#5686F3] 
                           peer-checked:before:translate-x-6.5"
            ></span>
        </label>
    );
}

export default ToggleSwitch;
