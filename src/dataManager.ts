import { type BaseArgs, BaseModule } from '@/baseModule';
import type { Coordinates, NodeBounds } from '@/declarations';
import style from '@/styles.scss?inline';
import utilities from '@/utilities';

const GRID_CELL_SIZE = 800;
const INITIAL_VIEWPORT_PADDING = 100;

type Options = {
	noShadow?: boolean;
	canvas: {
		data: JSONCanvas;
		attachmentBaseDir?: string;
	};
};

export default class DataManager extends BaseModule<Options> {
	private spatialGrid: Record<string, Array<JSONCanvasNode>> | null = null;
	onToggleFullscreen = utilities.makeHook<[boolean]>();

	data: {
		canvasData: Required<JSONCanvas>;
		nodeMap: Record<string, JSONCanvasNode>;
		canvasBaseDir: string;
		nodeBounds: NodeBounds;
		offsetX: number;
		offsetY: number;
		scale: number;
		container: HTMLDivElement;
	};

	constructor(...args: BaseArgs) {
		super(...args);
		const parentContainer = this.options.container;
		while (parentContainer.firstElementChild) parentContainer.firstElementChild.remove();
		parentContainer.innerHTML = '';

		const noShadow = this.options.noShadow || false;
		const realContainer = noShadow ? parentContainer : parentContainer.attachShadow({ mode: 'open' });

		utilities.applyStyles(realContainer, style);

		const HTMLContainer = document.createElement('div');
		HTMLContainer.classList.add('container');
		realContainer.appendChild(HTMLContainer);
		const canvasData = Object.assign(
			{
				nodes: [],
				edges: [],
			},
			this.options.canvas.data,
		);

		this.data = {
			canvasData: canvasData,
			nodeMap: {},
			canvasBaseDir: this.processBaseDir(this.options.canvas.attachmentBaseDir),
			nodeBounds: this.calculateNodeBounds(canvasData),
			offsetX: 0,
			offsetY: 0,
			scale: 1,
			container: HTMLContainer,
		};

		this.data.canvasData.nodes.forEach(node => {
			if (node.type === 'file' && !node.file.includes('http')) {
				const file = node.file.split('/');
				node.file = file[file.length - 1];
			}
			this.data.nodeMap[node.id] = node;
		});

		this.buildSpatialGrid();
		this.resetView();
		this.onDispose(this.dispose);
	}

	private processBaseDir = (baseDir: string | undefined) => {
		if (!baseDir) return './';
		const lastChar = baseDir?.slice(-1);
		if (lastChar === '/') return baseDir;
		return `${baseDir}/`;
	};

	findNodeAt = (screenCoords: Coordinates) => {
		const { x, y } = this.C2W(this.C2C({ x: screenCoords.x, y: screenCoords.y }));
		let candidates: Array<JSONCanvasNode> = [];
		if (!this.spatialGrid) candidates = this.data.canvasData.nodes;
		else {
			const col = Math.floor(x / GRID_CELL_SIZE);
			const row = Math.floor(y / GRID_CELL_SIZE);
			const key = `${col},${row}`;
			candidates = this.spatialGrid[key] || [];
		}
		for (const node of candidates) {
			if (
				x < node.x ||
				x > node.x + node.width ||
				y < node.y ||
				y > node.y + node.height ||
				this.judgeInteract(node) === 'non-interactive'
			)
				continue;
			return node;
		}
		return null;
	};

	// how should the app handle node interactions
	private judgeInteract = (node: JSONCanvasNode | null) => {
		switch (node?.type) {
			case 'text':
			case 'link':
				return 'select';
			case 'file': {
				if (node.file.match(/\.(md|wav|mp3)$/i)) return 'select';
				else return 'non-interactive';
			}
			default:
				return 'non-interactive';
		}
	};

	private calculateNodeBounds(canvasData: Required<JSONCanvas>) {
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		canvasData.nodes.forEach(node => {
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

	private buildSpatialGrid() {
		const canvasData = this.data.canvasData;
		if (canvasData.nodes.length < 50) return;
		this.spatialGrid = {};
		for (const node of canvasData.nodes) {
			const minCol = Math.floor(node.x / GRID_CELL_SIZE);
			const maxCol = Math.floor((node.x + node.width) / GRID_CELL_SIZE);
			const minRow = Math.floor(node.y / GRID_CELL_SIZE);
			const maxRow = Math.floor((node.y + node.height) / GRID_CELL_SIZE);
			for (let col = minCol; col <= maxCol; col++) {
				for (let row = minRow; row <= maxRow; row++) {
					const key = `${col},${row}`;
					if (!this.spatialGrid[key]) this.spatialGrid[key] = [];
					this.spatialGrid[key].push(node);
				}
			}
		}
	}

	zoom = (factor: number, origin: Coordinates) => {
		const newScale = this.data.scale * factor;
		this.zoomToScale(newScale, origin);
	};
	zoomToScale = (newScale: number, origin: Coordinates) => {
		const validNewScale = Math.max(Math.min(newScale, 20), 0.05);
		const scale = this.data.scale;
		if (validNewScale === scale) return;
		const canvasCoords = this.C2C(origin);
		this.data.offsetX = origin.x - (canvasCoords.x * validNewScale) / scale;
		this.data.offsetY = origin.y - (canvasCoords.y * validNewScale) / scale;
		this.data.scale = validNewScale;
	};
	pan = ({ x, y }: Coordinates) => {
		this.data.offsetX = this.data.offsetX + x;
		this.data.offsetY = this.data.offsetY + y;
	};
	panToCoords = ({ x, y }: Coordinates) => {
		this.data.offsetX = x;
		this.data.offsetY = y;
	};
	shiftFullscreen = (option: string = 'toggle') => {
		if (!document.fullscreenElement && (option === 'toggle' || option === 'enter')) {
			this.data.container.requestFullscreen();
			this.onToggleFullscreen(true);
		} else if (document.fullscreenElement && (option === 'toggle' || option === 'exit')) {
			document.exitFullscreen();
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

	// Container to Canvas
	private C2C = ({ x: containerX, y: containerY }: Coordinates) => ({
		x: containerX - this.data.offsetX,
		y: containerY - this.data.offsetY,
	});
	// Canvas to World
	private C2W = ({ x: canvasX, y: canvasY }: Coordinates) => ({
		x: canvasX / this.data.scale,
		y: canvasY / this.data.scale,
	});

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
