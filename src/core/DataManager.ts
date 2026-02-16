import { type BaseArgs, BaseModule, type BaseOptions } from '$/BaseModule';
import style from '$/styles.scss?inline';
import type { Box, NodeBounds } from '$/types';
import utilities from '$/utilities';

const INITIAL_VIEWPORT_PADDING = 100;
const NODE_LABEL_MARGIN = 40;
const EDGE_BOX_HEURISTICS_BASE_MARGIN = 10;

interface Options extends BaseOptions {
	noShadow?: boolean;
	canvas?: JSONCanvas;
	attachmentDir?: string;
	extraCSS?: string;
}

interface Augmentation {
	resetView: DataManager['resetView'];
	shiftFullscreen: DataManager['shiftFullscreen'];
}

export interface NodeItem {
	ref: JSONCanvasNode;
	box: Box;
	fileName?: string;
}

export interface EdgeItem {
	ref: JSONCanvasEdge;
	box: Box;
	controlPoints?: Array<number>;
}

type NodeMap = Record<string, NodeItem>;
type EdgeMap = Record<string, EdgeItem>;

export default class DataManager extends BaseModule<Options, Augmentation> {
	onToggleFullscreen = utilities.makeHook<[boolean]>();

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
		canvasData: {
			nodes: [],
			edges: [],
		},
		nodeMap: {},
		edgeMap: {},
		canvasBaseDir: './',
		nodeBounds: {
			maxX: 0,
			maxY: 0,
			minX: 0,
			minY: 0,
			width: 0,
			height: 0,
			centerX: 0,
			centerY: 0,
		},
		offsetX: 0,
		offsetY: 0,
		scale: 1,
		container: document.createElement('div'),
	};

	constructor(...args: BaseArgs) {
		super(...args);
		const viewerContainer = this.options.container;
		while (viewerContainer.firstElementChild) viewerContainer.firstElementChild.remove();
		viewerContainer.innerHTML = '';

		const noShadow = this.options.noShadow ?? false;
		const realContainer = noShadow
			? viewerContainer
			: viewerContainer.attachShadow({ mode: 'open' });

		utilities.applyStyles(realContainer, style + this.options.extraCSS);

		this.data.container.classList.add('container');
		realContainer.appendChild(this.data.container);

		this.augment({
			resetView: this.resetView,
			shiftFullscreen: this.shiftFullscreen,
		});
		this.onStart(this.start);
		this.onRestart(this.start);
		this.onDispose(this.dispose);
	}

	private start = () => {
		const canvasData = Object.assign(
			{
				nodes: [],
				edges: [],
			},
			this.options.canvas,
		);

		Object.assign(this.data, {
			canvasData: canvasData,
			nodeMap: {},
			edgeMap: {},
			canvasBaseDir: this.processBaseDir(this.options.attachmentDir),
			nodeBounds: this.calculateNodeBounds(canvasData),
			offsetX: 0,
			offsetY: 0,
			scale: 1,
		});

		this.data.canvasData.nodes.forEach((node) => {
			const item: NodeItem = {
				ref: node,
				box: this.getNodeBox(node),
			};
			this.data.nodeMap[node.id] = item;
			if (node.type === 'file') {
				const path = node.file.split('/');
				const fileName = path.pop() ?? '';
				item.fileName = fileName;
				if (!node.file.startsWith('http://') && !node.file.startsWith('https://'))
					node.file = this.data.canvasBaseDir + fileName;
			}
		});
		this.data.canvasData.edges.forEach((edge) => {
			this.data.edgeMap[edge.id] = {
				ref: edge,
				box: this.getEdgeBox(edge),
			};
		});
		this.resetView();
	};

	private processBaseDir = (baseDir: string | undefined) => {
		if (!baseDir) return './';
		const lastChar = baseDir?.slice(-1);
		if (lastChar === '/') return baseDir;
		return `${baseDir}/`;
	};

	private getNodeBox = (node: JSONCanvasNode) => {
		return {
			left: node.x,
			top:
				node.type === 'file' || node.type === 'group' ? node.y - NODE_LABEL_MARGIN : node.y,
			right: node.width + node.x,
			bottom: node.y + node.height,
		};
	};

	private getEdgeBox = (edge: JSONCanvasEdge) => {
		const nodes = this.data.nodeMap;
		const from = nodes[edge.fromNode].ref;
		const to = nodes[edge.toNode].ref;
		const fromAnchor = utilities.getAnchorCoord(from, edge.fromSide);
		const toAnchor = utilities.getAnchorCoord(to, edge.toSide);
		const strictBox = {
			left: Math.min(fromAnchor.x, toAnchor.x),
			top: Math.min(fromAnchor.y, toAnchor.y),
			right: Math.max(fromAnchor.x, toAnchor.x),
			bottom: Math.max(fromAnchor.y, toAnchor.y),
		};
		// edge size heuristics
		const width = strictBox.right - strictBox.left;
		const height = strictBox.bottom - strictBox.top;
		const _min = Math.min(width, height);
		const min = _min === 0 ? 1 : _min;
		const max = Math.max(width, height);
		const edgeFactor = Math.log2(max / min);
		const margin = edgeFactor * EDGE_BOX_HEURISTICS_BASE_MARGIN;
		return {
			left: strictBox.left - margin,
			top: strictBox.top - margin,
			right: strictBox.right + margin,
			bottom: strictBox.bottom + margin,
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
		return { minX, minY, maxX, maxY, width, height, centerX, centerY };
	}
	shiftFullscreen = async (option?: 'enter' | 'exit') => {
		if (!document.fullscreenElement && (!option || option === 'enter')) {
			await this.data.container.requestFullscreen();
			this.onToggleFullscreen(true);
		} else if (document.fullscreenElement && (!option || option === 'exit')) {
			await document.exitFullscreen();
			this.onToggleFullscreen(false);
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
			scale: newScale,
			offsetX: viewWidth / 2 - contentCenterX * newScale,
			offsetY: viewHeight / 2 - contentCenterY * newScale,
		};
		this.data.offsetX = initialView.offsetX;
		this.data.offsetY = initialView.offsetY;
		this.data.scale = initialView.scale;
	};

	middleViewer = () => {
		const container = this.data.container;
		return {
			x: container.clientWidth / 2,
			y: container.clientHeight / 2,
			width: container.clientWidth,
			height: container.clientHeight,
		};
	};

	private dispose = () => this.data.container.remove();
}
