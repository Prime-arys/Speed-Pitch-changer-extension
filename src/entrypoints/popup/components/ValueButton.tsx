import React from "react";
import "./ValueButton.css";

interface ValueButtonProps {
    value: number | string;
    onClick?: () => void;
    id?: string;
}

function ValueButton({ value, onClick, id }: ValueButtonProps): React.JSX.Element {
    return (
        <button id={id} className="value-button" onClick={onClick}>
            {value}
        </button>
    );
}

export default ValueButton;
