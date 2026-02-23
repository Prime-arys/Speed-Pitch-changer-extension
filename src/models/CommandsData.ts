export type CustomSpeedPitch = {
    plus_minus: number;
    multiply_divide: number;
};

export type SpeedPitch = {
    preset: number;
    custom: CustomSpeedPitch;
};

export type Radio = {
    speed: SpeedPitch;
    pitch: SpeedPitch;
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

export type CommandsData = {
    commands: Commands;
    switch: Switch;
    radio: Radio;
};
