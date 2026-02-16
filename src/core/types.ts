// #region Global
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
// #endregion =====================================================================

// #region Informative Types
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

export type MarkdownParser = (markdown: string) => string | Promise<string>;
// #endregion =====================================================================

// #region General Types
// oxlint-disable-next-line typescript/no-explicit-any
export type General = any;
export type GeneralArray = ReadonlyArray<General>;
export type GeneralObject = object;
export type GeneralFunction = Function;
export type GeneralConstructor = new (...args: General[]) => General;
export type Indexable = string | number | symbol;
// #endregion =====================================================================

// #region Orchestration Machine
type UnionToIntersection<U> = (U extends General ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

type GeneralModuleInput = Array<GeneralConstructor> | Array<GeneralObject>;

export type ModuleInput<T extends GeneralConstructor> = Array<T> | Array<InstanceType<T>>;

type Instances<M extends GeneralModuleInput, T extends M> =
	T extends Array<GeneralConstructor> ? InstanceType<T[number]> : T[number];

export type Orchestratable<
	M extends GeneralModuleInput,
	T extends M,
	K extends keyof Instances<M, T>,
> = UnionToIntersection<Instances<M, T>[K]>;
// #endregion ======================================================================
