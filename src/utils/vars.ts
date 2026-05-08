export const MEDIA_ELEMENT_SOURCE_NODE_KEY = Symbol.for(
    "speedPitchChangerMediaElementSourceNode"
);
export const MEDIA_ELEMENT_SOURCE_OWNER_KEY = Symbol.for(
    "speedPitchChangerMediaElementSourceOwner"
);
export const SOURCE_NODE_CONNECTIONS_KEY = Symbol.for(
    "speedPitchChangerSourceNodeConnections"
);
export type MediaElementSourceOwner = "extension" | "page";
export type SourceNodeConnection = {
    destination: AudioNode | AudioParam;
    output?: number;
    input?: number;
};

// Callbacks for when new elements are added
const onMediaElementAddCallbacks: ((element: HTMLMediaElement) => void)[] = [];
const onAudioContextAddCallbacks: ((context: AudioContext) => void)[] = [];

export const onMediaElementAdded = (callback: (element: HTMLMediaElement) => void) => {
    onMediaElementAddCallbacks.push(callback);
};

export const onAudioContextAdded = (callback: (context: AudioContext) => void) => {
    onAudioContextAddCallbacks.push(callback);
};

export const mainWorldMediaElements = new Proxy<HTMLMediaElement[]>([], {
    set(target, prop, value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target[prop as any] = value;
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
            onMediaElementAddCallbacks.forEach(cb => cb(value));
        }
        return true;
    }
});

export const mainWorldAudioContexts = new Proxy<AudioContext[]>([], {
    set(target, prop, value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target[prop as any] = value
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
            onAudioContextAddCallbacks.forEach(cb => cb(value));
        }
        return true;
    }
});
