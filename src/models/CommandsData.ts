export type CustomSpeedPitch = {
    plus_minus: number;
    multiply_divide: number;
};

export type SpeedPitch<T> = {
    preset: T;
    custom: CustomSpeedPitch;
};

export type Radio = {
    speed: SpeedPitch<1 | 2 | 3>;
    pitch: SpeedPitch<1 | 2>;
};

export type Switch = {
    preserve_pitch: boolean;
    shortcuts: boolean;
    ignore_text_field: boolean;
};

export type Commands = {
    reset: KeyboardEvent["code"];
    speedUp: KeyboardEvent["code"];
    speedDown: KeyboardEvent["code"];
    speedSet: KeyboardEvent["code"];
};

export const PITCH_ENGINES = ["signalsmith-stretch", "soundtouch"] as const;
export type PitchEngine = (typeof PITCH_ENGINES)[number];

export type PitchRange = 12 | 24;

export type PitchProcessing = {
    /** Worklet implementation used for pitch shifting. */
    engine: PitchEngine;
    /** Semitone limit exposed by the popup controls (±range). */
    range: PitchRange;
    /** Show the exact-value pitch input field in the popup. */
    showInput: boolean;
};

export type CommandsData = {
    commands: Commands;
    switch: Switch;
    radio: Radio;
    pitch: PitchProcessing;
};
