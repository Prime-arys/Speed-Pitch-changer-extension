import React from "react";
import { Link } from "react-router";

function Info() {
    return (
        <div className="text-center overflow-hidden w-full min-w-max box-border">
            <h4 className="text-secondary font-title text-lg underline m-0 p-1.5 bg-primary">
                Info
            </h4>
            <div className="p-2 min-w-max">
                <ul className="list-none text-left">
                    <li>
                        <p className="font-semibold">© Prime-arys</p>
                    </li>
                    <li>
                        <p>
                            Source code :{" "}
                            <a
                                className="mx-1 text-base font-[Liberation,sans-serif] no-underline text-link hover:text-link-hover"
                                href="https://github.com/Prime-arys/Speed-Pitch-changer-extension"
                            >
                                GitHub
                            </a>
                        </p>
                    </li>
                    <li>
                        <p>
                            Bug report :{" "}
                            <a
                                className="mx-1 text-base font-[Liberation,sans-serif] no-underline text-link hover:text-link-hover"
                                href="https://github.com/Prime-arys/Speed-Pitch-changer-extension/issues"
                            >
                                Issue{" "}
                            </a>
                        </p>
                    </li>
                    <li>
                        <p>
                            Donate :{" "}
                            <a
                                className="mx-1 text-base font-[Liberation,sans-serif] no-underline text-link hover:text-link-hover"
                                href="https://github.com/Prime-arys/Speed-Pitch-changer-extension#Donate"
                            >
                                Link
                            </a>
                        </p>
                    </li>
                </ul>
            </div>
            <div className="flex justify-between px-2 pb-2">
                <Link
                    to="/settings"
                    className="mx-1 text-base font-[Liberation,sans-serif] no-underline text-link hover:text-link-hover"
                >
                    return
                </Link>
            </div>
        </div>
    );
}

export default Info;
