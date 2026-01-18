// * Auto-generated *
// Type definitions for signalsmith-stretch

declare module "signalsmith-stretch" {
    /**
     * Schedule options for the StretchNode
     */
    export interface ScheduleOptions {
        /** Audio context time for this change (seconds) */
        output?: number;
        /** Whether the node is processing audio */
        active?: boolean;
        /** Position in input buffer (seconds) */
        input?: number;
        /** Playback rate (e.g., 0.5 = half speed) */
        rate?: number;
        /** Pitch shift in semitones */
        semitones?: number;
        /** Tonality limit in Hz (default 8000) */
        tonalityHz?: number;
        /** Formant shift in semitones */
        formantSemitones?: number;
        /** Whether to apply formant compensation */
        formantCompensation?: boolean;
        /** Rough fundamental for formant analysis (Hz), 0 for pitch-tracking */
        formantBaseHz?: number;
        /** Loop start position in seconds */
        loopStart?: number;
        /** Loop end position in seconds */
        loopEnd?: number;
    }

    /**
     * Configuration options for the StretchNode
     */
    export interface ConfigureOptions {
        /** Block length in ms (e.g., 120) */
        blockMs?: number | null;
        /** Interval in ms (default blockMs/4) */
        intervalMs?: number;
        /** Spread computation more evenly across time */
        splitComputation?: boolean;
        /** Preset configuration ("default" or "cheaper") */
        preset?: "default" | "cheaper";
    }

    /**
     * Channel configuration options for creating the StretchNode
     */
    export interface ChannelOptions {
        /** Number of inputs */
        numberOfInputs?: number;
        /** Number of outputs */
        numberOfOutputs?: number;
        /** Output channel count per output */
        outputChannelCount?: number[];
    }

    /**
     * Buffer extent information returned by dropBuffers
     */
    export interface BufferExtent {
        /** Start time of the buffer in seconds */
        start: number;
        /** End time of the buffer in seconds */
        end: number;
    }

    /**
     * An AudioWorkletNode with Signalsmith Stretch extensions for real-time
     * pitch shifting and time stretching
     */
    export interface StretchNode extends AudioWorkletNode {
        /** The current playback position within the input audio (seconds) */
        inputTime: number;

        /**
         * Schedule a change to the playback parameters
         * @param options - The schedule options
         */
        schedule(options: ScheduleOptions): Promise<void>;

        /**
         * Start playback or processing
         * @param when - Audio context time to start (optional, defaults to now)
         * @param offset - Offset within the buffer to start (optional)
         * @param duration - Duration to play (optional)
         */
        start(when?: number, offset?: number, duration?: number): Promise<void>;

        /**
         * Stop playback or processing
         * @param when - Audio context time to stop (optional, defaults to now)
         */
        stop(when?: number): Promise<void>;

        /**
         * Add buffers to the end of current input sample buffers
         * @param buffers - Array of typed arrays (one per channel)
         * @returns Promise resolving to the new buffer end time in seconds
         */
        addBuffers(buffers: Float32Array[]): Promise<number>;

        /**
         * Drop all input buffers (resets buffer end time to 0)
         */
        dropBuffers(): Promise<void>;

        /**
         * Drop input buffers before a given time
         * @param toSeconds - Time before which to drop buffers
         * @returns Promise with the current buffer extent
         */
        dropBuffers(toSeconds: number): Promise<BufferExtent>;

        /**
         * Get the latency when used in "live input" mode
         * @returns Latency in seconds
         */
        latency(): Promise<number>;

        /**
         * Reconfigure the stretch node
         * @param options - Configuration options
         */
        configure(options: ConfigureOptions): Promise<void>;

        /**
         * Set the update interval for inputTime updates
         * @param seconds - Update interval in seconds
         * @param callback - Optional callback function called on each update
         */
        setUpdateInterval(
            seconds: number,
            callback?: (inputTime: number) => void
        ): Promise<void>;
    }

    /**
     * Creates a Stretch node for real-time pitch shifting and time stretching
     * @param audioContext - The AudioContext to use
     * @param options - Optional channel configuration
     * @returns Promise resolving to a StretchNode
     */
    function SignalsmithStretch(
        audioContext: AudioContext,
        options?: ChannelOptions
    ): Promise<StretchNode>;

    export default SignalsmithStretch;
}
