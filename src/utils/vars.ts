export const mediaElements: HTMLMediaElement[] = []
//export const mainWorlMediaElements: HTMLMediaElement[] = [] // for main world injected scripts

// Callbacks for when new elements are added
const onAddCallbacks: ((element: HTMLMediaElement) => void)[] = [];

export const onMediaElementAdded = (callback: (element: HTMLMediaElement) => void) => {
    onAddCallbacks.push(callback);
};

export const mainWorlMediaElements = new Proxy<HTMLMediaElement[]>([], {
    set(target, prop, value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target[prop as any] = value;
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
            onAddCallbacks.forEach(cb => cb(value));
        }
        return true;
    }
});