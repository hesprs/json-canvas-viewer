import type { GeneralArray } from '$/types';
import type { JSONCanvasNode } from '@repo/shared';

export const destroyError = new Error(
	"[JSONCanvasViewer] Resource hasn't been set up or has been disposed.",
);

export function applyStyles(container: HTMLElement | ShadowRoot, styleString: string) {
	const style = document.createElement('style');
	style.innerHTML = styleString;
	container.appendChild(style);
}

// oxlint-disable-next-line max-params
export function drawRoundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

export function getAnchorCoord(node: JSONCanvasNode, side: 'top' | 'bottom' | 'left' | 'right') {
	const midX = node.x + node.width / 2;
	const midY = node.y + node.height / 2;
	switch (side) {
		case 'top': {
			return { x: midX, y: node.y };
		}
		case 'bottom': {
			return { x: midX, y: node.y + node.height };
		}
		case 'left': {
			return { x: node.x, y: midY };
		}
		case 'right': {
			return { x: node.x + node.width, y: midY };
		}
		default: {
			return { x: midX, y: midY };
		}
	}
}

export function resizeCanvasForDPR(canvas: HTMLCanvasElement, width: number, height: number) {
	const dpr = window.devicePixelRatio ?? 1;
	const ctx = canvas.getContext('2d');
	if (!ctx)
		throw new Error(
			'[JSONCanvasViewer] This error is unexpected, probably caused uncontrollable runtime errors. Please contact the developer and show how to reproduce.',
		);
	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(dpr, dpr);
}

export function round(roundedNum: number, digits: number) {
	const factor = 10 ** digits;
	return Math.round(roundedNum * factor) / factor;
}

type MatchingFunc<Args extends GeneralArray> = (...args: Args) => void | Promise<void>;
export type Hook<Args extends GeneralArray = [], Async extends boolean = false> = {
	(...args: Args): Async extends true ? Promise<void> : void;
	subs: Set<MatchingFunc<Args>>;
	subscribe(callback: MatchingFunc<Args>): void;
	unsubscribe(callback: MatchingFunc<Args>): void;
};

/**
 * A quick function to create a hook that can be subscribed to and unsubscribed from.
 * Pass your arguments as the type parameter
 *
 * @param reverse - Whether the hook should reverse the execution order or not
 * @param async - Whether the hook is async or not
 * @example const hook = makeHook(true);
 */
export function makeHook<Args extends GeneralArray = [], Async extends boolean = false>(
	reverse = false,
	async: Async = false as Async,
) {
	const result = (
		async
			? async (...args: Args) => {
					if (reverse) {
						const items = [...result.subs].reverse();
						for (const callback of items) await callback(...args);
					} else for (const callback of result.subs) await callback(...args);
				}
			: (...args: Args) => {
					if (reverse) {
						const items = [...result.subs].reverse();
						for (const callback of items) void callback(...args);
					} else for (const callback of result.subs) void callback(...args);
				}
	) as Hook<Args, Async>;
	result.subs = new Set();
	result.subscribe = (callback: MatchingFunc<Args>) => {
		result.subs.add(callback);
	};
	result.unsubscribe = (callback: MatchingFunc<Args>) => {
		result.subs.delete(callback);
	};
	return result;
}
