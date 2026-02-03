// oxlint-disable typescript/no-explicit-any
import type { GeneralModule, GeneralModuleCtor } from '$/baseModule';
import type Controller from '$/controller';
import type DataManager from '$/dataManager';
import type InteractionHandler from '$/interactionHandler';
import type OverlayManager from '$/overlayManager';
import type Renderer from '$/renderer';
import type StyleManager from '$/styleManager';

declare global {
	interface JSONCanvasGroupNode extends JSONCanvasGenericNode {
		type: 'group';
		label?: string;
		background?: string;
		backgroundStyle?: 'cover' | 'ratio' | 'repeat';
	}

	interface JSONCanvasFileNode extends JSONCanvasGenericNode {
		type: 'file';
		file: string;
		subpath?: string;
	}

	interface JSONCanvasTextNode extends JSONCanvasGenericNode {
		type: 'text';
		text: string;
	}

	interface JSONCanvasLinkNode extends JSONCanvasGenericNode {
		type: 'link';
		url: string;
	}

	type JSONCanvasNode =
		| JSONCanvasGroupNode
		| JSONCanvasFileNode
		| JSONCanvasTextNode
		| JSONCanvasLinkNode;

	interface JSONCanvasEdge {
		id: string;
		fromNode: string;
		toNode: string;
		fromSide: 'right' | 'left' | 'top' | 'bottom';
		toSide: 'right' | 'left' | 'top' | 'bottom';
		toEnd?: 'arrow' | 'none';
		label?: string;
		styleAttributes?: Record<string, string>;
		color?: string;
	}

	interface JSONCanvas {
		nodes?: Array<JSONCanvasNode>;
		edges?: Array<JSONCanvasEdge>;
	}

	//@ts-expect-error: TS doesn't recognize this as a module
	declare module '*.canvas' {
		const content: JSONCanvas;
		export default content;
	}
}

interface JSONCanvasGenericNode {
	id: string;
	type: 'group' | 'file' | 'text' | 'link';
	x: number;
	y: number;
	width: number;
	height: number;
	styleAttributes?: Record<string, string>;
	color?: string;
}

export type Coordinates = {
	x: number;
	y: number;
};

export type NodeBounds = {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	width: number;
	height: number;
	centerX: number;
	centerY: number;
};

export type Box = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export type GeneralArguments = Array<any>;
export type GeneralObject = Record<Indexable, any>;
export type Indexable = string | number | symbol;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
	? I
	: never;

export type ModuleInputCtor = Array<GeneralModuleCtor>;
type ModuleInputInstance = Array<GeneralModule>;
export type ModuleInput = ModuleInputCtor | ModuleInputInstance;

type Instances<T extends ModuleInput> = T extends ModuleInputCtor
	? InstanceType<T[number]>
	: T[number];

export interface BaseOptions {
	container: HTMLElement;
	loading?: 'normal' | 'lazy' | 'none';
}

export type MarkdownParser = (markdown: string) => string | Promise<string>;

type Orchestratable<
	T extends ModuleInput,
	K extends 'options' | '_Augmentation',
> = UnionToIntersection<Instances<T>[K]>;
export type Options<T extends ModuleInput = []> = Orchestratable<T, 'options'>;
export type Augmentation<T extends ModuleInput = []> = Orchestratable<T, '_Augmentation'>;

type InternalModules = [
	DataManager,
	StyleManager,
	Controller,
	OverlayManager,
	InteractionHandler,
	Renderer,
];

export type UserOptions<M extends ModuleInput> = Options<M> & Options<InternalModules>;
export type UserAugmentation<M extends ModuleInput> = Augmentation<M> &
	Augmentation<InternalModules>;
