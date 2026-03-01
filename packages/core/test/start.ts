import { JSONCanvasViewer, type Options, Controls, Minimap, MistouchPreventer } from '@';
import canvas from 'shared/demo.canvas';

const options = {
	container: document.body,
	canvas,
	theme: 'dark',
	loading: 'lazy',
	preventMistouchAtStart: false,
} satisfies Options<[Controls, Minimap, MistouchPreventer]>;

const _viewer = new JSONCanvasViewer(options, [Controls, Minimap, MistouchPreventer]);
