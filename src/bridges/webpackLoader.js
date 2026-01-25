import { validate } from 'schema-utils';

const schema = {
	type: 'object',
	properties: {
		parser: { instanceof: 'Function' },
	},
};

export default async function jsonCanvasLoader(source) {
	const options = this.getOptions() ?? {};
	validate(schema, options, { name: 'JSON Canvas Loader' });
	const { parser } = options;

	this.cacheable(true);

	try {
		const json = JSON.parse(source);
		if (parser && Array.isArray(json.nodes)) {
			await Promise.all(
				json.nodes.map(async (node) => {
					if (node.type === 'text') {
						node.text = await parser(node.text);
					}
				}),
			);
		}
		return `export default ${JSON.stringify(json)}`;
	} catch (e) {
		this.emitError(`[json-canvas] Failed to parse ${this.resourcePath}: ${e.message}`);
	}
}

export const raw = true;
