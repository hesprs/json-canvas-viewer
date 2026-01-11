import { type BaseArgs, BaseModule } from '@/baseModule';
import DataManager from '@/dataManager';
import style from '@/styles.scss?inline';
import utilities from '@/utilities';

type Options = {
	noShadow?: boolean;
};

export default class Controller extends BaseModule<Options> {
	private animationId: null | number = null;
	private resizeAnimationId: null | number = null;
	private DM: DataManager;
	private resizeObserver: ResizeObserver;
	private perFrame = {
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
		onResize: utilities.makeHook<[number, number]>(),
		onRefresh: utilities.makeHook(),
	};

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager);
		this.DM.hooks.onCanvasFetched.subscribe(this.onFetched);

		const parentContainer = this.options.container;
		while (parentContainer.firstElementChild) parentContainer.firstElementChild.remove();
		parentContainer.innerHTML = '';

		const noShadow = this.options.noShadow || false;
		const realContainer = noShadow ? parentContainer : parentContainer.attachShadow({ mode: 'open' });

		utilities.applyStyles(realContainer, style);

		const HTMLContainer = this.DM.data.container;
		HTMLContainer.classList.add('container');
		realContainer.appendChild(HTMLContainer);
		this.resizeObserver = new ResizeObserver(this.onResize);
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

	dispose = () => {
		if (this.animationId) cancelAnimationFrame(this.animationId);
		if (this.resizeAnimationId) cancelAnimationFrame(this.resizeAnimationId);
		this.resizeObserver.disconnect();
	};
}
