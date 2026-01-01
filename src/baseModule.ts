import type { Container } from '@needle-di/core';
import type { DefaultOptions, Empty, GeneralFunction, GeneralObject, Utilities } from '@/declarations';

export type BaseArgs = [Container, GeneralObject, Utilities];

export type GeneralModuleCtor = typeof BaseModule<GeneralObject>;
export type GeneralModule = InstanceType<GeneralModuleCtor>;

export class BaseModule<O extends GeneralObject = Empty> {
	constructor(
		protected container: Container,
		options: GeneralObject,
		protected utilities: Utilities,
	) {
		Object.assign(this.options, options);
	}

	options = {} as DefaultOptions & O;

	dispose?: GeneralFunction;
}
