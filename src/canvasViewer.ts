import { Container } from '@needle-di/core';
import type { GeneralModuleCtor } from '@/baseModule';
import Controller from '@/controller';
import DataManager from '@/dataManager';
import type { ModuleInput, Options } from '@/declarations';
import InteractionHandler from '@/interactionHandler';
import OverlayManager from '@/overlayManager';
import Renderer from '@/renderer';

type InternalModules = [
	typeof DataManager,
	typeof Controller,
	typeof OverlayManager,
	typeof InteractionHandler,
	typeof Renderer,
];

export default class JSONCanvasViewer<M extends ModuleInput = []> {
	private options: Options<[...InternalModules, ...M]>;
	private allModules: ModuleInput;
	private IO: IntersectionObserver | null = null;
	container: Container;

	constructor(options: Options<[...InternalModules, ...M]>, modules?: M) {
		this.container = new Container();
		this.options = options;
		const bind = (Class: GeneralModuleCtor) => {
			this.container.bind({
				provide: Class,
				useFactory: () => new Class(this.container, this.options),
			});
		};
		this.allModules = [
			DataManager,
			Controller,
			OverlayManager,
			InteractionHandler,
			Renderer,
			...(modules || []),
		];

		this.allModules.forEach(bind);
		if (this.options.lazyLoad) {
			this.IO = new IntersectionObserver(this.onVisibilityCheck, {
				root: null,
				rootMargin: '50px',
				threshold: 0,
			});
			this.IO.observe(this.options.container);
		} else this.load();
	}

	private load = () => {
		this.allModules.forEach(Module => {
			this.container.get(Module);
		});
		this.container.get(DataManager).loadCanvas();
	};

	private onVisibilityCheck = (entries: Array<IntersectionObserverEntry>) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				this.load();
				this.IO?.disconnect();
				this.IO = null;
				return;
			}
		});
	};

	dispose = () => {
		this.IO?.disconnect();
		this.IO = null;
		const container = this.options.container;
		while (container.firstChild) container.firstChild.remove();
		this.allModules.reverse();
		this.allModules.forEach(Module => {
			const module = this.container.get(Module);
			if (module.dispose) module.dispose();
		});
		this.container.unbindAll();
	};
}
