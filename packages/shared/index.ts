export type Parser = (markdown: string) => string | Promise<string>;

export interface JSONCanvasGroupNode extends JSONCanvasGenericNode {
	type: 'group';
	label?: string;
	background?: string;
	backgroundStyle?: 'cover' | 'ratio' | 'repeat';
}

export interface JSONCanvasFileNode extends JSONCanvasGenericNode {
	type: 'file';
	file: string;
	subpath?: string;
}

export interface JSONCanvasTextNode extends JSONCanvasGenericNode {
	type: 'text';
	text: string;
}

export interface JSONCanvasLinkNode extends JSONCanvasGenericNode {
	type: 'link';
	url: string;
}

export type JSONCanvasNode =
	| JSONCanvasGroupNode
	| JSONCanvasFileNode
	| JSONCanvasTextNode
	| JSONCanvasLinkNode;

export interface JSONCanvasEdge {
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

export interface JSONCanvas {
	nodes?: Array<JSONCanvasNode>;
	edges?: Array<JSONCanvasEdge>;
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
