import React from "react";

interface CollapsibleSectionProps {
    readonly title: string;
    readonly icons?: readonly string[];
    readonly highlight?: boolean;
    readonly children: React.ReactNode;
    readonly state: {
        open: boolean;
        setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    };
}

function CollapsibleSection({
    title,
    icons,
    highlight = false,
    children,
    state: { open, setOpen },
}: CollapsibleSectionProps): React.JSX.Element {
    return (
        <>
            <button
                type="button"
                className={`flex flex-row items-center gap-1.5 w-full m-0 px-2 py-1.5 text-base font-semibold text-black cursor-pointer select-none border-none
                    ${open ? "bg-[hsl(60,4%,88%)]" : "bg-transparent"}
                    ${highlight ? "bg-yellow-200/40" : ""}
                    hover:bg-neutral-300`}
                onClick={() => setOpen((v) => !v)}
            >
                {title}
                {icons?.map((icon) => (
                    <img
                        key={icon}
                        className="w-5 h-auto align-middle"
                        src={icon}
                        alt=""
                    />
                ))}
                <span
                    className={`ml-1.5 text-base font-body text-[hsl(220,23%,32%)] bg-[hsla(220,23%,24%,0.2)] rounded-2xl px-1${open ? " rotate-180" : ""}`}
                >
                    ▼
                </span>
            </button>
            <div
                className={`overflow-hidden transition-[max-height] duration-150 ${open ? "max-h-125 ease-in" : "max-h-0 ease-out"}`}
            >
                {children}
            </div>
        </>
    );
}

export default CollapsibleSection;
