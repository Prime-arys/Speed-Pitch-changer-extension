import React from "react";

interface IconButtonProps {
    src: string;
    alt: string;
    onClick?: () => void;
    id?: string;
    className?: string;
}

function IconButton({
    src,
    alt,
    onClick,
    id,
    className,
}: IconButtonProps): React.JSX.Element {
    return (
        <img
            id={id}
            className={`bg-transparent mx-1 mb-1.5 p-0.5 cursor-pointer border-none hover:opacity-80 ${className || ""}`}
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
