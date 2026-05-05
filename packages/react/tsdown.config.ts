import { defineConfig } from 'tsdown';

export default defineConfig({
	dts: {
		eager: true,
	},
	entry: 'src/index.ts',
	minify: true,
	outExtensions: () => ({
		dts: '.d.ts',
		js: '.js',
	}),
	sourcemap: true,
});
