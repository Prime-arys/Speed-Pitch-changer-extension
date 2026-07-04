import { AudioGraphPatcher } from "./pitch/AudioGraphPatcher";
import { PitchNodeRegistry } from "./pitch/PitchNodeRegistry";
import { PitchRouter } from "./pitch/PitchRouter";
import { MediaElementSourcer } from "./pitch/MediaElementSourcer";

/**
 * Real-time pitch shifting that runs in the MAIN world. Rather than creating a
 * competing AudioContext (which fights the page over an element's single
 * allowed source node), it patches the page's own graph and splices a pitch
 * worklet node (engine chosen in settings) before the destination. This class
 * is just the orchestrator; the work is split across composed collaborators:
 *
 *  - {@link AudioGraphPatcher}  – patches the Web Audio prototypes, reports
 *    destination connections, tracks element sources.
 *  - {@link PitchNodeRegistry}  – owns the worklet module and per-context
 *    pitch nodes.
 *  - {@link PitchRouter}        – keeps each connection routed wet/dry.
 *  - {@link MediaElementSourcer} – sources plain media elements the site never
 *    routes through Web Audio.
 */
export class PitchController {
    private semitones = 0;

    private readonly patcher: AudioGraphPatcher;
    private readonly registry: PitchNodeRegistry;
    private readonly router: PitchRouter;
    private readonly sourcer: MediaElementSourcer;

    constructor() {
        const isEngaged = () => this.engaged;

        // The patches must be installed at document_start, before the page
        // builds its audio graph, so all wiring happens here in the constructor.
        this.patcher = new AudioGraphPatcher();
        this.registry = new PitchNodeRegistry(this.patcher);
        this.router = new PitchRouter(this.patcher, this.registry, isEngaged);
        this.sourcer = new MediaElementSourcer(this.patcher, isEngaged);

        this.patcher.onConnectToDestination((node, ctx, dest) =>
            this.router.track(node, ctx, dest)
        );
        this.patcher.onDisconnect((node) => this.router.untrack(node));
    }

    /** Pitch is "engaged" only when actually shifting. */
    private get engaged(): boolean {
        return this.semitones !== 0;
    }

    /** Start discovering media elements. Patches are already installed. */
    init(): void {
        this.sourcer.init();
    }

    /**
     * Set the pitch shift in semitones for every routed element.
     * @param semitones - positive raises pitch, negative lowers it.
     */
    setPitch(semitones: number): void {
        const wasEngaged = this.engaged;
        this.semitones = semitones;

        if (this.engaged) this.sourcer.attachPlain();
        this.registry.applySemitones(semitones);
        if (this.engaged !== wasEngaged) this.router.reconcileAll();

        console.log("[PitchController] Set pitch to", semitones, "semitones");
    }

    /** Current pitch shift in semitones (0 by default). */
    getPitch(): number {
        return this.semitones;
    }
}
