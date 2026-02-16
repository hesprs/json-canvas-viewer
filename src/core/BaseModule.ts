import type { BaseOptions } from '$';
import type { General, GeneralObject, ModuleInput as MI, Orchestratable } from '$/types';
import type utilities from '$/utilities';
import type { Container } from '@needle-di/core';

type Hook = ReturnType<typeof utilities.makeHook>;

export type GeneralModuleCtor = typeof BaseModule<General, General>;
export type GeneralModule = BaseModule<General, General>;

export type ModuleInputCtor = Array<GeneralModuleCtor>;
export type ModuleInput = MI<GeneralModuleCtor>;
export type Options<M extends ModuleInput> = Orchestratable<M, 'options'>;
export type Augmentation<M extends ModuleInput> = Orchestratable<M, '_Augmentation'>;

export type BaseArgs = ConstructorParameters<GeneralModuleCtor>;

export class BaseModule<O extends BaseOptions = BaseOptions, A extends GeneralObject = {}> {
	declare private static readonly _BaseModuleBrand: unique symbol; // Nominal marker
	declare _Augmentation: A;
	onStart: Hook['subscribe'];
	onRestart: Hook['subscribe'];
	onDispose: Hook['subscribe'];
	constructor(
		protected container: Container,
		options: GeneralObject,
		onStart: Hook,
		onDispose: Hook,
		onRestart: Hook,
		protected augment: (aug: A) => void,
	) {
		this.options = options as O;
		this.onStart = onStart.subscribe;
		this.onDispose = onDispose.subscribe;
		this.onRestart = onRestart.subscribe;
	}
	options: O;
}
