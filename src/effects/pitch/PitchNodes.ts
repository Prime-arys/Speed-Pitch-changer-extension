import { DEFAULT_PITCH_ENGINE, type PitchEngine } from "@/models/CommandsData";
import { audioGraph } from "@/media/detection";
import { createPitchNode, type PitchNodeHandle } from "./engines";

/**
 * A node being built is no longer wanted: the engine changed, or the page threw
 * its context away. Not a failure, so it must not be reported as one.
 */
class Cancelled extends Error {}

/**
 * One pitch node per audio context, created on first use with the configured
 * engine and kept in sync with the current shift.
 *
 * A page can run several contexts (its own, plus the fallback one used for
 * elements it never routes through Web Audio); each needs its own node, since
 * a node cannot be connected across contexts.
 */
export class PitchNodes {
    private engine: PitchEngine = DEFAULT_PITCH_ENGINE;
    private semitones = 0;

    private pending = new WeakMap<BaseAudioContext, Promise<PitchNodeHandle>>();
    private ready = new WeakMap<BaseAudioContext, PitchNodeHandle>();
    private handles = new Set<PitchNodeHandle>();
    /** Bumped by {@link dispose}, so nodes still loading are thrown away. */
    private generation = 0;

    /** Engine and shift used from now on; live nodes follow the shift at once. */
    configure(engine: PitchEngine, semitones: number): void {
        this.engine = engine;
        this.semitones = semitones;
        this.handles.forEach((handle) => handle.setSemitones(semitones));
    }

    /** The node of a context, built and wired to its destination on first call. */
    ensure(context: BaseAudioContext): Promise<AudioNode> {
        let pending = this.pending.get(context);
        if (!pending) {
            pending = this.create(context);
            this.pending.set(context, pending);
            pending.catch((error) => {
                if (!(error instanceof Cancelled)) {
                    console.error(
                        "[pitch] worklet unavailable, audio stays unprocessed",
                        error
                    );
                }
                this.pending.delete(context);
            });
        }
        return pending.then((handle) => handle.node);
    }

    /** The node of a context if it is already built, for synchronous unrouting. */
    get(context: BaseAudioContext): AudioNode | undefined {
        return this.ready.get(context)?.node;
    }

    /** Drop every node, e.g. when the engine changes. */
    dispose(): void {
        this.generation += 1;
        this.handles.forEach((handle) => handle.dispose());
        this.handles.clear();
        this.pending = new WeakMap();
        this.ready = new WeakMap();
    }

    private async create(context: BaseAudioContext): Promise<PitchNodeHandle> {
        const generation = this.generation;

        // A suspended context processes nothing; resuming is best effort since
        // it needs a gesture the page may not have given yet.
        if (context instanceof AudioContext && context.state === "suspended") {
            try {
                await context.resume();
            } catch {
                /* best effort */
            }
        }

        let handle;
        try {
            handle = await createPitchNode(this.engine, context, this.semitones);
        } catch (error) {
            // A context torn down mid-load takes the worklet with it.
            if (context.state === "closed") {
                throw new Cancelled("context closed while loading");
            }
            throw error;
        }

        if (context.state === "closed") {
            handle.dispose();
            throw new Cancelled("context closed while loading");
        }
        if (generation !== this.generation) {
            handle.dispose();
            throw new Cancelled("engine changed while loading");
        }

        audioGraph.own(handle.node);
        audioGraph.connect(handle.node, context.destination);

        this.handles.add(handle);
        this.ready.set(context, handle);
        return handle;
    }
}
