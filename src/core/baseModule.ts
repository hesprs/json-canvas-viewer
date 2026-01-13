import type { Container } from '@needle-di/core';
import type { DefaultOptions, Empty, GeneralFunction, GeneralObject } from '$/declarations';
import type utilities from '$/utilities';

type Hook = ReturnType<typeof utilities.makeHook>;

export type BaseArgs = [Container, GeneralObject, Hook, Hook];

export type GeneralModuleCtor = typeof BaseModule<GeneralObject>;
export type GeneralModule = InstanceType<GeneralModuleCtor>;

export class BaseModule<O extends GeneralObject = Empty> {
	onStart: (callback: GeneralFunction) => void;
	onDispose: (callback: GeneralFunction) => void;
	constructor(
		protected container: Container,
		options: GeneralObject,
		onStart: Hook,
		onDispose: Hook,
	) {
		Object.assign(this.options, options);
		this.onStart = onStart.subscribe;
		this.onDispose = onDispose.subscribe;
	}
	options = {} as DefaultOptions & O;
}
