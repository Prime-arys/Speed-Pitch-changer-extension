import React from "react";

interface ValueButtonProps {
    value: number | string;
    onClick?: () => void;
    id?: string;
}

function ValueButton({
    value,
    onClick,
    id,
}: ValueButtonProps): React.JSX.Element {
    return (
        <button
            id={id}
            className="inline-block bg-white text-center text-base font-body font-semibold no-underline mb-0.75 mx-6 px-[0.8rem] py-[0.2rem] border-primary border-3 rounded-3xl cursor-pointer shadow-xs hover:border-link-hover active:border-link-hover"
            onClick={onClick}
        >
            {value}
        </button>
    );
}

export default ValueButton;
