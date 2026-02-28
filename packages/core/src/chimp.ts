export { default as Controls } from '@/modules/Controls';
export { default as DebugPanel } from '@/modules/DebugPanel';
export { default as Minimap } from '@/modules/Minimap';
export { default as MistouchPreventer } from '@/modules/MistouchPreventer';
export { default as JSONCanvasViewer } from '$';
import type { JSONCanvas } from 'shared';
import purify from 'dompurify';
import { marked } from 'marked';

export async function parser(markdown: string) {
	return purify.sanitize(await marked(markdown));
}

export async function fetchCanvas(path: `${string}.canvas` | `${string}.json`) {
	return (await fetch(path).then((res) => res.json())) as JSONCanvas;
}
