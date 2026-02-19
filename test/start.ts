import { JSONCanvasViewer, type Options } from '@';
import { Controls, Minimap, MistouchPreventer } from '@/modules';
import canvas from './demo.canvas';

const options = {
	container: document.body,
	canvas,
	// theme: 'dark',
	// canvas: await fetchCanvas('Example Canvas/introduction.canvas'),
	loading: 'lazy',
	preventMistouchAtStart: false,
} satisfies Options<[Controls, Minimap, MistouchPreventer]>;

const _viewer = new JSONCanvasViewer(options, [Controls, Minimap, MistouchPreventer]);
