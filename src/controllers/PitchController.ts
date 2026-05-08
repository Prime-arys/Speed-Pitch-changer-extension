import { CommandsData } from "@/models/CommandsData";
import SignalsmithStretch, { StretchNode } from "signalsmith-stretch";
import { SignalsmithStretchConfigurator } from "./SignalsmithStretchConfigurator";
import {
    MEDIA_ELEMENT_SOURCE_NODE_KEY,
    MEDIA_ELEMENT_SOURCE_OWNER_KEY,
    MediaElementSourceOwner,
    SOURCE_NODE_CONNECTIONS_KEY,
    type SourceNodeConnection,
} from "@/utils/vars";

const ELEM_SELECTOR = "video,audio";

// Set to true to bypass pitch processing and just pass audio through
const DEBUG_BYPASS = false;

interface MediaElementState {
    element: HTMLMediaElement;
    sourceNode: MediaElementAudioSourceNode;
    stretchNode: StretchNode | null;
    gainNode: GainNode;
    audioContext: AudioContext;
    sourceOwner: MediaElementSourceOwner;
    isConnected: boolean;
    currentSemitones: number;
}

interface MediaElementWithSource extends HTMLMediaElement {
    [MEDIA_ELEMENT_SOURCE_NODE_KEY]?: MediaElementAudioSourceNode;
    [MEDIA_ELEMENT_SOURCE_OWNER_KEY]?: MediaElementSourceOwner;
}

interface MediaElementSourceNodeWithConnections
    extends MediaElementAudioSourceNode {
    [SOURCE_NODE_CONNECTIONS_KEY]?: SourceNodeConnection[];
}

export class PitchController {
    private audioContext: AudioContext | null = null;
    private mediaElements: Map<HTMLMediaElement, MediaElementState> = new Map();
    private globalSemitones: number = 0;
    private isEnabled: boolean = true;
    private pendingElements: Set<HTMLMediaElement> = new Set();
    private blockedElements: Set<HTMLMediaElement> = new Set();
    private isInitialized: boolean = false;
    private settings: CommandsData | null = null;
    private SignalsmithStretch: typeof SignalsmithStretch | null = null;


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

    private async loadStretchModule(): Promise<void> {
        try {
            this.SignalsmithStretch = await SignalsmithStretchConfigurator.create();
        } catch (error) {
            console.error("[PitchController] Failed to load SignalsmithStretch module, pitch shifting will be unavailable:", error);
            this.SignalsmithStretch = null;
        }
    }

    private async initContext(): Promise<void> {
        if (!this.SignalsmithStretch) {
            await this.loadStretchModule();
        }

        if (this.audioContext && this.audioContext.state === "suspended") {
            await this.audioContext.resume();
        }

        this.isInitialized = true;

        // Process any pending elements
        for (const element of this.pendingElements) {
            await this.connectMediaElement(element);
        }
        this.pendingElements.clear();
    }

    private async ensureContextRunning(
        context: AudioContext
    ): Promise<boolean> {
        if (context.state === "suspended") {
            try {
                await context.resume();
            } catch {
                console.warn("[PitchController] Could not resume AudioContext");
                return false;
            }
        }
        return context.state !== "closed";
    }

    private getSourceConnections(
        sourceNode: MediaElementAudioSourceNode
    ): SourceNodeConnection[] {
        const nodeWithConnections =
            sourceNode as MediaElementSourceNodeWithConnections;
        return nodeWithConnections[SOURCE_NODE_CONNECTIONS_KEY] ?? [];
    }

    private disconnectSourceTargets(
        sourceNode: MediaElementAudioSourceNode,
        connections: SourceNodeConnection[]
    ): void {
        connections.forEach((connection) => {
            try {
                if (connection.destination instanceof AudioParam) {
                    if (typeof connection.output === "number") {
                        sourceNode.disconnect(
                            connection.destination,
                            connection.output
                        );
                    } else {
                        sourceNode.disconnect(connection.destination);
                    }
                } else if (typeof connection.output === "number") {
                    if (typeof connection.input === "number") {
                        sourceNode.disconnect(
                            connection.destination,
                            connection.output,
                            connection.input
                        );
                    } else {
                        sourceNode.disconnect(
                            connection.destination,
                            connection.output
                        );
                    }
                } else {
                    sourceNode.disconnect(connection.destination);
                }
            } catch {
                // Ignore failures for stale or already-disconnected targets
            }
        });
    }

    private connectNodeToTargets(
        node: AudioNode,
        connections: SourceNodeConnection[],
        fallbackDestination: AudioNode
    ): void {
        if (connections.length === 0) {
            node.connect(fallbackDestination);
            return;
        }

        connections.forEach((connection) => {
            if (connection.destination instanceof AudioParam) {
                if (typeof connection.output === "number") {
                    node.connect(connection.destination, connection.output);
                } else {
                    node.connect(connection.destination);
                }
                return;
            }

            if (typeof connection.output === "number") {
                if (typeof connection.input === "number") {
                    node.connect(
                        connection.destination,
                        connection.output,
                        connection.input
                    );
                } else {
                    node.connect(connection.destination, connection.output);
                }
                return;
            }

            node.connect(connection.destination);
        });
    }


    /**
     * Process all existing media elements in the DOM
     */
    private processExistingElements(): void {
        const elements = document.querySelectorAll<HTMLMediaElement>(ELEM_SELECTOR);
        elements.forEach((element) => {
            if (
                !this.mediaElements.has(element) &&
                !this.pendingElements.has(element) &&
                !this.blockedElements.has(element)
            ) {
                this.attachToMediaElement(element);
            }
        });

        // Clean up removed elements
        this.mediaElements.forEach((state, element) => {
            if (!document.contains(element)) {
                this.detachFromMediaElement(element);
            }
        });

        this.blockedElements.forEach((element) => {
            if (!document.contains(element)) {
                this.blockedElements.delete(element);
            }
        });
    }

    /**
     * Attach pitch processing to a media element
     */
    private async attachToMediaElement(element: HTMLMediaElement): Promise<void> {
        // Check if element already has a source node (can only create one per element)
        const mediaEl = element as MediaElementWithSource;
        if (
            mediaEl[MEDIA_ELEMENT_SOURCE_NODE_KEY] &&
            mediaEl[MEDIA_ELEMENT_SOURCE_OWNER_KEY] === "extension"
        ) {
            console.log(
                "[PitchController] Element already has extension source node, skipping:",
                element
            );
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
        // Check if already connected
        if (this.mediaElements.get(element)?.isConnected) {
            return;
        }

        const mediaEl = element as MediaElementWithSource;
        const existingSourceNode = mediaEl[MEDIA_ELEMENT_SOURCE_NODE_KEY] ?? null;
        const existingOwner = mediaEl[MEDIA_ELEMENT_SOURCE_OWNER_KEY];

        let sourceNode: MediaElementAudioSourceNode | null = existingSourceNode;
        let sourceOwner: MediaElementSourceOwner =
            existingOwner ?? (existingSourceNode ? "page" : "extension");
        let context: AudioContext | null =
            sourceNode?.context instanceof AudioContext
                ? (sourceNode.context as AudioContext)
                : null;
        let existingConnections: SourceNodeConnection[] = [];

        try {
            if (sourceOwner === "page" && sourceNode) {
                if (!context) {
                    this.blockedElements.add(element);
                    console.warn(
                        "[PitchController] Page source node uses unsupported AudioContext. Skipping:",
                        element
                    );
                    return;
                }

                if (!(await this.ensureContextRunning(context))) {
                    return;
                }

                existingConnections = this.getSourceConnections(sourceNode);
                if (existingConnections.length > 0) {
                    this.disconnectSourceTargets(sourceNode, existingConnections);
                } else {
                    console.warn(
                        "[PitchController] No tracked connections for page source node. Disconnecting all and wiring to destination.",
                        element
                    );
                    try {
                        sourceNode.disconnect();
                    } catch {
                        // Ignore disconnect failures
                    }
                }
            } else {
                if (!this.audioContext) {
                    this.audioContext = new AudioContext();
                }
                context = this.audioContext;
                if (!(await this.ensureContextRunning(context))) {
                    return;
                }

                if (!sourceNode) {
                    // Create source node from media element
                    sourceNode = context.createMediaElementSource(element);

                    // Store reference to prevent duplicate source nodes
                    mediaEl[MEDIA_ELEMENT_SOURCE_NODE_KEY] = sourceNode;
                    mediaEl[MEDIA_ELEMENT_SOURCE_OWNER_KEY] = "extension";
                }

                sourceOwner = "extension";
            }

            if (!sourceNode || !context) {
                return;
            }

            // Create gain node for volume control
            const gainNode = context.createGain();
            gainNode.gain.value = 1.0;

            let stretchNode: StretchNode | null = null;

            if (DEBUG_BYPASS) {
                // Bypass mode: source -> gain -> destination
                console.log("[PitchController] DEBUG: Bypass mode - direct connection");
                sourceNode.connect(gainNode);
                if (sourceOwner === "page") {
                    this.connectNodeToTargets(
                        gainNode,
                        existingConnections,
                        context.destination
                    );
                } else {
                    gainNode.connect(context.destination);
                }
            } else {
                // Try to create the stretch node for pitch shifting
                try {
                    stretchNode = await SignalsmithStretch(context, {
                        numberOfInputs: 1,
                        numberOfOutputs: 1,
                        outputChannelCount: [2],
                    });

                    // Connect the audio graph: source -> stretch -> gain -> destination
                    sourceNode.connect(stretchNode);
                    stretchNode.connect(gainNode);
                    if (sourceOwner === "page") {
                        this.connectNodeToTargets(
                            gainNode,
                            existingConnections,
                            context.destination
                        );
                    } else {
                        gainNode.connect(context.destination);
                    }

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
                    if (sourceOwner === "page") {
                        this.connectNodeToTargets(
                            gainNode,
                            existingConnections,
                            context.destination
                        );
                    } else {
                        gainNode.connect(context.destination);
                    }
                }
            }

            // Store the state
            this.mediaElements.set(element, {
                element,
                sourceNode,
                stretchNode,
                gainNode,
                audioContext: context,
                sourceOwner,
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
                const mediaEl = element as MediaElementWithSource;
                mediaEl[MEDIA_ELEMENT_SOURCE_OWNER_KEY] = "page";
                this.blockedElements.add(element);
                console.warn(
                    "[PitchController] Media element already connected to another AudioContext. Cannot attach pitch processing.",
                    element
                );
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

        const mediaEl = element as MediaElementWithSource;
        if (
            mediaEl[MEDIA_ELEMENT_SOURCE_OWNER_KEY] === "extension" &&
            mediaEl[MEDIA_ELEMENT_SOURCE_NODE_KEY] === state.sourceNode
        ) {
            delete mediaEl[MEDIA_ELEMENT_SOURCE_NODE_KEY];
            delete mediaEl[MEDIA_ELEMENT_SOURCE_OWNER_KEY];
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

        const promises = Array.from(this.mediaElements.values())
            .filter((state) => state.isConnected && state.stretchNode)
            .map(async (state) => {
                if (!(await this.ensureContextRunning(state.audioContext))) {
                    return;
                }

                state.currentSemitones = semitones;
                await state.stretchNode!.schedule({
                    active: this.isEnabled,
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
                if (!(await this.ensureContextRunning(state.audioContext))) {
                    return;
                }

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


