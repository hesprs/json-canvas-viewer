import type { BaseModule } from '$/baseModule';
import Controller from '$/controller';
import DataManager from '$/dataManager';
import type {
	ModuleInputCtor,
	UserOptions,
	UserAugmentation,
	GeneralFunction,
	ModuleInput,
	GeneralObject,
} from '$/declarations';
import InteractionHandler from '$/interactionHandler';
import OverlayManager from '$/overlayManager';
import Renderer from '$/renderer';
import StyleManager from '$/styleManager';
import utilities from '$/utilities';
import { Container } from '@needle-di/core';

class JSONCanvasViewer<M extends ModuleInputCtor> {
	private allModules: ModuleInputCtor;
	private IO: IntersectionObserver | null = null;
	private onDispose = utilities.makeHook(true);
	private onStart = utilities.makeHook();
	private onRestart = utilities.makeHook();
	private started = false;
	options: UserOptions<M>;
	container: Container;

	constructor(options: UserOptions<M>, modules?: M) {
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
		this.allModules = [
			DataManager,
			StyleManager,
			Controller,
			OverlayManager,
			InteractionHandler,
			Renderer,
			...(modules ?? []),
		];
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

	declare private _augmentSlot: GeneralFunction;
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
) => JSONCanvasViewer<M> & UserAugmentation<M>;

export type JSONCanvasViewerInterface<M extends ModuleInput = []> = JSONCanvasViewer<[]> &
	UserAugmentation<M>;

export default JSONCanvasViewer as unknown as JSONCanvasViewerType;
