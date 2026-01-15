import { JSONCanvasViewer } from '@';
import { Controls, DebugPanel, Minimap, MistouchPreventer } from '@/modules';
import canvas from './demo.canvas';

new JSONCanvasViewer(
	{
		container: document.body,
		canvas,
		// canvas: await fetchCanvas('Example Canvas/introduction.canvas'),
		lazyLoading: true,
		mistouchPreventer: {
			preventAtStart: false,
		},
	},
	[Controls, DebugPanel, Minimap, MistouchPreventer],
);
