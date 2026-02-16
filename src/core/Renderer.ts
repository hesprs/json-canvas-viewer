import { type BaseArgs, BaseModule, type BaseOptions } from '$/BaseModule';
import Controller from '$/Controller';
import DataManager, { type EdgeItem, type NodeItem } from '$/DataManager';
import StyleManager from '$/StyleManager';
import type { Box } from '$/types';
import utilities, { destroyError } from '$/utilities';

const ARROW_LENGTH = 12;
const ARROW_WIDTH = 4;
const NODE_RADIUS = 12;
const CSS_ZOOM_REDRAW_INTERVAL = 500;
const NODE_BORDER_WIDTH = 2;
const DOT_RADIUS = 1; // Dot radius in CSS pixels
const DOT_BASE_GAP = 10; // Base gap between dots in CSS pixels

const NODE_BORDER_HALF_WIDTH = NODE_BORDER_WIDTH / 2;

interface Options extends BaseOptions {
	zoomInOptimization?: boolean;
}

export default class Renderer extends BaseModule<Options> {
	private _canvas: HTMLCanvasElement | null;
	private ctx: CanvasRenderingContext2D;
	private DM: DataManager;
	private SM: StyleManager;
	private zoomInOptimize: {
		lastDrawnScale: number;
		lastDrawnViewport: Box;
		timeout: NodeJS.Timeout | null;
		lastCallTime: number;
	} = {
		lastDrawnScale: 0,
		lastDrawnViewport: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		},
		timeout: null,
		lastCallTime: 0,
	};

	private get canvas() {
		if (this._canvas === null) throw destroyError;
		return this._canvas;
	}

	constructor(...args: BaseArgs) {
		super(...args);
		const controller = this.container.get(Controller);
		this.SM = this.container.get(StyleManager);
		controller.hooks.onRefresh.subscribe(this.redraw);
		controller.hooks.onResize.subscribe(this.optimizeDPR);
		this.DM = this.container.get(DataManager);
		this._canvas = document.createElement('canvas');
		this._canvas.className = 'main-canvas';
		this.ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
		this.DM.data.container.appendChild(this._canvas);
		this.onDispose(this.dispose);
	}

	private optimizeDPR = () => {
		const container = this.DM.data.container;
		utilities.resizeCanvasForDPR(this.canvas, container.offsetWidth, container.offsetHeight);
	};

	private redraw = () => {
		const offsetX = this.DM.data.offsetX;
		const offsetY = this.DM.data.offsetY;
		const scale = this.DM.data.scale;
		const currentViewport = this.getCurrentViewport(offsetX, offsetY, scale);
		if (!this.options.zoomInOptimization) {
			this.trueRedraw(offsetX, offsetY, scale, currentViewport);
			return;
		}
		if (this.zoomInOptimize.timeout) {
			clearTimeout(this.zoomInOptimize.timeout);
			this.zoomInOptimize.timeout = null;
		}
		const now = Date.now();
		if (
			this.isInside(currentViewport, this.zoomInOptimize.lastDrawnViewport) &&
			scale !== this.zoomInOptimize.lastDrawnScale
		) {
			const timeSinceLast = now - this.zoomInOptimize.lastCallTime;
			if (timeSinceLast < CSS_ZOOM_REDRAW_INTERVAL) {
				this.zoomInOptimize.timeout = setTimeout(() => {
					this.trueRedraw(offsetX, offsetY, scale, currentViewport);
					this.zoomInOptimize.lastCallTime = now;
					this.zoomInOptimize.timeout = null;
				}, 60);
				this.fakeRedraw(currentViewport, scale);
				return;
			}
		}
		this.zoomInOptimize.lastCallTime = now;
		this.trueRedraw(offsetX, offsetY, scale, currentViewport);
	};

	private trueRedraw(offsetX: number, offsetY: number, scale: number, currentViewport: Box) {
		this.zoomInOptimize.lastDrawnViewport = currentViewport;
		this.zoomInOptimize.lastDrawnScale = scale;
		this.canvas.style.transform = '';
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.save();
		this.drawGridDots(scale, offsetX, offsetY);
		this.ctx.translate(offsetX, offsetY);
		this.ctx.scale(scale, scale);
		Object.values(this.DM.data.nodeMap).forEach((item) => {
			if (this.isOutside(item.box, currentViewport)) return;
			const node = item.ref;
			if (node.type === 'file') this.drawFile(item);
			else if (node.type === 'group') this.drawGroup(node, scale);
		});
		Object.values(this.DM.data.edgeMap).forEach((item) => {
			if (this.isOutside(item.box, currentViewport)) return;
			this.drawEdge(item);
		});
		this.ctx.restore();
	}

	private fakeRedraw(currentViewport: Box, scale: number) {
		const cssScale = scale / this.zoomInOptimize.lastDrawnScale;
		const currentOffsetX =
			(this.zoomInOptimize.lastDrawnViewport.left - currentViewport.left) * scale;
		const currentOffsetY =
			(this.zoomInOptimize.lastDrawnViewport.top - currentViewport.top) * scale;
		this.canvas.style.transform = `translate(${currentOffsetX}px, ${currentOffsetY}px) scale(${cssScale})`;
	}

	private isInside = (inner: Box, outer: Box) =>
		inner.left > outer.left &&
		inner.top > outer.top &&
		inner.right < outer.right &&
		inner.bottom < outer.bottom;

	private isOutside = (inner: Box, outer: Box) =>
		inner.right < outer.left ||
		inner.bottom < outer.top ||
		inner.left > outer.right ||
		inner.top > outer.bottom;

	private getCurrentViewport = (offsetX: number, offsetY: number, scale: number) => {
		const left = -offsetX / scale;
		const top = -offsetY / scale;
		const container = this.DM.data.container;
		const right = left + container.clientWidth / scale;
		const bottom = top + container.clientHeight / scale;
		return { left, top, right, bottom };
	};

	private drawLabelBar = (
		x: number,
		y: number,
		label: string,
		color: string,
		textColor: string,
		scale: number,
	) => {
		const barHeight = 30 * scale;
		const radius = 6 * scale;
		const yOffset = 8 * scale;
		const fontSize = 16 * scale;
		const xPadding = 6 * scale;
		this.ctx.save();
		this.ctx.translate(x, y);
		this.ctx.scale(1 / scale, 1 / scale);
		this.ctx.font = `${fontSize}px 'Inter', sans-serif`;
		const barWidth = this.ctx.measureText(label).width + 2 * xPadding;
		this.ctx.translate(0, -barHeight - yOffset);
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(radius, 0);
		this.ctx.lineTo(barWidth - radius, 0);
		this.ctx.quadraticCurveTo(barWidth, 0, barWidth, radius);
		this.ctx.lineTo(barWidth, barHeight - radius);
		this.ctx.quadraticCurveTo(barWidth, barHeight, barWidth - radius, barHeight);
		this.ctx.lineTo(radius, barHeight);
		this.ctx.quadraticCurveTo(0, barHeight, 0, barHeight - radius);
		this.ctx.lineTo(0, radius);
		this.ctx.quadraticCurveTo(0, 0, radius, 0);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.fillStyle = textColor;
		this.ctx.fillText(label, xPadding, barHeight * 0.65);
		this.ctx.restore();
	};

	private drawNodeBackground = (node: JSONCanvasNode) => {
		const colors = this.SM.getColor(node.color);
		const radius = NODE_RADIUS;
		this.ctx.globalAlpha = 1.0;
		this.ctx.fillStyle = colors.background;
		utilities.drawRoundRect(
			this.ctx,
			node.x + NODE_BORDER_HALF_WIDTH,
			node.y + NODE_BORDER_HALF_WIDTH,
			node.width - NODE_BORDER_WIDTH,
			node.height - NODE_BORDER_WIDTH,
			radius,
		);
		this.ctx.fill();
		this.ctx.strokeStyle = colors.border;
		this.ctx.lineWidth = NODE_BORDER_WIDTH;
		utilities.drawRoundRect(this.ctx, node.x, node.y, node.width, node.height, radius);
		this.ctx.stroke();
	};

	private drawGroup = (node: JSONCanvasGroupNode, scale: number) => {
		this.drawNodeBackground(node);
		if (node.label) {
			const color = this.SM.getColor(node.color);
			this.drawLabelBar(node.x, node.y, node.label, color.active, color.text, scale);
		}
	};

	private drawFile = (item: NodeItem) => {
		this.ctx.fillStyle = this.SM.getColor().text;
		const node = item.ref;
		this.ctx.font = '16px sans-serif';
		this.ctx.fillText(item.fileName ?? '', node.x + 5, node.y - 10);
	};

	private drawEdge = (item: EdgeItem) => {
		const edge = item.ref;
		const fromNode = this.DM.data.nodeMap[edge.fromNode].ref;
		const toNode = this.DM.data.nodeMap[edge.toNode].ref;
		const gac = utilities.getAnchorCoord;
		const { x: startX, y: startY } = gac(fromNode, edge.fromSide);
		const { x: endX, y: endY } = gac(toNode, edge.toSide);
		const color = this.SM.getColor(edge.color);
		let [startControlX, startControlY, endControlX, endControlY] = [0, 0, 0, 0];
		if (!item.controlPoints) {
			[startControlX, startControlY, endControlX, endControlY] = this.getControlPoints(
				startX,
				startY,
				endX,
				endY,
				edge.fromSide,
				edge.toSide,
			);
			item.controlPoints = [startControlX, startControlY, endControlX, endControlY];
		} else [startControlX, startControlY, endControlX, endControlY] = item.controlPoints;
		this.drawCurvedPath(
			startX,
			startY,
			endX,
			endY,
			startControlX,
			startControlY,
			endControlX,
			endControlY,
			color.active,
		);
		this.drawArrowhead(endX, endY, endControlX, endControlY, color.active);
		if (edge.label) {
			const t = 0.5;
			const x =
				(1 - t) ** 3 * startX +
				3 * (1 - t) ** 2 * t * startControlX +
				3 * (1 - t) * t * t * endControlX +
				t ** 3 * endX;
			const y =
				(1 - t) ** 3 * startY +
				3 * (1 - t) ** 2 * t * startControlY +
				3 * (1 - t) * t * t * endControlY +
				t ** 3 * endY;
			this.ctx.font = '18px sans-serif';
			const metrics = this.ctx.measureText(edge.label);
			const padding = 8;
			const labelWidth = metrics.width + padding * 2;
			const labelHeight = 20;
			this.ctx.fillStyle = color.active;
			this.ctx.beginPath();
			utilities.drawRoundRect(
				this.ctx,
				x - labelWidth / 2,
				y - labelHeight / 2 - 2,
				labelWidth,
				labelHeight,
				4,
			);
			this.ctx.fill();
			this.ctx.fillStyle = color.text;
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(edge.label, x, y - 2);
			this.ctx.textAlign = 'left';
			this.ctx.textBaseline = 'alphabetic';
		}
	};

	private getControlPoints = (
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		fromSide: string,
		toSide: string,
	) => {
		const distanceX = endX - startX;
		const distanceY = endY - startY;
		const realDistance =
			Math.min(Math.abs(distanceX), Math.abs(distanceY)) +
			0.3 * Math.max(Math.abs(distanceX), Math.abs(distanceY));
		const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
		const PADDING = clamp(realDistance * 0.5, 60, 300);
		let startControlX = startX;
		let startControlY = startY;
		let endControlX = endX;
		let endControlY = endY;
		switch (fromSide) {
			case 'top':
				startControlY = startY - PADDING;
				break;
			case 'bottom':
				startControlY = startY + PADDING;
				break;
			case 'left':
				startControlX = startX - PADDING;
				break;
			case 'right':
				startControlX = startX + PADDING;
				break;
		}
		switch (toSide) {
			case 'top':
				endControlY = endY - PADDING;
				break;
			case 'bottom':
				endControlY = endY + PADDING;
				break;
			case 'left':
				endControlX = endX - PADDING;
				break;
			case 'right':
				endControlX = endX + PADDING;
				break;
		}
		return [startControlX, startControlY, endControlX, endControlY];
	};

	private drawGridDots = (scale: number, offsetX: number, offsetY: number) => {
		const scaleLevel = -Math.floor(Math.log2(scale));
		const actualGap = DOT_BASE_GAP * 2 ** scaleLevel * scale;
		const width = this.canvas.width;
		const height = this.canvas.height;
		const startX = offsetX % actualGap;
		const startY = offsetY % actualGap;
		this.ctx.fillStyle = this.SM.getNamedColor('dots');
		for (let x = startX; x <= width; x += actualGap) {
			for (let y = startY; y <= height; y += actualGap) {
				this.ctx.beginPath();
				this.ctx.arc(x, y, DOT_RADIUS, 0, 2 * Math.PI);
				this.ctx.fill();
			}
		}
	};

	private drawCurvedPath = (
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		c1x: number,
		c1y: number,
		c2x: number,
		c2y: number,
		color: string,
	) => {
		this.ctx.beginPath();
		this.ctx.moveTo(startX, startY);
		this.ctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
	};

	private drawArrowhead = (
		tipX: number,
		tipY: number,
		fromX: number,
		fromY: number,
		color: string,
	) => {
		const dx = tipX - fromX;
		const dy = tipY - fromY;
		const length = Math.sqrt(dx * dx + dy * dy);
		if (length === 0) return;
		const unitX = dx / length;
		const unitY = dy / length;
		const leftX = tipX - unitX * ARROW_LENGTH - unitY * ARROW_WIDTH;
		const leftY = tipY - unitY * ARROW_LENGTH + unitX * ARROW_WIDTH;
		const rightX = tipX - unitX * ARROW_LENGTH + unitY * ARROW_WIDTH;
		const rightY = tipY - unitY * ARROW_LENGTH - unitX * ARROW_WIDTH;
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.moveTo(tipX, tipY);
		this.ctx.lineTo(leftX, leftY);
		this.ctx.lineTo(rightX, rightY);
		this.ctx.closePath();
		this.ctx.fill();
	};

	private dispose = () => {
		if (this.zoomInOptimize.timeout) {
			clearTimeout(this.zoomInOptimize.timeout);
			this.zoomInOptimize.timeout = null;
		}
		this.canvas.remove();
		this._canvas = null;
	};
}
