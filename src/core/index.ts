import { Container } from '@needle-di/core';
import type { GeneralModuleCtor } from '$/baseModule';
import Controller from '$/controller';
import DataManager from '$/dataManager';
import type { ModuleInputCtor, UserOptions } from '$/declarations';
import InteractionHandler from '$/interactionHandler';
import OverlayManager from '$/overlayManager';
import Renderer from '$/renderer';
import utilities from '$/utilities';

export default class JSONCanvasViewer<M extends ModuleInputCtor = []> {
	private options: UserOptions<M>;
	private allModules: ModuleInputCtor;
	private IO: IntersectionObserver | null = null;
	private onStart = utilities.makeHook();
	private onDispose = utilities.makeHook(true);
	container: Container;

	constructor(options: UserOptions<M>, modules?: M) {
		this.container = new Container();
		this.options = options;
		const bind = (Class: GeneralModuleCtor) => {
			this.container.bind({
				provide: Class,
				useFactory: () => new Class(this.container, this.options, this.onStart, this.onDispose),
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
		if (this.options.lazyLoading) {
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
		this.onStart();
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
		this.onDispose();
		this.container.unbindAll();
	};
}
