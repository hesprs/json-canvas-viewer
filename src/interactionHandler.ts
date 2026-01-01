import {
	Click,
	type Ctors,
	Drag,
	MultitouchPanZoom,
	Pointeract,
	PreventDefault,
	type StdEvents,
	WheelPanZoom,
} from 'pointeract';
import { type BaseArgs, BaseModule } from '@/baseModule';
import DataManager from '@/dataManager';
import OverlayManager from '@/overlayManager';
import { makeHook } from '@/shared';

type Options = {
	interactions?: {
		proControlSchema?: boolean;
		zoomFactor?: number;
		lockControlSchema?: boolean;
	};
};

export default class InteractionHandler extends BaseModule<Options> {
	private pointeract: Pointeract<Ctors<[Click, Drag, WheelPanZoom, PreventDefault, MultitouchPanZoom]>>;
	private DM: DataManager;
	private OM: OverlayManager;
	onClick = makeHook<[string | null]>();

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager);
		this.OM = this.container.get(OverlayManager);
		const options = Object.assign(
			{ proControlSchema: false, zoomFactor: 0.1, lockControlSchema: false },
			this.options.interactions || {},
		);
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
		this.DM.hooks.onCanvasFetched.subscribe(this.onFetched);
	}
	stopInteraction: Pointeract['stop'];
	startInteraction: Pointeract['start'];

	private onFetched = () => {
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
		const detail = e.detail;
		function isUIControl(target: HTMLElement | null) {
			if (!target) return false;
			return target.closest('.controls') || target.closest('button') || target.closest('input');
		}
		if (isUIControl(e.detail.target as HTMLElement | null)) return;
		const node = this.DM.findNodeAt({ x: detail.x, y: detail.y });
		this.onClick(node ? node.id : null);
	};

	dispose = () => {
		this.pointeract.off('pan', this.onPan);
		this.pointeract.off('zoom', this.onZoom);
		this.pointeract.off('trueClick', this.onTrueClick);
		this.pointeract.dispose();
	};
}
