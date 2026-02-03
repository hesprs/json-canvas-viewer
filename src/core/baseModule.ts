// oxlint-disable typescript/no-explicit-any
import type { BaseOptions, GeneralObject } from '$/declarations';
import type utilities from '$/utilities';
import type { Container } from '@needle-di/core';

type Hook = ReturnType<typeof utilities.makeHook>;

export type BaseArgs = [Container, GeneralObject, Hook, Hook, Hook, (aug: GeneralObject) => void];

export type GeneralModule = BaseModule<any, any>;
export type GeneralModuleCtor = typeof BaseModule<any, any>;

export class BaseModule<O extends BaseOptions = BaseOptions, A extends {} = {}> {
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
