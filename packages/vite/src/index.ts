import { marked } from 'marked';
import { type JSONCanvas, type Parser } from 'shared';
import 'shared/module-type';

export default function (parser: Parser = marked) {
	return {
		name: 'vite-plugin-json-canvas',
		async transform(code: string, id: string) {
			if (!id.endsWith('.canvas')) return null;
			try {
				const json = JSON.parse(code) as JSONCanvas;
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
