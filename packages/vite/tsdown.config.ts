import { defineConfig } from 'tsdown';

export default defineConfig({
	dts: {
		eager: true,
	},
	entry: ['src/index.ts', 'src/canvas.d.ts'],
	minify: true,
	outExtensions: () => ({
		dts: '.d.ts',
		js: '.js',
	}),
	plugins: [
		{
			generateBundle(
				_options: object,
				bundle: Record<string, { type?: string; code?: string }>,
			) {
				const chunk = bundle['index.d.ts'];
				if (chunk?.type === 'chunk' && chunk.code)
					chunk.code = `/// <reference path="./canvas.d.ts" />\n${chunk.code}`;
			},
			name: 'wire-canvas-global',
		},
	],
	sourcemap: true,
});
