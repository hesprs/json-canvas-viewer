import preact from '@preact/preset-vite';
import { createP } from '@repo/shared/build';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import canvas from 'vite-plugin-json-canvas';

const p = createP(import.meta.url);

export default defineConfig({
	root: 'test',
	resolve: {
		alias: {
			'@': p('src'),
		},
	},
	plugins: [
		canvas(),
		dts({
			exclude: [p('test'), p('vite.config.ts')],
		}),
		preact(),
	],
	build: {
		outDir: p('dist'),
		emptyOutDir: true,
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			external: ['json-canvas-viewer', 'preact', 'preact/hooks', 'preact/compat'],
		},
		lib: {
			entry: p('src/index.ts'),
			formats: ['es'],
		},
	},
});
