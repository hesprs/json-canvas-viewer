import type { BaseOptions } from '$';
import type { BaseArgs } from '$/BaseModule';
import { BaseModule } from '$/BaseModule';
import DataManager from '$/DataManager';
import StyleManager from '$/StyleManager';
import { makeHook } from '$/utilities';

type Augmentation = {
	refresh: Controller['refresh'];
	onRefresh: Controller['onRefresh'];
	onResize: Controller['onResize'];
};

export default class Controller extends BaseModule<BaseOptions, Augmentation> {
	private animationId: undefined | number;
	private resizeAnimationId: undefined | number;
	private readonly DM: DataManager;
	private readonly SM: StyleManager;
	private readonly resizeObserver: ResizeObserver;
	private perFrame: {
		lastScale: number;
		lastOffsets: { x: number; y: number };
	} = {
		lastOffsets: { x: 0, y: 0 },
		lastScale: 1,
	};
	private readonly lastResizeCenter: {
		x: undefined | number;
		y: undefined | number;
	} = {
		x: undefined,
		y: undefined,
	};

	onResize = makeHook<[number, number]>();
	onRefresh = makeHook();

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager);
		this.SM = this.container.get(StyleManager);
		this.resizeObserver = new ResizeObserver(this.onResizeCallback);
		this.SM.onChangeTheme.subscribe(this.refresh);
		this.augment({
			onRefresh: this.onRefresh,
			onResize: this.onResize,
			refresh: this.refresh,
		});
		this.onStart(this.start);
		this.onRestart(this.refresh);
		this.onDispose(this.dispose);
	}

	private readonly start = () => {
		this.resizeObserver.observe(this.DM.data.container);
		this.animationId = requestAnimationFrame(this.draw);
	};

	private readonly draw = () => {
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
			lastOffsets: { x: this.DM.data.offsetX, y: this.DM.data.offsetY },
			lastScale: this.DM.data.scale,
		};
		this.onRefresh();
	};

	private readonly onResizeCallback = () => {
		this.resizeAnimationId = requestAnimationFrame(() => {
			const center = this.DM.middleViewer();
			if (this.lastResizeCenter.x && this.lastResizeCenter.y) {
				this.DM.data.offsetX = this.DM.data.offsetX + center.x - this.lastResizeCenter.x;
				this.DM.data.offsetY = this.DM.data.offsetY + center.y - this.lastResizeCenter.y;
			}
			this.lastResizeCenter.x = center.x;
			this.lastResizeCenter.y = center.y;
			this.onResize(center.width, center.height);
			this.refresh();
		});
	};

	private readonly dispose = () => {
		if (this.animationId) cancelAnimationFrame(this.animationId);
		if (this.resizeAnimationId) cancelAnimationFrame(this.resizeAnimationId);
		this.resizeObserver.disconnect();
	};
}
