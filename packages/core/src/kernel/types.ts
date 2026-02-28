// #region Informative Types
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
// #endregion =====================================================================

// #region General Types
// oxlint-disable-next-line typescript/no-explicit-any
export type General = any;
export type GeneralArray = ReadonlyArray<General>;
export type GeneralObject = object;
export type GeneralFunction = Function;
export type GeneralConstructor = new (...args: General[]) => General;
// #endregion =====================================================================

// #region Orchestration Machine
type UnionToIntersection<U> = (U extends General ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

type GeneralModuleInput = ReadonlyArray<GeneralConstructor> | ReadonlyArray<GeneralObject>;

export type ModuleInput<T extends GeneralConstructor> =
	| ReadonlyArray<T>
	| ReadonlyArray<InstanceType<T>>;

type Instances<T extends GeneralModuleInput> =
	T extends ReadonlyArray<GeneralConstructor> ? InstanceType<T[number]> : T[number];

export type Orchestratable<
	T extends GeneralModuleInput,
	K extends keyof Instances<T>,
> = UnionToIntersection<Instances<T>[K]>;
// #endregion ======================================================================
