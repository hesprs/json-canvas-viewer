import { Container, InjectionToken } from '@needle-di/core';
import Controller from '@/controller';
import DataManager from '@/dataManager';
import type { Module, Options } from '@/declarations';
import InteractionHandler from '@/interactionHandler';
import OverlayManager from '@/overlayManager';
import Renderer from '@/renderer';
import { UtilitiesToken, utilities } from '@/utilities';

export const OptionsToken = new InjectionToken<Options>('Options');

export class JSONCanvasViewer {
	private options: Options;
	private container: Container;
	allModules: Array<Module>;
	constructor(options: Options, modules: Array<Module> = []) {
		this.container = new Container();
		this.options = options;
		const bind = (Class: Module) => {
			this.container.bind({
				provide: Class,
				useFactory: () => new Class(this.container),
			});
		};
		this.allModules = [Controller, DataManager, InteractionHandler, Renderer, OverlayManager, ...modules];

		this.container.bind({ provide: OptionsToken, useValue: options });
		this.container.bind({ provide: UtilitiesToken, useValue: utilities });
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
