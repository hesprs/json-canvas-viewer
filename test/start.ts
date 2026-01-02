import { Controls, DebugPanel, JSONCanvasViewer, Minimap, MistouchPreventer } from '@';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

new JSONCanvasViewer(
	{
		container: document.body,
		canvasPath: 'Example Canvas/introduction.canvas',
		controlsCollapsed: true,
		mistouchPreventer: {
			preventAtStart: false,
		},
		micromark: {
			extensions: [gfm()],
			htmlExtensions: [gfmHtml()],
		},
	},
	[Controls, DebugPanel, Minimap, MistouchPreventer],
);
