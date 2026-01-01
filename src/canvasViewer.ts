import { Container } from '@needle-di/core';
import type { GeneralModuleCtor } from '@/baseModule';
import Controller from '@/controller';
import DataManager from '@/dataManager';
import type { ModuleInput, Options } from '@/declarations';
import InteractionHandler from '@/interactionHandler';
import OverlayManager from '@/overlayManager';
import Renderer from '@/renderer';
import utilities from '@/utilities';

type InternalModules = [
	typeof DataManager,
	typeof Controller,
	typeof OverlayManager,
	typeof InteractionHandler,
	typeof Renderer,
];

export class JSONCanvasViewer<M extends ModuleInput = []> {
	private options: Options<[...InternalModules, ...M]>;
	private allModules: ModuleInput;
	container: Container;

	constructor(options: Options<[...InternalModules, ...M]>, modules?: M) {
		this.container = new Container();
		this.options = options;
		const bind = (Class: GeneralModuleCtor) => {
			this.container.bind({
				provide: Class,
				useFactory: () => new Class(this.container, this.options, utilities),
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
		this.allModules.forEach(Module => {
			this.container.get(Module);
		});
		this.container.get(DataManager).loadCanvas();
	}

	dispose = () => {
		const container = this.options.container;
		while (container.firstChild) container.firstChild.remove();
		this.allModules.reverse();
		this.allModules.forEach(Module => {
			const module = this.container.get(Module);
			if (module.dispose) module.dispose();
		});
	};
}
