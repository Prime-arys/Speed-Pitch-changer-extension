import { mainWorlMediaElements } from "@/utils/vars";

declare global {
    interface Document {
        createElement_origin: typeof Document.prototype.createElement;
    }
}

export default function createElementHook() {
    // console.log("createElementHook injected");
    const originalCreateElement = Document.prototype.createElement;
    Document.prototype.createElement_origin = originalCreateElement;
    Document.prototype.createElement = Document.prototype.createElement_origin;

    Document.prototype.createElement = function (tagName: string) {
        //console.log(this, tagName);

        const element = this.createElement_origin(tagName);
        if (
            element instanceof HTMLMediaElement // video, audio, etc.
        ) {
            mainWorlMediaElements.push(element);
        }

        return element;
    };
}
