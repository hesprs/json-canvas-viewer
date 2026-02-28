export {
	default as JSONCanvasViewer,
	type JSONCanvasViewerInterface,
	type AllOptions as Options,
} from '$';
export { default as renderToString } from '@/renderToString';
export {
	type GeneralModule,
	type GeneralModuleCtor,
	type BaseArgs,
	BaseModule,
} from '$/BaseModule';
export type { BaseOptions } from '$';
export { default as Controller } from '$/Controller';
export { default as DataManager } from '$/DataManager';
export { default as InteractionHandler } from '$/InteractionHandler';
export { default as OverlayManager } from '$/OverlayManager';
export { default as Renderer } from '$/Renderer';
export { default as StyleManager } from '$/StyleManager';
export { default as Controls } from '@/modules/Controls';
export { default as DebugPanel } from '@/modules/DebugPanel';
export { default as Minimap } from '@/modules/Minimap';
export { default as MistouchPreventer } from '@/modules/MistouchPreventer';
export { default as canvasUtils, type Hook } from '$/utilities';
export { parser, fetchCanvas } from '@/chimp';
export type * from 'shared';

// must import env.d.ts, otherwise dts bundler will throw at '*.scss?inline'
import './env.d.ts';
