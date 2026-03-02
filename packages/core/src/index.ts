export {
	default as JSONCanvasViewer,
	type JSONCanvasViewerInterface,
	type AllOptions as Options,
} from '$';
export { default as renderToString } from '@/utilities/renderToString.ts';
export {
	type GeneralModule,
	type GeneralModuleCtor,
	type BaseArgs,
	BaseModule,
} from '$/BaseModule';
export type { BaseOptions } from '$';
export { default as Controls } from '@/modules/Controls';
export { default as DebugPanel } from '@/modules/DebugPanel';
export { default as Minimap } from '@/modules/Minimap';
export { default as MistouchPreventer } from '@/modules/MistouchPreventer';
export { default as canvasUtils, type Hook } from '$/utilities';
export { default as fetchCanvas } from '@/utilities/fetchCanvas';
export { default as parser } from '@/utilities/parser';
export type * from '@repo/shared';

import Controller from '$/Controller';
import DataManager from '$/DataManager';
import InteractionHandler from '$/InteractionHandler';
import OverlayManager from '$/OverlayManager';
import Renderer from '$/Renderer';
import StyleManager from '$/StyleManager';
export const internal = {
	Controller,
	DataManager,
	InteractionHandler,
	OverlayManager,
	Renderer,
	StyleManager,
};

// must import env.d.ts, otherwise dts bundler will throw at '*.scss?inline'
import './env.d.ts';
