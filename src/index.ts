export { type BaseArgs, BaseModule } from '@/baseModule';
export { JSONCanvasViewer } from '@/canvasViewer';
export { default as Controls } from '@/controls';
export { default as DebugPanel } from '@/debugPanel';
export { default as Minimap } from '@/minimap';
export { default as MistouchPreventer } from '@/mistouchPreventer';
export { default as renderToString } from '@/renderToString';
export { default as CanvasUtils } from '@/utilities';

import Controller from '@/controller';
import DataManager from '@/dataManager';
import InteractionHandler from '@/interactionHandler';
import OverlayManager from '@/overlayManager';
import Renderer from '@/renderer';
export const developerSuite = {
	Controller,
	DataManager,
	InteractionHandler,
	Renderer,
	OverlayManager,
};
