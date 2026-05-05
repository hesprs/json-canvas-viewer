import Controller from '$/Controller';
import DataManager from '$/DataManager';
import InteractionHandler from '$/InteractionHandler';
import OverlayManager from '$/OverlayManager';
import Renderer from '$/Renderer';
import StyleManager from '$/StyleManager';
// Must import env.d.ts, otherwise tsdown will throw at '*.scss?inline'
import './env.d.ts';

export {
	default as JSONCanvasViewer,
	type JSONCanvasViewerInterface,
	type AllOptions as Options,
} from '$';
export { default as renderToString } from '@/utilities/render-to-string.ts';
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
export { type Hook } from '$/utilities';
export { default as fetchCanvas } from '@/utilities/fetch-canvas.ts';
export { default as parser } from '@/utilities/parser';
export type * from '@repo/shared';
export const internal = {
	Controller,
	DataManager,
	InteractionHandler,
	OverlayManager,
	Renderer,
	StyleManager,
};
