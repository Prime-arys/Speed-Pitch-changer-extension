import type { Media } from "@/media/Media";
import type { MediaRegistry, Unsubscribe } from "@/media/MediaRegistry";

/**
 * One value applied to every media of the page, now and later.
 *
 * The base class owns the boring half of every effect: following the registry,
 * skipping media the effect cannot act on, doing the one-time setup a media
 * needs, and re-applying the value when it changes. A concrete effect only says
 * *which* media it supports and *what* applying means.
 *
 * @typeParam TValue - what the effect is set to (a rate, a number of semitones).
 * @typeParam TMedia - the media variant it can act on.
 */
export abstract class MediaEffect<TValue, TMedia extends Media = Media> {
    abstract readonly name: string;

    protected value: TValue;

    private readonly registry: MediaRegistry;
    private readonly attached = new WeakSet<Media>();
    private subscriptions: Unsubscribe[] = [];

    constructor(registry: MediaRegistry, initial: TValue) {
        this.registry = registry;
        this.value = initial;
    }

    /** Start applying to every media, the ones already detected included. */
    start(): void {
        if (this.subscriptions.length > 0) return;
        this.subscriptions = [
            this.registry.onAdded((media) => this.applyTo(media)),
            this.registry.onRemoved((media) => this.releaseFrom(media)),
        ];
    }

    /** Stop following the registry and let go of every media. */
    stop(): void {
        this.subscriptions.forEach((unsubscribe) => unsubscribe());
        this.subscriptions = [];
        this.registry.all().forEach((media) => this.releaseFrom(media));
    }

    get(): TValue {
        return this.value;
    }

    /** Set the value and push it to every supported media. */
    set(value: TValue): void {
        this.value = value;
        this.registry.all().forEach((media) => this.applyTo(media));
    }

    /** The media this effect can act on. */
    protected abstract supports(media: Media): media is TMedia;

    /** Push the current value onto a media. Called again on every change. */
    protected abstract apply(media: TMedia, value: TValue): void | Promise<void>;

    /** One-time setup, the first time the effect sees a media. Override when needed. */
    protected attach(media: TMedia): void {
        void media;
    }

    /** Undo whatever {@link attach} and {@link apply} did. Override when needed. */
    protected release(media: TMedia): void {
        void media;
    }

    private applyTo(media: Media): void {
        if (!this.supports(media)) return;

        if (!this.attached.has(media)) {
            this.attached.add(media);
            this.guard(() => this.attach(media));
        }
        this.guard(() => this.apply(media, this.value));
    }

    private releaseFrom(media: Media): void {
        if (!this.supports(media) || !this.attached.has(media)) return;
        this.attached.delete(media);
        this.guard(() => this.release(media));
    }

    private guard(run: () => void | Promise<void>): void {
        try {
            const result = run();
            if (result instanceof Promise) result.catch((error) => this.fail(error));
        } catch (error) {
            this.fail(error);
        }
    }

    private fail(error: unknown): void {
        console.error(`[${this.name}] could not be applied`, error);
    }
}
