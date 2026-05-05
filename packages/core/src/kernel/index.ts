import type {
	ModuleInputCtor,
	ModuleInput,
	Options,
	Augmentation,
	GeneralModuleCtor,
} from '$/BaseModule';
import type { GeneralObject } from '$/types';
import type { JSONCanvas } from '@repo/shared';
import Controller from '$/Controller';
import DataManager from '$/DataManager';
import InteractionHandler from '$/InteractionHandler';
import OverlayManager from '$/OverlayManager';
import Renderer from '$/Renderer';
import StyleManager from '$/StyleManager';
import { makeHook } from '$/utilities';
import { Container } from '@needle-di/core';

export type BaseOptions = {
	container: HTMLElement;
	loading?: 'normal' | 'lazy' | 'none';
};

const internalModules = [
	DataManager,
	StyleManager,
	Controller,
	OverlayManager,
	InteractionHandler,
	Renderer,
];

type InternalModules = typeof internalModules;

export type AllOptions<M extends ModuleInput = []> = Options<M> & Options<InternalModules>;
type AllAugmentation<M extends ModuleInput = []> = Augmentation<M> & Augmentation<InternalModules>;

class JSONCanvasViewer<M extends ModuleInputCtor> {
	private readonly allModules: ModuleInputCtor;
	private IO: IntersectionObserver | undefined;
	private started = false;
	private disposed = false;
	options: AllOptions<M>;
	container: Container;
	onDispose = makeHook(true);
	onStart = makeHook();
	onRestart = makeHook();

	constructor(options: AllOptions<M>, modules?: M) {
		this.container = new Container();
		this.options = options;
		const bind = (Class: GeneralModuleCtor) => {
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
				rootMargin: '50px',
				threshold: 0,
			});
			this.IO.observe(this.options.container);
		}
	}

	private readonly onVisibilityCheck = (entries: Array<IntersectionObserverEntry>) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				this.load();
				this.IO?.disconnect();
				this.IO = undefined;
				return;
			}
		});
	};

	private readonly augment = (aug: GeneralObject) => {
		const descriptors = Object.getOwnPropertyDescriptors(aug);
		Object.defineProperties(this, descriptors);
	};

	load = (options?: {
		canvas?: JSONCanvas;
		attachmentDir?: string;
		attachments?: Record<string, string>;
	}) => {
		if (this.disposed) return;
		if (options) Object.assign(this.options, options);
		if (this.started) this.onRestart();
		else {
			this.onStart();
			this.started = true;
		}
	};

	dispose = () => {
		if (!this.started || this.disposed) return;
		this.IO?.disconnect();
		this.IO = undefined;
		const container = this.options.container;
		while (container.firstChild) container.firstChild.remove();
		this.onDispose();
		this.container.unbindAll();
		this.disposed = true;
	};
}

type JSONCanvasViewerType = new <M extends ModuleInputCtor = []>(
	...args: ConstructorParameters<typeof JSONCanvasViewer<M>>
) => JSONCanvasViewer<M> & AllAugmentation<M>;

export type JSONCanvasViewerInterface<M extends ModuleInput = []> = JSONCanvasViewer<never> &
	AllAugmentation<M>;

export default JSONCanvasViewer as JSONCanvasViewerType;
