import type { JSONCanvas, Parser } from '@repo/shared';
import { marked } from 'marked';

declare global {
	// @ts-expect-error
	module '*.canvas' {
		const content: JSONCanvas;
		export default content;
	}
}

export default function vitePluginJsonCanvas(parser: Parser = marked) {
	return {
		name: 'vite-plugin-json-canvas',
		async transform(code: string, id: string) {
			if (!id.endsWith('.canvas')) return null;
			try {
				const json: JSONCanvas = JSON.parse(code);
				if (json.nodes)
					await Promise.all(
						json.nodes.map(async (node) => {
							if (node.type === 'text') node.text = await parser(node.text);
						}),
					);
				return {
					code: `export default ${JSON.stringify(json)}`,
					map: null,
				};
			} catch (e) {
				console.error(`[vite-plugin-json-canvas] Failed to parse: ${id}`);
				throw e;
			}
		},
	};
}
