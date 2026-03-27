import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';

export default defineConfig({
	entry: 'src/index.ts',
	dts: {
		eager: true,
		vue: true,
	},
	minify: true,
	sourcemap: true,
	outExtensions: () => ({
		js: '.js',
		dts: '.d.ts',
	}),
	plugins: [Vue({ isProduction: true })],
});
