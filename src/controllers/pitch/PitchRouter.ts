import { AudioGraphPatcher } from "./AudioGraphPatcher";
import { PitchNodeRegistry } from "./PitchNodeRegistry";

/**
 * A recorded connection from some node to its context's `destination`.
 * `wet` tracks whether it is currently routed through the pitch node.
 */
interface DestConnection {
    node: AudioNode;
    ctx: AudioContext;
    dest: AudioNode;
    wet: boolean;
}

/**
 * Tracks every `node -> destination` connection and keeps each one routed to
 * match the engaged state: wet (`node -> pitch node -> destination`) when
 * pitch is engaged, dry (`node -> destination`) otherwise.
 */
export class PitchRouter {
    private connections = new Set<DestConnection>();
    private byNode = new WeakMap<AudioNode, Set<DestConnection>>();

    constructor(
        private patcher: AudioGraphPatcher,
        private registry: PitchNodeRegistry,
        private isEngaged: () => boolean
    ) {}

    /** Record a connection (or refresh an existing one) and route it. */
    track(node: AudioNode, ctx: AudioContext, dest: AudioNode): void {
        const existing = this.byNode.get(node);
        if (existing) {
            for (const conn of existing) {
                if (conn.dest === dest) {
                    this.reconcile(conn);
                    return;
                }
            }
        }

        const conn: DestConnection = { node, ctx, dest, wet: false };
        this.connections.add(conn);
        let set = this.byNode.get(node);
        if (!set) {
            set = new Set();
            this.byNode.set(node, set);
        }
        set.add(conn);

        // Transient sources (e.g. Spotify's per-note buffer sources) self-prune.
        if (node instanceof AudioScheduledSourceNode) {
            node.addEventListener("ended", () => this.untrack(node), {
                once: true,
            });
        }

        this.reconcile(conn);
    }

    /** Drop a node's records (the page disconnected it, or it ended). */
    untrack(node: AudioNode): void {
        const set = this.byNode.get(node);
        if (!set) return;
        for (const conn of set) this.connections.delete(conn);
        this.byNode.delete(node);
    }

    /** Re-evaluate every connection, e.g. after the engaged state flips. */
    reconcileAll(): void {
        this.connections.forEach((conn) => this.reconcile(conn));
    }

    private reconcile(conn: DestConnection): void {
        if (this.isEngaged() && !conn.wet) {
            conn.wet = true; // optimistic; prevents duplicate rerouting
            this.registry
                .ensure(conn.ctx)
                .then((handle) => this.routeWet(conn, handle.node))
                .catch(() => {
                    conn.wet = false;
                });
        } else if (!this.isEngaged() && conn.wet) {
            conn.wet = false;
            this.routeDry(conn);
        }
    }

    private routeWet(conn: DestConnection, pitchNode: AudioNode): void {
        try {
            this.patcher.connect(conn.node, pitchNode);
        } catch {
            conn.wet = false;
            return;
        }
        // Remove the dry path now that the wet one is live.
        try {
            this.patcher.disconnect(conn.node, conn.dest);
        } catch {
            /* already disconnected */
        }
    }

    private routeDry(conn: DestConnection): void {
        const pitchNode = this.registry.get(conn.ctx);
        try {
            this.patcher.connect(conn.node, conn.dest);
        } catch {
            /* ignore */
        }
        if (pitchNode) {
            try {
                this.patcher.disconnect(conn.node, pitchNode);
            } catch {
                /* ignore */
            }
        }
    }
}
