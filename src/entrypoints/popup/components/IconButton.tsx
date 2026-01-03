import React from "react";
import "./IconButton.css";

interface IconButtonProps {
    src: string;
    alt: string;
    onClick?: () => void;
    id?: string;
    className?: string;
}

function IconButton({ src, alt, onClick, id, className }: IconButtonProps): React.JSX.Element {
    return (
        <img
            id={id}
            className={`icon-button ${className || ""}`}
            src={src}
            alt={alt}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onClick?.();
                }
            }}
        />
    );
}

export default IconButton;
