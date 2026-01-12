import type { BaseModule, GeneralModule, GeneralModuleCtor } from '@/baseModule';
import type Controller from './controller';
import type DataManager from './dataManager';
import type InteractionHandler from './interactionHandler';
import type OverlayManager from './overlayManager';
import type Renderer from './renderer';

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

	type JSONCanvasNode = JSONCanvasGroupNode | JSONCanvasFileNode | JSONCanvasTextNode | JSONCanvasLinkNode;

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
	declare module '*.scss?inline' {
		const content: string;
		export default content;
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

export type RuntimeData = {
	offsetX: number;
	offsetY: number;
	scale: number;
	canvasData: JSONCanvas;
	nodeMap: Record<string, JSONCanvasNode>;
	canvasBaseDir: string;
	nodeBounds: NodeBounds;
	container: HTMLDivElement;
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

// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralArguments = Array<any>;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralObject = Record<Indexable, any>;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralFunction = (...args: GeneralArguments) => any;
// biome-ignore lint/complexity/noBannedTypes: General Type
export type Empty = {};
type Indexable = string | number | symbol;
// biome-ignore lint/suspicious/noExplicitAny: General Type
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
	? I
	: never;
type AllModuleInstances<T extends ModuleInput> = InstanceType<T[number]>;

export type DefaultOptions = {
	container: HTMLElement;
	lazyLoad?: boolean;
};

export type ModuleInput = Array<GeneralModuleCtor>;

export type Options<T extends ModuleInput = []> = Omit<
	UnionToIntersection<AllModuleInstances<T>['options']>,
	keyof DefaultOptions
> &
	DefaultOptions;

type Ctors<T extends Array<BaseModule> | BaseModule> =
	T extends Array<BaseModule>
		? { [K in keyof T]: new (...args: GeneralArguments) => T[K] }
		: [new (...args: GeneralArguments) => T];

export type UserOptions<T extends Array<GeneralModule> = []> = Options<
	Ctors<[Controller, InteractionHandler, DataManager, OverlayManager, Renderer, ...T]>
>;
