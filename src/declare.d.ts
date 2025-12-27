// https://github.com/microsoft/TypeScript/issues/28308#issuecomment-1921865859

interface AudioWorkletProcessor {
    readonly port: MessagePort;
}

interface AudioWorkletProcessorImpl extends AudioWorkletProcessor {
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean;
}

// deno-lint-ignore no-var
// eslint-disable-next-line no-var
declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

type AudioParamDescriptor = {
    name: string;
    automationRate: AutomationRate;
    minValue: number;
    maxValue: number;
    defaultValue: number;
};

interface AudioWorkletProcessorConstructor {
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessorImpl;
    parameterDescriptors?: AudioParamDescriptor[];
}

declare function registerProcessor(
    name: string,
    processorCtor: AudioWorkletProcessorConstructor
): void;
