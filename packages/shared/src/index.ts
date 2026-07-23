export type Parser = (markdown: string) => string | Promise<string>;

export type JSONCanvasGroupNode = {
	type: 'group';
	label?: string;
	background?: string;
	backgroundStyle?: 'cover' | 'ratio' | 'repeat';
} & JSONCanvasGenericNode;

export type JSONCanvasFileNode = {
	type: 'file';
	file: string;
	subpath?: string;
} & JSONCanvasGenericNode;

export type JSONCanvasTextNode = {
	type: 'text';
	text: string;
} & JSONCanvasGenericNode;

export type JSONCanvasLinkNode = {
	type: 'link';
	url: string;
} & JSONCanvasGenericNode;

export type JSONCanvasNode =
	| JSONCanvasGroupNode
	| JSONCanvasFileNode
	| JSONCanvasTextNode
	| JSONCanvasLinkNode;

export type JSONCanvasEdge = {
	id: string;
	fromNode: string;
	toNode: string;
	fromSide: 'right' | 'left' | 'top' | 'bottom';
	toSide: 'right' | 'left' | 'top' | 'bottom';
	toEnd?: 'arrow' | 'none';
	label?: string;
	styleAttributes?: Record<string, string>;
	color?: string;
};

export type JSONCanvas = {
	nodes?: Array<JSONCanvasNode>;
	edges?: Array<JSONCanvasEdge>;
};

type JSONCanvasGenericNode = {
	id: string;
	type: 'group' | 'file' | 'text' | 'link';
	x: number;
	y: number;
	width: number;
	height: number;
	styleAttributes?: Record<string, string>;
	color?: string;
};
