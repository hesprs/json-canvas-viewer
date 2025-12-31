import type { GeneralArguments } from '@/declarations';

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
