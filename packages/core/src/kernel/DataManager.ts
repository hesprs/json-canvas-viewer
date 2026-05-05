import type { BaseOptions } from '$';
import type { BaseArgs } from '$/BaseModule';
import type { Box, NodeBounds } from '$/types';
import type { Hook } from '$/utilities';
import type { JSONCanvas, JSONCanvasEdge, JSONCanvasNode } from '@repo/shared';
import { BaseModule } from '$/BaseModule';
import style from '$/styles.scss?inline';
import { applyStyles, getAnchorCoord, makeHook } from '$/utilities';

const INITIAL_VIEWPORT_PADDING = 100;
const NODE_LABEL_MARGIN = 40;
const EDGE_BOX_HEURISTICS_BASE_MARGIN = 10;

type Options = {
	shadowed?: boolean;
	canvas?: JSONCanvas;
	attachmentDir?: string;
	extraCSS?: string;
	attachments?: Record<string, string>;
	noAttachmentRelocation?: boolean;
} & BaseOptions;

type Augmentation = {
	resetView: DataManager['resetView'];
	toggleFullscreen: DataManager['toggleFullscreen'];
	onToggleFullscreen: DataManager['onToggleFullscreen'];
};

export type NodeItem = {
	ref: JSONCanvasNode;
	box: Box;
	fileName?: string;
	onBeforeUnmount?: Hook;
	onActive?: Hook;
	onLoseActive?: Hook;
};

export type EdgeItem = {
	ref: JSONCanvasEdge;
	box: Box;
	controlPoints?: Array<number>;
};

type NodeMap = Record<string, NodeItem>;
type EdgeMap = Record<string, EdgeItem>;

export default class DataManager extends BaseModule<Options, Augmentation> {
	onToggleFullscreen = makeHook<['enter' | 'exit']>();

	data: {
		canvasData: Required<JSONCanvas>;
		nodeMap: NodeMap;
		edgeMap: EdgeMap;
		canvasBaseDir: string;
		nodeBounds: NodeBounds;
		offsetX: number;
		offsetY: number;
		scale: number;
		container: HTMLDivElement;
	} = {
		canvasBaseDir: './',
		canvasData: {
			edges: [],
			nodes: [],
		},
		container: document.createElement('div'),
		edgeMap: {},
		nodeBounds: {
			centerX: 0,
			centerY: 0,
			height: 0,
			maxX: 0,
			maxY: 0,
			minX: 0,
			minY: 0,
			width: 0,
		},
		nodeMap: {},
		offsetX: 0,
		offsetY: 0,
		scale: 1,
	};

	constructor(...args: BaseArgs) {
		super(...args);
		const viewerContainer = this.options.container;
		while (viewerContainer.firstElementChild) viewerContainer.firstElementChild.remove();
		viewerContainer.innerHTML = '';

		const realContainer = this.options.shadowed
			? viewerContainer.attachShadow({ mode: 'open' })
			: viewerContainer;

		applyStyles(realContainer, style + this.options.extraCSS);

		this.data.container.classList.add('JSON-Canvas-Viewer');
		realContainer.appendChild(this.data.container);

		this.augment({
			onToggleFullscreen: this.onToggleFullscreen,
			resetView: this.resetView,
			toggleFullscreen: this.toggleFullscreen,
		});
		this.onStart(this.start);
		this.onRestart(this.start);
		this.onDispose(this.dispose);
	}

	private readonly start = () => {
		const canvasData = {
			edges: [],
			nodes: [],
			...this.options.canvas,
		};

		Object.assign(this.data, {
			canvasBaseDir: this.processBaseDir(this.options.attachmentDir),
			canvasData,
			edgeMap: {},
			nodeBounds: this.calculateNodeBounds(canvasData),
			nodeMap: {},
			offsetX: 0,
			offsetY: 0,
			scale: 1,
		});

		this.data.canvasData.nodes.forEach((node) => {
			const item: NodeItem = {
				box: this.getNodeBox(node),
				ref: node,
			};
			this.data.nodeMap[node.id] = item;

			// Re-process attachments
			if (node.type === 'file') {
				const path = node.file.split('/');
				const fileName = path.pop() ?? '';
				item.fileName = fileName;
				if (!node.file.startsWith('http://') && !node.file.startsWith('https://')) {
					const userDefinedAttachment = this.options.attachments?.[fileName];
					if (userDefinedAttachment) node.file = userDefinedAttachment;
					else if (!this.options.noAttachmentRelocation)
						node.file = this.data.canvasBaseDir + fileName;
				}
			}
		});
		this.data.canvasData.edges.forEach((edge) => {
			this.data.edgeMap[edge.id] = {
				box: this.getEdgeBox(edge),
				ref: edge,
			};
		});
		this.resetView();
	};

	private readonly processBaseDir = (baseDir: string | undefined) => {
		if (!baseDir) return './';
		const lastChar = baseDir?.slice(-1);
		if (lastChar === '/') return baseDir;
		return `${baseDir}/`;
	};

	private readonly getNodeBox = (node: JSONCanvasNode) => ({
		bottom: node.y + node.height,
		left: node.x,
		right: node.width + node.x,
		top: node.type === 'file' || node.type === 'group' ? node.y - NODE_LABEL_MARGIN : node.y,
	});

	private readonly getEdgeBox = (edge: JSONCanvasEdge) => {
		const nodes = this.data.nodeMap;
		const from = nodes[edge.fromNode].ref;
		const to = nodes[edge.toNode].ref;
		const fromAnchor = getAnchorCoord(from, edge.fromSide);
		const toAnchor = getAnchorCoord(to, edge.toSide);
		const strictBox = {
			bottom: Math.max(fromAnchor.y, toAnchor.y),
			left: Math.min(fromAnchor.x, toAnchor.x),
			right: Math.max(fromAnchor.x, toAnchor.x),
			top: Math.min(fromAnchor.y, toAnchor.y),
		};
		// Edge size heuristics
		const width = strictBox.right - strictBox.left;
		const height = strictBox.bottom - strictBox.top;
		const _min = Math.min(width, height);
		const min = _min === 0 ? 1 : _min;
		const max = Math.max(width, height);
		const edgeFactor = Math.log2(max / min);
		const margin = edgeFactor * EDGE_BOX_HEURISTICS_BASE_MARGIN;
		return {
			bottom: strictBox.bottom + margin,
			left: strictBox.left - margin,
			right: strictBox.right + margin,
			top: strictBox.top - margin,
		};
	};

	private calculateNodeBounds(canvasData: Required<JSONCanvas>) {
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		canvasData.nodes.forEach((node) => {
			minX = Math.min(minX, node.x);
			minY = Math.min(minY, node.y);
			maxX = Math.max(maxX, node.x + node.width);
			maxY = Math.max(maxY, node.y + node.height);
		});
		const width = maxX - minX;
		const height = maxY - minY;
		const centerX = minX + width / 2;
		const centerY = minY + height / 2;
		return { centerX, centerY, height, maxX, maxY, minX, minY, width };
	}
	toggleFullscreen = async (option?: 'enter' | 'exit') => {
		if (!document.fullscreenElement && (!option || option === 'enter')) {
			await this.data.container.requestFullscreen();
			this.onToggleFullscreen('enter');
		} else if (document.fullscreenElement && (!option || option === 'exit')) {
			await document.exitFullscreen();
			this.onToggleFullscreen('exit');
		}
	};
	resetView = () => {
		const bounds = this.data.nodeBounds;
		const container = this.data.container;
		if (!bounds || !container) return;
		const contentWidth = bounds.width + INITIAL_VIEWPORT_PADDING * 2;
		const contentHeight = bounds.height + INITIAL_VIEWPORT_PADDING * 2;
		// Use logical dimensions for scaling calculations
		const viewWidth = container.clientWidth;
		const viewHeight = container.clientHeight;
		const scaleX = viewWidth / contentWidth;
		const scaleY = viewHeight / contentHeight;
		const newScale = Math.round(Math.min(scaleX, scaleY) * 1000) / 1000;
		const contentCenterX = bounds.centerX;
		const contentCenterY = bounds.centerY;
		const initialView = {
			offsetX: viewWidth / 2 - contentCenterX * newScale,
			offsetY: viewHeight / 2 - contentCenterY * newScale,
			scale: newScale,
		};
		this.data.offsetX = initialView.offsetX;
		this.data.offsetY = initialView.offsetY;
		this.data.scale = initialView.scale;
	};

	middleViewer = () => {
		const container = this.data.container;
		return {
			height: container.clientHeight,
			width: container.clientWidth,
			x: container.clientWidth / 2,
			y: container.clientHeight / 2,
		};
	};

	private readonly dispose = () => {
		this.data.container.remove();
	};
}
