import {
	mainWorldAudioContexts,
	MEDIA_ELEMENT_SOURCE_NODE_KEY,
	MEDIA_ELEMENT_SOURCE_OWNER_KEY,
	SOURCE_NODE_CONNECTIONS_KEY,
	type SourceNodeConnection,
} from "@/utils/vars";

const PATCHED_KEY = Symbol.for("speedPitchChangerAudioContextPatched");
const NODE_PATCHED_KEY = Symbol.for("speedPitchChangerAudioNodePatched");

interface MediaElementWithSource extends HTMLMediaElement {
	[MEDIA_ELEMENT_SOURCE_NODE_KEY]?: MediaElementAudioSourceNode;
	[MEDIA_ELEMENT_SOURCE_OWNER_KEY]?: "extension" | "page";
}

interface MediaElementSourceNodeWithConnections
	extends MediaElementAudioSourceNode {
	[SOURCE_NODE_CONNECTIONS_KEY]?: SourceNodeConnection[];
}

const isMediaElementSourceNode = (
	value: unknown
): value is MediaElementSourceNodeWithConnections =>
	value instanceof MediaElementAudioSourceNode;

const recordSourceConnection = (
	sourceNode: MediaElementSourceNodeWithConnections,
	connection: SourceNodeConnection
): void => {
	const connections = sourceNode[SOURCE_NODE_CONNECTIONS_KEY] ?? [];
	const exists = connections.some(
		(entry) =>
			entry.destination === connection.destination &&
			entry.output === connection.output &&
			entry.input === connection.input
	);
	if (!exists) {
		connections.push(connection);
	}
	sourceNode[SOURCE_NODE_CONNECTIONS_KEY] = connections;
};

const removeSourceConnections = (
	sourceNode: MediaElementSourceNodeWithConnections,
	args: unknown[]
): void => {
	const connections = sourceNode[SOURCE_NODE_CONNECTIONS_KEY];
	if (!connections || connections.length === 0) return;

	if (args.length === 0) {
		sourceNode[SOURCE_NODE_CONNECTIONS_KEY] = [];
		return;
	}

	if (typeof args[0] === "number") {
		const output = args[0];
		sourceNode[SOURCE_NODE_CONNECTIONS_KEY] = connections.filter(
			(entry) => entry.output !== output
		);
		return;
	}

	const destination = args[0] as AudioNode | AudioParam;
	const output = typeof args[1] === "number" ? args[1] : undefined;
	const input = typeof args[2] === "number" ? args[2] : undefined;

	sourceNode[SOURCE_NODE_CONNECTIONS_KEY] = connections.filter((entry) => {
		if (entry.destination !== destination) return true;
		if (output !== undefined && entry.output !== output) return true;
		if (input !== undefined && entry.input !== input) return true;
		return false;
	});
};

function patchNodePrototype(): void {
	const proto = AudioNode.prototype as AudioNode & {
		[NODE_PATCHED_KEY]?: boolean;
	};
	if (proto[NODE_PATCHED_KEY]) return;

	const originalConnect = proto.connect;
	const originalDisconnect = proto.disconnect;

	proto.connect = function (this: AudioNode, ...args: unknown[]) {
		const result = originalConnect.apply(this, args as never);
		if (isMediaElementSourceNode(this) && args.length > 0) {
			const destination = args[0] as AudioNode | AudioParam;
			const output = typeof args[1] === "number" ? args[1] : undefined;
			const input =
				destination instanceof AudioNode &&
				args.length > 2 &&
				typeof args[2] === "number"
					? args[2]
					: undefined;
			recordSourceConnection(this, {
				destination,
				output,
				input,
			});
		}
		return result;
	} as AudioNode["connect"];

	proto.disconnect = function (this: AudioNode, ...args: unknown[]) {
		if (isMediaElementSourceNode(this)) {
			removeSourceConnections(this, args);
		}
		return originalDisconnect.apply(this, args as never);
	} as AudioNode["disconnect"];

	proto[NODE_PATCHED_KEY] = true;
}

function patchContextPrototype(
	ContextCtor: typeof AudioContext | undefined
): void {
	if (!ContextCtor) return;

	const proto = ContextCtor.prototype as AudioContext & {
		[PATCHED_KEY]?: boolean;
	};
	if (proto[PATCHED_KEY]) {
		return;
	}

	const originalCreateMediaElementSource = proto.createMediaElementSource;
	if (typeof originalCreateMediaElementSource !== "function") {
		return;
	}

	proto.createMediaElementSource = function (
		this: AudioContext,
		element: HTMLMediaElement
	) {
		const sourceNode = originalCreateMediaElementSource.call(this, element);
		const mediaEl = element as MediaElementWithSource;

		if (!mediaEl[MEDIA_ELEMENT_SOURCE_NODE_KEY]) {
			mediaEl[MEDIA_ELEMENT_SOURCE_NODE_KEY] = sourceNode;
			mediaEl[MEDIA_ELEMENT_SOURCE_OWNER_KEY] = "page";
		}

		if (!mainWorldAudioContexts.includes(this)) {
			mainWorldAudioContexts.push(this);
		}

		return sourceNode;
	};

	proto[PATCHED_KEY] = true;
}

export default function audioContextHook(): void {
	patchNodePrototype();
	patchContextPrototype(window.AudioContext);
	patchContextPrototype(
		(window as Window & { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext
	);
}
