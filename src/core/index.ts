import type { BaseModule, ModuleInputCtor, ModuleInput, Options, Augmentation } from '$/BaseModule';
import type { GeneralObject } from '$/types';
import Controller from '$/Controller';
import DataManager from '$/DataManager';
import InteractionHandler from '$/InteractionHandler';
import OverlayManager from '$/OverlayManager';
import Renderer from '$/Renderer';
import StyleManager from '$/StyleManager';
import utilities from '$/utilities';
import { Container } from '@needle-di/core';

export interface BaseOptions {
	container: HTMLElement;
	loading?: 'normal' | 'lazy' | 'none';
}

const internalModules = [
	DataManager,
	StyleManager,
	Controller,
	OverlayManager,
	InteractionHandler,
	Renderer,
];

type InternalModules = typeof internalModules;

export type AllOptions<M extends ModuleInput> = Options<M> & Options<InternalModules>;
type AllAugmentation<M extends ModuleInput> = Augmentation<M> & Augmentation<InternalModules>;

class JSONCanvasViewer<M extends ModuleInputCtor> {
	private allModules: ModuleInputCtor;
	private IO: IntersectionObserver | null = null;
	private onDispose = utilities.makeHook(true);
	private onStart = utilities.makeHook();
	private onRestart = utilities.makeHook();
	private started = false;
	options: AllOptions<M>;
	container: Container;

	constructor(options: AllOptions<M>, modules?: M) {
		this.container = new Container();
		this.options = options;
		const bind = (Class: typeof BaseModule) => {
			this.container.bind({
				provide: Class,
				useFactory: () =>
					new Class(
						this.container,
						this.options,
						this.onStart,
						this.onDispose,
						this.onRestart,
						this.augment,
					),
			});
		};
		this.allModules = [...internalModules, ...(modules ?? [])];
		this.allModules.forEach(bind);
		this.allModules.forEach((Module) => {
			this.container.get(Module);
		});

		const loading = this.options.loading ?? 'normal';
		if (loading === 'normal') this.load();
		else if (loading === 'lazy') {
			this.IO = new IntersectionObserver(this.onVisibilityCheck, {
				root: null,
				rootMargin: '50px',
				threshold: 0,
			});
			this.IO.observe(this.options.container);
		}
	}

	private onVisibilityCheck = (entries: Array<IntersectionObserverEntry>) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				this.load();
				this.IO?.disconnect();
				this.IO = null;
				return;
			}
		});
	};

	declare private _augmentSlot: unknown;
	private augment = (aug: GeneralObject) => {
		Object.entries(aug).forEach(([key, value]) => {
			this[key as '_augmentSlot'] = value;
		});
	};

	load = (options?: { canvas?: JSONCanvas; attachmentDir?: string }) => {
		if (options) Object.assign(this.options, options);
		if (this.started) this.onRestart();
		else {
			this.onStart();
			this.started = true;
		}
	};

	dispose = () => {
		this.IO?.disconnect();
		this.IO = null;
		const container = this.options.container;
		while (container.firstChild) container.firstChild.remove();
		this.onDispose();
		this.container.unbindAll();
	};
}

type JSONCanvasViewerType = new <M extends ModuleInputCtor = []>(
	...args: ConstructorParameters<typeof JSONCanvasViewer<M>>
) => JSONCanvasViewer<M> & AllAugmentation<M>;

export type JSONCanvasViewerInterface<M extends ModuleInput = []> = JSONCanvasViewer<never> &
	AllAugmentation<M>;

export default JSONCanvasViewer as JSONCanvasViewerType;
