// oxlint-disable typescript/no-explicit-any
import type { GeneralObject, ModuleInput as MI, Orchestratable } from '$/types';
import type utilities from '$/utilities';
import type { Container } from '@needle-di/core';

type Hook = ReturnType<typeof utilities.makeHook>;

export type GeneralModuleCtor = typeof BaseModule<any, any>;
export type GeneralModule = BaseModule<any, any>;

export type ModuleInputCtor = Array<GeneralModuleCtor>;
export type ModuleInput = MI<GeneralModuleCtor>;
export type Options<M extends ModuleInput> = Orchestratable<ModuleInput, M, 'options'>;
export type Augmentation<M extends ModuleInput> = Orchestratable<ModuleInput, M, '_Augmentation'>;

export interface BaseOptions {
	container: HTMLElement;
	loading?: 'normal' | 'lazy' | 'none';
}

export type BaseArgs = ConstructorParameters<typeof BaseModule<any, any>>;

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
