import type { Options } from '@';
import { JSONCanvasViewer, Controls, Minimap, MistouchPreventer } from '@';
import canvas from '@repo/shared/demo.canvas';

const options = {
	canvas,
	container: document.body,
	loading: 'lazy',
	preventMistouchAtStart: false,
	theme: 'dark',
} satisfies Options<[Controls, Minimap, MistouchPreventer]>;

new JSONCanvasViewer(options, [Controls, Minimap, MistouchPreventer]);
