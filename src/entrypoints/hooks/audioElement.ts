import { mainWorldMediaElements } from "@/utils/vars";

export default function audioElementHook() {
    // let firstPlay = true;
    const originalAudio = Audio;
    // const originalAudioPlay = Audio.prototype.play;
    // const originalAudioPause = Audio.prototype.pause;


    window.Audio = function(this: HTMLAudioElement, src?: string) {
        const audio = new originalAudio(src);
        //console.log("Audio created", audio);
        if (audio instanceof HTMLMediaElement) {
            mainWorldMediaElements.push(audio);
        }
        // Copy properties from audio to this
        Object.setPrototypeOf(this, Object.getPrototypeOf(audio));
        return audio;
    } as unknown as typeof Audio;

/*  window.Audio = function Audio(this: HTMLAudioElement, src?: string) {
        const audio = new originalAudio(src);
        //console.log("Audio created", audio);
        if (audio instanceof HTMLMediaElement) {
            mainWorldMediaElements.push(audio);
        }
        return audio;
    } as unknown as typeof Audio; */


    // Audio.prototype.original_play = originalAudioPlay;
    // Audio.prototype.original_pause = originalAudioPause;

    // Audio.prototype.play = function (...args: unknown[]) {
    //     if (!mainWorldMediaElements.includes(this)) {
    //         mainWorldMediaElements.push(this);
    //     }
        
    //     if (firstPlay == true) {
    //         //console.log("first play");
    //         this.pause();
    //         firstPlay = false;
    //     }
    //     return this.original_play(...args);
    // }


    // Audio.prototype.pause = function (...args: unknown[]) {
    //     //console.log(this)
    //     //verifier si l'element est deja dans le tableau
    //     if (!mainWorldMediaElements.includes(this)) {
    //         mainWorldMediaElements.push(this);
    //     }

    //     if (firstPlay == true) {
    //         //console.log("first play");
    //         this.play();
    //         firstPlay = false;
    //     }

    //     return this.original_pause(...args);
    // }


}

