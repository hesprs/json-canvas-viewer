import type { MarkdownParser } from '$/declarations';

export default function (parser?: MarkdownParser) {
	return {
		name: 'json-canvas-vite-plugin',
		async transform(code: string, id: string) {
			if (!id.endsWith('.canvas')) return null;
			try {
				const json = JSON.parse(code) as JSONCanvas;
				if (parser && json.nodes)
					await Promise.all(
						json.nodes.map(async node => {
							if (node.type === 'text') node.text = await parser(node.text);
						}),
					);
				return {
					code: `export default ${JSON.stringify(json)}`,
					map: null,
				};
			} catch (e) {
				console.error(`[json-canvas] Failed to parse: ${id}`);
				throw e;
			}
		},
	};
}
