import purify from 'dompurify';
import { marked } from 'marked';

export { default as Controls } from '@/modules/controls';
export { default as DebugPanel } from '@/modules/debugPanel';
export { default as Minimap } from '@/modules/minimap';
export { default as MistouchPreventer } from '@/modules/mistouchPreventer';
export { default as JSONCanvasViewer } from '$';

export const parser = async (markdown: string) => purify.sanitize(await marked(markdown));

export async function fetchCanvas(path: `${string}.canvas` | `${string}.json`) {
	return (await fetch(path).then((res) => res.json())) as JSONCanvas;
}
