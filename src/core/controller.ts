import { type BaseArgs, BaseModule } from '$/baseModule';
import DataManager from '$/dataManager';
import type { BaseOptions } from '$/declarations';
import StyleManager from '$/styleManager';
import utilities from '$/utilities';

interface Augmentation {
	refresh: Controller['refresh'];
}

export default class Controller extends BaseModule<BaseOptions, Augmentation> {
	private animationId: null | number = null;
	private resizeAnimationId: null | number = null;
	private DM: DataManager;
	private SM: StyleManager;
	private resizeObserver: ResizeObserver;
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
		onResize: utilities.makeHook<[number, number]>(),
		onRefresh: utilities.makeHook(),
	};

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager);
		this.SM = this.container.get(StyleManager);
		this.resizeObserver = new ResizeObserver(this.onResize);
		this.SM.onChangeTheme.subscribe(this.refresh);
		this.augment({ refresh: this.refresh });
		this.onStart(this.start);
		this.onRestart(this.refresh);
		this.onDispose(this.dispose);
	}

	private start = () => {
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

	refresh = () => {
		this.perFrame = {
			lastScale: this.DM.data.scale,
			lastOffsets: { x: this.DM.data.offsetX, y: this.DM.data.offsetY },
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

	private dispose = () => {
		if (this.animationId) cancelAnimationFrame(this.animationId);
		if (this.resizeAnimationId) cancelAnimationFrame(this.resizeAnimationId);
		this.resizeObserver.disconnect();
	};
}
