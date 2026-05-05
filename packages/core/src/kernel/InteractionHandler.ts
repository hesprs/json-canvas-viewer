import type { BaseOptions } from '$';
import type { BaseArgs } from '$/BaseModule';
import type { Coordinates } from '$/types';
import type { Options as PointeractOptions, Events, PointeractInterface } from 'pointeract';
import { BaseModule } from '$/BaseModule';
import DataManager from '$/DataManager';
import OverlayManager from '$/OverlayManager';
import { makeHook } from '$/utilities';
import {
	Click,
	Drag,
	MultitouchPanZoom,
	Pointeract,
	PreventDefault,
	WheelPanZoom,
	Lubricator,
	lubricatorPanPreset as pan,
	lubricatorZoomPreset as zoom,
	lubricatorDragPreset as drag,
} from 'pointeract';

type LoadedModules = [Click, Drag, WheelPanZoom, PreventDefault, MultitouchPanZoom, Lubricator];

type LoadedEvents = Events<LoadedModules>;

type Options = {
	pointeract?: PointeractOptions<LoadedModules>;
} & BaseOptions;

type Augmentation = {
	pan: InteractionHandler['pan'];
	panToCoords: InteractionHandler['panToCoords'];
	zoom: InteractionHandler['zoom'];
	zoomToScale: InteractionHandler['zoomToScale'];
};

export default class InteractionHandler extends BaseModule<Options, Augmentation> {
	pointeract: PointeractInterface<LoadedModules>;
	private readonly DM: DataManager;
	onClick = makeHook<[string | undefined]>();

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager);
		const options = Object.assign(this.options.pointeract ?? {}, {
			coordinateOutput: 'relative',
			element: this.DM.data.container,
			lubricator: { drag, pan, zoom },
		} satisfies PointeractOptions<LoadedModules>);
		this.pointeract = new Pointeract(options, [
			Click,
			Drag,
			WheelPanZoom,
			PreventDefault,
			MultitouchPanZoom,
			Lubricator,
		]);
		const OM = this.container.get(OverlayManager);
		OM.onInteractionStart.subscribe(this.stopInteract);
		OM.onInteractionEnd.subscribe(this.startInteract);

		this.augment({
			pan: this.pan,
			panToCoords: this.panToCoords,
			zoom: this.zoom,
			zoomToScale: this.zoomToScale,
		});
		this.onStart(this.start);
		this.onDispose(this.dispose);
	}

	private readonly start = () => {
		this.pointeract
			.on('pan', this.onPan)
			.on('drag', this.onPan)
			.on('zoom', this.onZoom)
			.on('trueClick', this.onTrueClick)
			.start();
	};

	private readonly startInteract = () => {
		this.pointeract.start();
	};
	private readonly stopInteract = () => {
		this.pointeract.stop();
	};

	private readonly onPan = (event: LoadedEvents['pan']) => {
		this.truePan({
			x: event.deltaX,
			y: event.deltaY,
		});
	};
	private readonly onZoom = (event: LoadedEvents['zoom']) => {
		this.trueZoom(event.factor, event);
	};

	trueZoom = (_factor: number, origin: Coordinates) => {
		const newScale = Math.max(Math.min(this.DM.data.scale * _factor, 20), 0.05);
		const scale = this.DM.data.scale;
		if (newScale === scale) return;
		const factor = newScale / this.DM.data.scale;
		const canvasCoords = this.C2C(origin);
		this.DM.data.offsetX = origin.x - canvasCoords.x * factor;
		this.DM.data.offsetY = origin.y - canvasCoords.y * factor;
		this.DM.data.scale = newScale;
	};
	truePan = ({ x, y }: Coordinates) => {
		this.DM.data.offsetX += x;
		this.DM.data.offsetY += y;
	};

	zoom = (_factor: number, origin: Coordinates) => {
		this.pointeract.dispatch('zoom', { factor: _factor, ...origin });
	};
	pan = ({ x, y }: Coordinates) => {
		this.pointeract.dispatch('pan', { deltaX: x, deltaY: y });
	};
	zoomToScale = (newScale: number, origin: Coordinates) => {
		const factor = newScale / this.DM.data.scale;
		this.pointeract.dispatch('zoom', { factor, ...origin });
	};
	panToCoords = ({ x, y }: Coordinates) => {
		this.pointeract.dispatch('pan', {
			deltaX: x - this.DM.data.offsetX,
			deltaY: y - this.DM.data.offsetY,
		});
	};

	// Container Coords to Canvas Coords relative to the top-left corner of the scaled canvas
	private readonly C2C = ({ x: containerX, y: containerY }: Coordinates) => ({
		x: containerX - this.DM.data.offsetX,
		y: containerY - this.DM.data.offsetY,
	});

	private readonly onTrueClick = (e: LoadedEvents['trueClick']) => {
		const element = e.target ? (e.target as HTMLElement) : undefined;
		if (this.isUIControl(element)) return;
		const node = this.findNodeId(element);
		this.onClick(node);
	};

	private readonly isUIControl = (target?: HTMLElement) => {
		if (!target) return false;
		return target.closest('.controls') || target.closest('button') || target.closest('input');
	};

	private readonly findNodeId = (element?: HTMLElement) => {
		if (!element) return;
		let ele = element;
		while (!ele.id || ele.id === '') {
			if (!ele.parentElement) break;
			ele = ele.parentElement;
		}
		if (ele.id === 'overlays' || !ele.id || ele.id === '') return;
		return ele.id;
	};

	private readonly dispose = () => this.pointeract.dispose();
}
