import type { DefaultOptions, Empty, GeneralFunction, GeneralObject } from '$/declarations';
import type utilities from '$/utilities';
import type { Container } from '@needle-di/core';

type Hook = ReturnType<typeof utilities.makeHook>;

export type BaseArgs = [Container, GeneralObject, Hook, Hook];

export type GeneralModuleCtor = typeof BaseModule<GeneralObject>;
export type GeneralModule = BaseModule<GeneralObject>;

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
		this.onStart = (...args: Parameters<typeof onStart.subscribe>) =>
			onStart.subscribe(...args);
		this.onDispose = (...args: Parameters<typeof onDispose.subscribe>) =>
			onDispose.subscribe(...args);
	}
	options = {} as DefaultOptions & O;
}
