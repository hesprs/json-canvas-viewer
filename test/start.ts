import { Controls, DebugPanel, JSONCanvasViewer, Minimap, MistouchPreventer } from '@';

new JSONCanvasViewer(
	{
		container: document.body,
		canvasPath: 'Example Canvas/introduction.canvas',
	},
	[Controls, DebugPanel, Minimap, MistouchPreventer]
);
