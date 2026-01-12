export default {
	name: 'json-canvas-transform',
	transform(code: string, id: string) {
		if (!id.endsWith('.canvas')) return null;
		try {
			const json = JSON.parse(code) as JSONCanvas;
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
