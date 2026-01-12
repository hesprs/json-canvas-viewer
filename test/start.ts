import { Controls, DebugPanel, JSONCanvasViewer, Minimap, MistouchPreventer, fetchCanvas } from '@';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import data from './example/introduction.canvas';

console.log(data)
console.log('ssss')

new JSONCanvasViewer(
	{
		container: document.body,
		canvas: {
            data,
            attachmentBaseDir: './example'
        },
		// canvas: await fetchCanvas('Example Canvas/introduction.canvas'),
        lazyLoad: true,
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
