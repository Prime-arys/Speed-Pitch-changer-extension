import { CommandsData } from "@/models/CommandsData";
import SignalsmithStretch, { StretchNode } from "signalsmith-stretch";

const ELEM_SELECTOR = "video,audio";

// Symbol to mark elements that already have a source node
const SOURCE_NODE_KEY = Symbol("pitchControllerSourceNode");

// Set to true to bypass pitch processing and just pass audio through
const DEBUG_BYPASS = false;

// Get the URL for the signalsmith-stretch worklet from extension resources
function getWorkletUrl(): string {
    const workletPath = "/signalsmith-stretch-worklet.js";

    // In browser extension context, we need to use the extension's web-accessible resource
    if (typeof browser !== "undefined" && browser.runtime?.getURL) {
        return (browser.runtime.getURL as (path: string) => string)(workletPath);
    }

    // Fallback - won't work but provides a path for debugging
    return workletPath;
}

// Configure the module URL for SignalsmithStretch
// This must be done before calling the function
(SignalsmithStretch as unknown as { moduleUrl?: string }).moduleUrl = getWorkletUrl();

interface MediaElementState {
    element: HTMLMediaElement;
    sourceNode: MediaElementAudioSourceNode;
    stretchNode: StretchNode | null;
    gainNode: GainNode;
    isConnected: boolean;
    currentSemitones: number;
}

interface MediaElementWithSource extends HTMLMediaElement {
    [SOURCE_NODE_KEY]?: MediaElementAudioSourceNode;
}

export class PitchController {
    private audioContext: AudioContext | null = null;
    private mediaElements: Map<HTMLMediaElement, MediaElementState> = new Map();
    private globalSemitones: number = 0;
    private isEnabled: boolean = true;
    private pendingElements: Set<HTMLMediaElement> = new Set();
    private isInitialized: boolean = false;
    private settings: CommandsData | null = null;


    constructor(settings: CommandsData) {
        this.settings = settings;
    }

    /**
     * Initialize the pitch controller and start observing for media elements
     */
    init(): void {
        if (document) {
            new MutationObserver(() => {
                this.processExistingElements();
            }).observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true,
            });
            this.processExistingElements();
        }
    }

    private async initContext(): Promise<void> {
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }
            // Resume context if suspended
            if (this.audioContext.state === "suspended") {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            
            // Process any pending elements
            for (const element of this.pendingElements) {
                await this.connectMediaElement(element);
            }
            this.pendingElements.clear();

        };


    /**
     * Process all existing media elements in the DOM
     */
    private processExistingElements(): void {
        const elements = document.querySelectorAll<HTMLMediaElement>(ELEM_SELECTOR);
        elements.forEach((element) => {
            if (!this.mediaElements.has(element) && !this.pendingElements.has(element)) {
                this.attachToMediaElement(element);
            }
        });

        // Clean up removed elements
        this.mediaElements.forEach((state, element) => {
            if (!document.contains(element)) {
                this.detachFromMediaElement(element);
            }
        });
    }

    /**
     * Attach pitch processing to a media element
     */
    private async attachToMediaElement(element: HTMLMediaElement): Promise<void> {
        // Check if element already has a source node (can only create one per element)
        const mediaEl = element as MediaElementWithSource;
        if (mediaEl[SOURCE_NODE_KEY]) {
            console.log("[PitchController] Element already has source node, skipping:", element);
            return;
        }

        // Wait for AudioContext to be available
        if (!this.isInitialized || !this.audioContext) {
            // Store element for later processing
            this.pendingElements.add(element);
            return;
        }

        await this.connectMediaElement(element);
    }

    /**
     * Connect a media element to the audio processing chain
     */
    private async connectMediaElement(element: HTMLMediaElement): Promise<void> {
        if (!this.audioContext) return;

        // Check if already connected
        if (this.mediaElements.get(element)?.isConnected) {
            return;
        }

        const mediaEl = element as MediaElementWithSource;
        
        // Check if element already has a source node
        if (mediaEl[SOURCE_NODE_KEY]) {
            console.log("[PitchController] Element already has source node:", element);
            return;
        }

        // Ensure AudioContext is running
        if (this.audioContext.state === "suspended") {
            try {
                await this.audioContext.resume();
            } catch {
                console.warn("[PitchController] Could not resume AudioContext");
                return;
            }
        }

        try {
            // Create source node from media element
            const sourceNode = this.audioContext.createMediaElementSource(element);
            
            // Store reference to prevent duplicate source nodes
            mediaEl[SOURCE_NODE_KEY] = sourceNode;

            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 1.0;

            let stretchNode: StretchNode | null = null;

            if (DEBUG_BYPASS) {
                // Bypass mode: source -> gain -> destination
                console.log("[PitchController] DEBUG: Bypass mode - direct connection");
                sourceNode.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
            } else {
                // Try to create the stretch node for pitch shifting
                try {
                    stretchNode = await SignalsmithStretch(this.audioContext, {
                        numberOfInputs: 1,
                        numberOfOutputs: 1,
                        outputChannelCount: [2],
                    });

                    // Connect the audio graph: source -> stretch -> gain -> destination
                    sourceNode.connect(stretchNode);
                    stretchNode.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);

                    // Start the stretch node for live input processing
                    // For live input, we must call schedule with active: true
                    await stretchNode.schedule({
                        active: true,
                        semitones: this.globalSemitones,
                    });
                    
                    console.log("[PitchController] Stretch node started with semitones:", this.globalSemitones);
                } catch (stretchError) {
                    // AudioWorklet failed (likely CSP restriction in extension context)
                    // Fall back to direct connection (no pitch shifting)
                    console.warn("[PitchController] SignalsmithStretch failed, falling back to bypass mode:", stretchError);
                    stretchNode = null;
                    sourceNode.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                }
            }

            // Store the state
            this.mediaElements.set(element, {
                element,
                sourceNode,
                stretchNode,
                gainNode,
                isConnected: true,
                currentSemitones: this.globalSemitones,
            });

            // Remove from pending if present
            this.pendingElements.delete(element);

            console.log("[PitchController] Connected media element:", element);
        } catch (error) {
            // Remove from pending to allow retry
            this.pendingElements.delete(element);
            
            // Check if it's because the element already has a source
            if (error instanceof DOMException && error.message.includes("already")) {
                console.warn("[PitchController] Media element already connected to another AudioContext");
            } else {
                console.error("[PitchController] Failed to connect media element:", error);
            }
        }
    }

    /**
     * Detach pitch processing from a media element
     */
    private detachFromMediaElement(element: HTMLMediaElement): void {
        const state = this.mediaElements.get(element);
        if (!state) return;

        if (state.isConnected) {
            try {
                state.sourceNode.disconnect();
                if (state.stretchNode) {
                    state.stretchNode.disconnect();
                    state.stretchNode.stop();
                }
                state.gainNode.disconnect();
            } catch {
                // Element may have already been cleaned up
            }
        }

        this.mediaElements.delete(element);
        console.log("[PitchController] Detached media element:", element);
    }

    /**
     * Set the pitch shift in semitones for all media elements
     * @param semitones - Number of semitones to shift (positive = higher, negative = lower)
     */
    async setPitch(semitones: number): Promise<void> {
        this.globalSemitones = semitones;

        // Lazy initialization of the context to avoid processing if it is not necessary
        if (!this.isInitialized) {
            await this.initContext();
        }

        if (!this.audioContext) return;

        const promises = Array.from(this.mediaElements.values())
            .filter((state) => state.isConnected && state.stretchNode)
            .map(async (state) => {
                state.currentSemitones = semitones;
                await state.stretchNode!.schedule({
                    semitones,
                });
            });

        await Promise.all(promises);
        console.log("[PitchController] Set pitch to", semitones, "semitones");
    }

    /**
     * Get the current pitch shift in semitones
     * (will be 0 by default)
     */
    getPitch(): number {
        return this.globalSemitones;
    }

    /**
     * Increase pitch by a number of semitones
     * @param amount - Number of semitones to increase (default: 1)
     */
    async pitchUp(amount: number = 1): Promise<void> {
        switch (this.settings?.radio.pitch.preset) {
            case 1:
                await this.setPitch(this.globalSemitones + amount);
                break;
            case 2:
                await this.setPitch(this.globalSemitones + this.settings.radio.pitch.custom.plus_minus);
                break;
            default:
                await this.setPitch(this.globalSemitones + amount);
                break;
        }
    }

    /**
     * Decrease pitch by a number of semitones
     * @param amount - Number of semitones to decrease (default: 1)
     */
    async pitchDown(amount: number = 1): Promise<void> {
        switch (this.settings?.radio.pitch.preset) {
            case 1:
                await this.setPitch(this.globalSemitones - amount);
                break;
            case 2:
                await this.setPitch(this.globalSemitones - this.settings.radio.pitch.custom.plus_minus);
                break;
            default:
                await this.setPitch(this.globalSemitones - amount);
                break;
        }
    }

    /**
     * Reset pitch to normal (0 semitones)
     */
    async resetPitch(): Promise<void> {
        await this.setPitch(0);
    }

    /**
     * Enable or disable pitch processing
     */
    async setEnabled(enabled: boolean): Promise<void> {
        this.isEnabled = enabled;

        const promises = Array.from(this.mediaElements.values())
            .filter((state) => state.isConnected && state.stretchNode)
            .map(async (state) => {
                await state.stretchNode!.schedule({
                    active: enabled,
                    semitones: enabled ? state.currentSemitones : 0,
                });
            });

        await Promise.all(promises);
        console.log("[PitchController] Enabled:", enabled);
    }

    /**
     * Check if pitch processing is enabled
     */
    isActive(): boolean {
        return this.isEnabled;
    }

    /** 
     * Check if the controller has been initialized
     */
    isInit(): boolean {
        return this.isInitialized;
    }

    /**
     * Get the number of connected media elements
     */
    getConnectedCount(): number {
        return Array.from(this.mediaElements.values()).filter(
            (state) => state.isConnected
        ).length;
    }
}


