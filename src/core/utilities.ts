import type { GeneralArguments } from '$/declarations';

export default {
	round,
	resizeCanvasForDPR,
	applyStyles,
	drawRoundRect,
	getAnchorCoord,
	makeHook,
};

export const destroyError = new Error(
	"[JSONCanvasViewer] Resource hasn't been set up or has been disposed.",
);

function applyStyles(container: HTMLElement | ShadowRoot, styleString: string) {
	const style = document.createElement('style');
	style.innerHTML = styleString;
	container.appendChild(style);
}

function drawRoundRect(
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

function getAnchorCoord(node: JSONCanvasNode, side: 'top' | 'bottom' | 'left' | 'right') {
	const midX = node.x + node.width / 2;
	const midY = node.y + node.height / 2;
	switch (side) {
		case 'top':
			return { x: midX, y: node.y };
		case 'bottom':
			return { x: midX, y: node.y + node.height };
		case 'left':
			return { x: node.x, y: midY };
		case 'right':
			return { x: node.x + node.width, y: midY };
		default:
			return { x: midX, y: midY };
	}
}

function resizeCanvasForDPR(canvas: HTMLCanvasElement, width: number, height: number) {
	const dpr = window.devicePixelRatio || 1;
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

function round(roundedNum: number, digits: number) {
	const factor = 10 ** digits;
	return Math.round(roundedNum * factor) / factor;
}

function makeHook<Args extends GeneralArguments = []>(reverse: boolean = false) {
	type MatchingFunc = (...args: Args) => unknown;
	type Hook = {
		(...args: Args): void;
		subs: Set<MatchingFunc>;
		subscribe(callback: MatchingFunc): void;
		unsubscribe(callback: MatchingFunc): void;
	};
	const result: Hook = (...args: Args) => {
		if (reverse) {
			const items = Array.from(result.subs).reverse();
			items.forEach((callback) => {
				callback(...args);
			});
		} else
			result.subs.forEach((callback) => {
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
