import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: 'src/index.ts',
	dts: {
		eager: true,
	},
	minify: true,
	sourcemap: true,
	outExtensions: () => ({
		js: '.js',
		dts: '.d.ts',
	}),
});
