import { Controls, DebugPanel, JSONCanvasViewer, Minimap, MistouchPreventer } from '@';

new JSONCanvasViewer(
	{
		container: document.body,
		canvasPath: 'Example Canvas/introduction.canvas',
		controlsCollapsed: true,
		mistouchPreventer: {
			preventAtStart: false,
		},
	},
	[Controls, DebugPanel, Minimap, MistouchPreventer],
);
