import SignalsmithStretch, { StretchNode } from "signalsmith-stretch";
import { SignalsmithStretchConfigurator } from "../SignalsmithStretchConfigurator";
import { AudioGraphPatcher } from "./AudioGraphPatcher";

/**
 * Owns the SignalsmithStretch module and one stretch node per AudioContext.
 * Nodes are created lazily, connected to their context's destination, and kept
 * in sync with the current pitch.
 */
export class StretchNodeRegistry {
    private factory: typeof SignalsmithStretch | null = null;
    private modulePromise: Promise<void> | null = null;

    private byCtx = new WeakMap<BaseAudioContext, Promise<StretchNode>>();
    private resolvedByCtx = new WeakMap<BaseAudioContext, StretchNode>();
    private nodes = new Set<StretchNode>();

    private semitones = 0;

    constructor(private patcher: AudioGraphPatcher) {}

    /**
     * The stretch node for a context, created (and wired to its destination) on
     * first use.
     */
    ensure(ctx: AudioContext): Promise<StretchNode> {
        const cached = this.byCtx.get(ctx);
        if (cached) return cached;

        const promise = this.create(ctx);
        this.byCtx.set(ctx, promise);
        promise.catch(() => this.byCtx.delete(ctx));
        return promise;
    }

    /** The already-created node for a context, for the synchronous un-route path. */
    get(ctx: BaseAudioContext): StretchNode | undefined {
        return this.resolvedByCtx.get(ctx);
    }

    /** Apply a pitch to every live node and remember it for nodes created later. */
    async applySemitones(semitones: number): Promise<void> {
        this.semitones = semitones;
        const updates: Promise<void>[] = [];
        this.nodes.forEach((node) => updates.push(node.schedule({ semitones })));
        await Promise.all(updates);
    }

    private async create(ctx: AudioContext): Promise<StretchNode> {
        if (!this.factory) await this.loadModule();
        if (!this.factory) {
            throw new Error("SignalsmithStretch module unavailable");
        }

        if (ctx.state === "suspended") {
            try {
                await ctx.resume();
            } catch {
                /* best effort */
            }
        }

        const node = await this.factory(ctx, {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2],
        });
        this.patcher.markOwn(node);
        this.patcher.connect(node, ctx.destination);
        await node.schedule({ active: true, semitones: this.semitones });

        this.nodes.add(node);
        this.resolvedByCtx.set(ctx, node);
        return node;
    }

    private async loadModule(): Promise<void> {
        if (this.factory) return;
        if (!this.modulePromise) {
            this.modulePromise = (async () => {
                try {
                    this.factory = await SignalsmithStretchConfigurator.create();
                } catch (error) {
                    console.error(
                        "[StretchNodeRegistry] Failed to load SignalsmithStretch module, pitch shifting unavailable:",
                        error
                    );
                    this.factory = null;
                }
            })();
        }
        await this.modulePromise;
    }
}
