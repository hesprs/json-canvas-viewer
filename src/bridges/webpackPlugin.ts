import type { MarkdownParser } from '$/declarations';
import type { Compiler } from 'webpack';

export default class JsonCanvasWebpackPlugin {
	parser: MarkdownParser;

	constructor(parser: MarkdownParser) {
		this.parser = parser;
	}

	apply(compiler: Compiler) {
		const loaderPath = require.resolve('./webpackLoader');

		compiler.options.module.rules.unshift({
			test: /\.canvas$/,
			use: [
				{
					loader: loaderPath,
					options: { parser: this.parser },
				},
			],
			// Prevent Webpack's default JSON handling
			type: 'javascript/auto',
		});
	}
}
