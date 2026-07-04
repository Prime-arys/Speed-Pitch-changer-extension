import type { PitchEngine } from "@/models/CommandsData";
import { sendWindowMessage } from "@/utils/messaging-window";
import { createPitchNode, PitchNodeHandle } from "./engines";
import { AudioGraphPatcher } from "./AudioGraphPatcher";

/**
 * Owns one pitch node per AudioContext, created through the engine selected
 * in the extension settings. Nodes are created lazily, connected to their
 * context's destination, and kept in sync with the current pitch.
 */
export class PitchNodeRegistry {
    private engine: Promise<PitchEngine> | null = null;

    private byCtx = new WeakMap<BaseAudioContext, Promise<PitchNodeHandle>>();
    private resolvedByCtx = new WeakMap<BaseAudioContext, PitchNodeHandle>();
    private handles = new Set<PitchNodeHandle>();

    private semitones = 0;

    constructor(private patcher: AudioGraphPatcher) {}

    /**
     * The pitch node for a context, created (and wired to its destination) on
     * first use.
     */
    ensure(ctx: AudioContext): Promise<PitchNodeHandle> {
        const cached = this.byCtx.get(ctx);
        if (cached) return cached;

        const promise = this.create(ctx);
        this.byCtx.set(ctx, promise);
        promise.catch((error) => {
            console.error(
                "[PitchNodeRegistry] Pitch worklet unavailable, pitch shifting disabled:",
                error
            );
            this.byCtx.delete(ctx);
        });
        return promise;
    }

    /** The already-created node for a context, for the synchronous un-route path. */
    get(ctx: BaseAudioContext): AudioNode | undefined {
        return this.resolvedByCtx.get(ctx)?.node;
    }

    /** Apply a pitch to every live node and remember it for nodes created later. */
    applySemitones(semitones: number): void {
        this.semitones = semitones;
        this.handles.forEach((handle) => handle.setSemitones(semitones));
    }

    private async create(ctx: AudioContext): Promise<PitchNodeHandle> {
        this.engine ??= this.resolveEngine();
        const engine = await this.engine;

        if (ctx.state === "suspended") {
            try {
                await ctx.resume();
            } catch {
                /* best effort */
            }
        }

        const handle = await createPitchNode(engine, ctx, this.semitones);
        this.patcher.markOwn(handle.node);
        this.patcher.connect(handle.node, ctx.destination);

        this.handles.add(handle);
        this.resolvedByCtx.set(ctx, handle);
        return handle;
    }

    /**
     * The engine configured in settings, asked from the content script. Only
     * needed once pitch actually engages, which always happens through the
     * content script — so the handler is guaranteed to be listening.
     */
    private async resolveEngine(): Promise<PitchEngine> {
        try {
            return await sendWindowMessage("getPitchEngine");
        } catch (error) {
            console.warn(
                "[PitchNodeRegistry] Could not read pitch engine setting, using signalsmith-stretch:",
                error
            );
            return "signalsmith-stretch";
        }
    }
}
