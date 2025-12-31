import type { Container } from '@needle-di/core';
import DataManager from '@/dataManager';
import { makeHook } from '@/utilityFunctions';
import { OptionsToken } from './canvasViewer';
import style from './styles.scss?inline';
import { UtilitiesToken, type utilities } from './utilities';

export default class Controller {
	private animationId: null | number = null;
	private resizeAnimationId: null | number = null;
	private utilities: typeof utilities;
	private DM: DataManager;
	private perFrame: {
		lastScale: number;
		lastOffsets: { x: number; y: number };
	} = {
		lastScale: 1,
		lastOffsets: { x: 0, y: 0 },
	};
	private lastResizeCenter: {
		x: null | number;
		y: null | number;
	} = {
		x: null,
		y: null,
	};

	hooks = {
		onResize: makeHook<[number, number]>(),
		onRefresh: makeHook(),
	};

	constructor(container: Container) {
		this.DM = container.get(DataManager);
		this.utilities = container.get(UtilitiesToken);
		this.DM.hooks.onCanvasFetched.subscribe(this.onFetched);
		const options = container.get(OptionsToken);

		const parentContainer = options.container;
		while (parentContainer.firstElementChild) parentContainer.firstElementChild.remove();
		parentContainer.innerHTML = '';

		const noShadow = options.noShadow || false;
		const realContainer = noShadow ? parentContainer : parentContainer.attachShadow({ mode: 'open' });

		this.utilities.applyStyles(realContainer, style);

		const HTMLContainer = this.DM.data.container;
		HTMLContainer.classList.add('container');
		realContainer.appendChild(HTMLContainer);
	}

	private onFetched = () => {
		this.DM.resetView();
		this.resizeObserver.observe(this.DM.data.container);
		this.animationId = requestAnimationFrame(this.draw);
	};

	private draw = () => {
		if (
			this.perFrame.lastScale !== this.DM.data.scale ||
			this.perFrame.lastOffsets.x !== this.DM.data.offsetX ||
			this.perFrame.lastOffsets.y !== this.DM.data.offsetY
		)
			this.refresh();
		this.animationId = requestAnimationFrame(this.draw);
	};

	private refresh = () => {
		this.perFrame.lastScale = this.DM.data.scale;
		this.perFrame.lastOffsets = {
			x: this.DM.data.offsetX,
			y: this.DM.data.offsetY,
		};
		this.hooks.onRefresh();
	};

	private onResize = () => {
		this.resizeAnimationId = requestAnimationFrame(() => {
			const center = this.DM.middleViewer();
			if (this.lastResizeCenter.x && this.lastResizeCenter.y) {
				this.DM.data.offsetX = this.DM.data.offsetX + center.x - this.lastResizeCenter.x;
				this.DM.data.offsetY = this.DM.data.offsetY + center.y - this.lastResizeCenter.y;
			}
			this.lastResizeCenter.x = center.x;
			this.lastResizeCenter.y = center.y;
			this.hooks.onResize(center.width, center.height);
			this.refresh();
		});
	};
	private resizeObserver: ResizeObserver = new ResizeObserver(this.onResize);

	dispose = () => {
		if (this.animationId) cancelAnimationFrame(this.animationId);
		if (this.resizeAnimationId) cancelAnimationFrame(this.resizeAnimationId);
		this.resizeObserver.disconnect();
	};
}
