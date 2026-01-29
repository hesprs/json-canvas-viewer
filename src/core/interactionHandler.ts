import { type BaseArgs, BaseModule } from '$/baseModule';
import DataManager from '$/dataManager';
import type { BaseOptions } from '$/declarations';
import OverlayManager from '$/overlayManager';
import utilities from '$/utilities';
import {
	Click,
	type Ctors,
	Drag,
	MultitouchPanZoom,
	Pointeract,
	type Options as PointeractOptions,
	PreventDefault,
	type StdEvents,
	WheelPanZoom,
} from 'pointeract';

interface Options extends BaseOptions {
	pointeract?: PointeractOptions<
		Ctors<[Click, Drag, WheelPanZoom, PreventDefault, MultitouchPanZoom]>
	>;
}

export default class InteractionHandler extends BaseModule<Options> {
	private pointeract: Pointeract<
		Ctors<[Click, Drag, WheelPanZoom, PreventDefault, MultitouchPanZoom]>
	>;
	private DM: DataManager;
	onClick = utilities.makeHook<[string | null]>();
	stopInteraction: Pointeract['stop'];
	startInteraction: Pointeract['start'];

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager);
		const options = Object.assign(this.options.pointeract ?? {}, {
			coordinateOutput: 'relative',
		});
		this.pointeract = new Pointeract(
			this.DM.data.container,
			[Click, Drag, WheelPanZoom, PreventDefault, MultitouchPanZoom],
			options,
		);
		this.startInteraction = this.pointeract.start;
		this.stopInteraction = this.pointeract.stop;
		const OM = this.container.get(OverlayManager);
		OM.hooks.onInteractionStart.subscribe(this.stopInteraction);
		OM.hooks.onInteractionEnd.subscribe(this.startInteraction);

		this.onStart(this.start);
		this.onDispose(this.dispose);
	}

	private start = () => {
		this.pointeract.on('pan', this.onPan);
		this.pointeract.on('drag', this.onPan);
		this.pointeract.on('zoom', this.onZoom);
		this.pointeract.on('trueClick', this.onTrueClick);
		this.pointeract.start();
	};

	private onPan = (event: StdEvents['pan']) => {
		this.DM.pan(event.detail);
	};
	private onZoom = (event: StdEvents['zoom']) => {
		const detail = event.detail;
		this.DM.zoom(detail.factor, { x: detail.x, y: detail.y });
	};

	private onTrueClick = (e: StdEvents['trueClick']) => {
		const element = e.detail.target as HTMLElement | null;
		if (this.isUIControl(element)) return;
		const node = this.findNodeId(element);
		this.onClick(node);
	};

	private isUIControl = (target: HTMLElement | null) => {
		if (!target) return false;
		return target.closest('.controls') || target.closest('button') || target.closest('input');
	};

	private findNodeId = (element: HTMLElement | null) => {
		if (!element) return null;
		let ele = element;
		while (!ele.id || ele.id === '') {
			if (!ele.parentElement) break;
			ele = ele.parentElement;
		}
		if (ele.id === 'overlays' || !ele.id || ele.id === '') return null;
		return ele.id;
	};

	private dispose = () => {
		this.pointeract.off('pan', this.onPan);
		this.pointeract.off('zoom', this.onZoom);
		this.pointeract.off('trueClick', this.onTrueClick);
		this.pointeract.dispose();
	};
}
