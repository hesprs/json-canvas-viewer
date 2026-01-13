import { JSONCanvasViewer } from '@';
import { Controls, DebugPanel, Minimap, MistouchPreventer } from '@/modules';
import canvas from './example/introduction.canvas';

new JSONCanvasViewer(
	{
		container: document.body,
		canvas,
		attachmentDir: './example',
		// canvas: await fetchCanvas('Example Canvas/introduction.canvas'),
		lazyLoading: true,
		mistouchPreventer: {
			preventAtStart: false,
		},
	},
	[Controls, DebugPanel, Minimap, MistouchPreventer],
);
