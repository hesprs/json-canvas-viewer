import type { GeneralArguments } from '@/declarations';

export const unexpectedError = new Error(
	'[JSONCanvasViewer] This error is unexpected, probably caused by canvas file corruption. If you assure the error is not by accident, please contact the developer and show how to reproduce.',
);
export const destroyError = new Error("[JSONCanvasViewer] Resource hasn't been set up or has been disposed.");

export interface RuntimeJSONCanvasNode extends JSONCanvasNode {
	mdContent?: string;
	mdFrontmatter?: Record<string, string>;
}

export function makeHook<Args extends GeneralArguments = []>() {
	type MatchingFunc = (...args: Args) => unknown;
	type Hook = {
		(...args: Args): void;
		subs: Set<MatchingFunc>;
		subscribe(callback: MatchingFunc): void;
		unsubscribe(callback: MatchingFunc): void;
	};
	const result: Hook = (...args: Args) => {
		result.subs.forEach(callback => {
			callback(...args);
		});
	};
	result.subs = new Set();
	result.subscribe = (callback: MatchingFunc) => {
		result.subs.add(callback);
	};
	result.unsubscribe = (callback: MatchingFunc) => {
		result.subs.delete(callback);
	};
	return result;
}
