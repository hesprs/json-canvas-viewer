import type { DefaultOptions, Empty, GeneralObject, Indexable } from '$/declarations';
import type utilities from '$/utilities';
import type { Container } from '@needle-di/core';

type Hook = ReturnType<typeof utilities.makeHook>;
// oxlint-disable-next-line typescript/no-explicit-any
export type Augmentation = Record<Indexable, any>;

export type BaseArgs = [Container, GeneralObject, Hook, Hook, Hook, (aug: Augmentation) => void];

// oxlint-disable-next-line typescript/no-explicit-any
export type GeneralModuleCtor = typeof BaseModule<GeneralObject, any>;
// oxlint-disable-next-line typescript/no-explicit-any
export type GeneralModule = BaseModule<GeneralObject, any>;

export class BaseModule<O extends GeneralObject = Empty, A extends Augmentation = Empty> {
	onStart: Hook['subscribe'];
	onRestart: Hook['subscribe'];
	onDispose: Hook['subscribe'];
	augment: (aug: A) => void;
	constructor(
		protected container: Container,
		options: GeneralObject,
		onStart: Hook,
		onDispose: Hook,
		onRestart: Hook,
		augment: (aug: A) => void,
	) {
		this.options = options as DefaultOptions & O;
		this.onStart = onStart.subscribe;
		this.onDispose = onDispose.subscribe;
		this.onRestart = onRestart.subscribe;
		this.augment = augment;
	}
	options: DefaultOptions & O;
	declare _providedMethods: A;
}
