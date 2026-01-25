import { JSONCanvasViewer, type Options } from '@';

import { Controls, DebugPanel, Minimap, MistouchPreventer } from '@/modules';

import canvas from './demo.canvas';

const options = {
	container: document.body,
	canvas,
	// theme: 'dark',
	// canvas: await fetchCanvas('Example Canvas/introduction.canvas'),
	loading: 'lazy',
	preventMistouchAtStart: false,
	disableZoomInOptimization: true,
} satisfies Options<[Controls, DebugPanel, Minimap, MistouchPreventer]>;

const _viewer = new JSONCanvasViewer(options, [Controls, DebugPanel, Minimap, MistouchPreventer]);
