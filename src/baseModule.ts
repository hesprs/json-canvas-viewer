import type { Container } from '@needle-di/core';
import type { DefaultOptions, Empty, GeneralFunction, GeneralObject } from '@/declarations';

export type BaseArgs = [Container, GeneralObject];

export type GeneralModuleCtor = typeof BaseModule<GeneralObject>;
export type GeneralModule = InstanceType<GeneralModuleCtor>;

export class BaseModule<O extends GeneralObject = Empty> {
	constructor(
		protected container: Container,
		options: GeneralObject,
	) {
		Object.assign(this.options, options);
	}

	options = {} as DefaultOptions & O;

	dispose?: GeneralFunction;
}
