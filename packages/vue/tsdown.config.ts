import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';

export default defineConfig({
	dts: {
		eager: true,
		vue: true,
	},
	entry: 'src/index.ts',
	minify: true,
	outExtensions: () => ({
		dts: '.d.ts',
		js: '.js',
	}),
	plugins: [Vue({ isProduction: true })],
	sourcemap: true,
});
