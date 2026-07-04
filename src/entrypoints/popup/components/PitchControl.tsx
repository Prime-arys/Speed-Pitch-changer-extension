import React, { useEffect, useRef, useState } from "react";
import IconButton from "./IconButton";
import ValueButton from "./ValueButton";

import flatIcon from "@/assets/buttons/flat.svg";
import sharpIcon from "@/assets/buttons/sharp.svg";

/** Delay before a typed value is applied, so edits don't flood the pipeline. */
const DEBOUNCE_MS = 300;

/** Clamp to the configured range and kill floating-point dust (2 decimals). */
function normalize(semitones: number, range: number): number {
    const clamped = Math.min(range, Math.max(-range, semitones));
    return Math.round(clamped * 100) / 100;
}

/** "+3.5", "-0.25", "0" — always signed when shifting. */
function format(semitones: number): string {
    const text = semitones.toFixed(2).replace(/\.?0+$/, "");
    return semitones > 0 ? `+${text}` : text;
}

interface PitchControlProps {
    /** Current pitch in semitones; undefined when the page is unreachable. */
    value: number | undefined;
    /** Step applied by the flat/sharp buttons (from settings). */
    step: number;
    /** Semitone limit (±range) from settings. */
    range: number;
    /** Show the exact-value input field (settings, off by default). */
    showInput: boolean;
    onSet: (semitones: number) => void;
}

/**
 * Pitch section of the popup: flat/sharp step buttons around a click-to-reset
 * readout, and an optional numeric input (0.1 st resolution) that applies
 * while typing, debounced by {@link DEBOUNCE_MS}.
 */
function PitchControl({
    value,
    step,
    range,
    showInput,
    onSet,
}: PitchControlProps): React.JSX.Element {
    // Text being typed in the numeric input; kept until Enter/blur so edits
    // aren't overwritten mid-typing, while commits apply in the background.
    const [draftText, setDraftText] = useState<string | null>(null);
    const debounceRef = useRef<number | null>(null);

    const disabled = value === undefined;
    const current = value ?? 0;

    useEffect(
        () => () => {
            if (debounceRef.current !== null) {
                clearTimeout(debounceRef.current);
            }
        },
        [],
    );

    const cancelPending = () => {
        if (debounceRef.current !== null) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
    };

    const apply = (semitones: number) => {
        if (disabled || Number.isNaN(semitones)) return;
        onSet(normalize(semitones, range));
    };

    /** Immediate set from the buttons; drops any pending typed value. */
    const commit = (semitones: number) => {
        cancelPending();
        setDraftText(null);
        apply(semitones);
    };

    /** Typed/spinner edit: keep as draft, apply after a quiet period. */
    const scheduleCommit = (text: string) => {
        setDraftText(text);
        cancelPending();
        debounceRef.current = window.setTimeout(() => {
            debounceRef.current = null;
            apply(parseFloat(text.replace(",", ".")));
        }, DEBOUNCE_MS);
    };

    /** Enter/blur: apply any pending edit now and leave draft mode. */
    const flush = () => {
        const pending = debounceRef.current !== null;
        cancelPending();
        if (pending && draftText !== null) {
            apply(parseFloat(draftText.replace(",", ".")));
        }
        setDraftText(null);
    };

    return (
        <div className="mt-3 px-3">
            {/* Step down / readout (click = reset) / step up */}
            <div className="flex m-auto items-center justify-center align-baseline">
                <IconButton
                    id="pitch-decrease"
                    src={flatIcon}
                    alt={`Pitch down ${step} st`}
                    onClick={() => commit(current - step)}
                />
                <ValueButton
                    id="pitch-value"
                    title="Reset pitch"
                    value={disabled ? "N/A" : `${format(current)} st`}
                    onClick={() => commit(0)}
                />
                <IconButton
                    id="pitch-increase"
                    src={sharpIcon}
                    alt={`Pitch up ${step} st`}
                    onClick={() => commit(current + step)}
                />
            </div>

            {/* Exact value, 0.1 st resolution, applied while typing */}
            {showInput && (
                <div className="flex items-center justify-center gap-1.5 mt-1">
                    <input
                        type="number"
                        id="pitch-exact"
                        className="w-18 px-1 py-0.5 text-center text-base font-body bg-white border-2 border-primary rounded-lg disabled:opacity-50"
                        min={-range}
                        max={range}
                        step={0.1}
                        value={draftText ?? (disabled ? "" : String(current))}
                        disabled={disabled}
                        onChange={(e) => scheduleCommit(e.target.value)}
                        onBlur={flush}
                        onKeyDown={(e) => e.key === "Enter" && flush()}
                    />
                    <span className="text-sm opacity-80">st (±{range})</span>
                </div>
            )}
        </div>
    );
}

export default PitchControl;
