import React from "react";

interface TextButtonProps {
    readonly text: string;
    readonly stateEffect?: boolean;
    readonly classTextSize?: string;
    readonly onClick: () => void;
}

function TextButton({
    text,
    stateEffect = false,
    classTextSize = "text-base",
    onClick,
}: TextButtonProps): React.JSX.Element {
    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md mx-0.5 px-2 py-0.5 border-none cursor-pointer min-w-10
                    ${stateEffect ? "bg-button-accent" : "bg-button hover:bg-button-accent/60"}
                    ${classTextSize}`}
            onClick={onClick}
        >
            <span className="relative inline-flex items-center justify-center">
                <span className="invisible font-semibold" aria-hidden="true">{text}</span>
                <span className={`absolute ${stateEffect ? "font-semibold" : ""}`}>{text}</span>
            </span>
        </button>
    );
}

export default TextButton;
