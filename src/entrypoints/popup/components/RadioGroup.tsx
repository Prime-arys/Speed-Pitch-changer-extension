import React from "react";

interface RadioOption {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly numberInput?: {
        readonly step: number;
        readonly min: number;
        readonly currentValue: number;
        readonly disabled: boolean;
        readonly onChange: (value: number) => void;
    };
}

interface RadioGroupProps {
    readonly name: string;
    readonly options: readonly RadioOption[];
    readonly selectedValue: number;
    readonly onSelect: (value: number) => void;
    readonly error?: string | null;
}

function RadioGroup({
    name,
    options,
    selectedValue,
    onSelect,
    error,
}: RadioGroupProps): React.JSX.Element {
    return (
        <div className="mx-2 my-1.5 text-left">
            {options.map((option) => (
                <div
                    key={option.id}
                    className="flex flex-row my-1 text-base font-body-secondary items-center gap-1.5"
                >
                    <input
                        type="radio"
                        name={name}
                        id={option.id}
                        className="cursor-pointer m-0"
                        checked={selectedValue === option.value}
                        onChange={() => onSelect(option.value)}
                    />
                    <label
                        htmlFor={option.id}
                        className="flex items-center gap-1 cursor-pointer"
                    >
                        {option.label}
                        {option.numberInput && (
                            <input
                                type="number"
                                step={option.numberInput.step}
                                min={option.numberInput.min}
                                value={option.numberInput.currentValue}
                                disabled={option.numberInput.disabled}
                                className="w-15 text-sm px-1 py-0.5 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                onChange={(e) =>
                                    option.numberInput?.onChange(
                                        Number.parseFloat(e.target.value),
                                    )
                                }
                            />
                        )}
                    </label>
                </div>
            ))}
            {error && (
                <p className="text-red-700 text-sm mx-0 my-0.5 text-left">
                    {error}
                </p>
            )}
        </div>
    );
}

export default RadioGroup;
