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

type HookMatchingFunc<Args extends GeneralArray> = (...args: Args) => void;
export type Hook<Args extends GeneralArray = []> = {
	(...args: Args): void;
	subs: Set<HookMatchingFunc<Args>>;
	subscribe(callback: HookMatchingFunc<Args>): () => void;
	unsubscribe(callback: HookMatchingFunc<Args>): void;
};

export function hook<Args extends GeneralArray = []>(reverse = false): Hook<Args> {
	const result: Hook<Args> = (...args: Args) => {
		const subs = result.subs.values().toArray();
		for (const callback of reverse ? subs : subs.toReversed()) callback(...args);
	};
	result.subs = new Set();
	result.subscribe = (callback: HookMatchingFunc<Args>) => {
		result.subs.add(callback);
		return () => result.unsubscribe(callback);
	};
	result.unsubscribe = (callback: HookMatchingFunc<Args>) => {
		result.subs.delete(callback);
	};
	return result;
}
