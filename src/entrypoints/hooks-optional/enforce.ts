export default function enforceHook() {

    const KEYWORD = Math.random().toString(36).substring(2);

    const originalPlaybackRateDescriptor = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype,
        "playbackRate"
    );

    const originalDefaultPlaybackRateDescriptor =
        Object.getOwnPropertyDescriptor(
            HTMLMediaElement.prototype,
            "defaultPlaybackRate"
        );

    if (
        !originalPlaybackRateDescriptor?.set ||
        !originalPlaybackRateDescriptor?.get ||
        !originalDefaultPlaybackRateDescriptor?.set ||
        !originalDefaultPlaybackRateDescriptor?.get
    ) {
        throw new Error("Could not find original property descriptors");
    }

    // Store in const variables - TypeScript knows these are defined
    const playbackRateSet = originalPlaybackRateDescriptor.set;
    const playbackRateGet = originalPlaybackRateDescriptor.get;
    const defaultPlaybackRateSet = originalDefaultPlaybackRateDescriptor.set;
    const defaultPlaybackRateGet = originalDefaultPlaybackRateDescriptor.get;

    Object.defineProperty(HTMLMediaElement.prototype, "playbackRate", {
        set: function (value) {
            if (typeof value === "object" && value[1] === KEYWORD) {
                playbackRateSet.call(this, value[0]);
            }
        },
        get: playbackRateGet,
    });

    Object.defineProperty(HTMLMediaElement.prototype, "defaultPlaybackRate", {
        set: function (value) {
            if (typeof value === "object" && value[1] === KEYWORD) {
                defaultPlaybackRateSet.call(this, value[0]);
            }
        },
        get: defaultPlaybackRateGet,
    });

    Object.defineProperty(
        HTMLMediaElement.prototype,
        "playbackRate_origin",
        {
            set: function (newRate) {
                // appel de la méthode originale avec les deux paramètres
                //console.log("playbackRate_origin", this, newRate);
                this.playbackRate = [newRate, KEYWORD];
            },
        }
    );

    Object.defineProperty(
        HTMLMediaElement.prototype,
        "defaultPlaybackRate_origin",
        {
            set: function (newRate) {
                this.defaultPlaybackRate = [newRate, KEYWORD];
            },
        }
    );
}
