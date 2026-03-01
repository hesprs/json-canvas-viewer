import { createP } from '@repo/shared/build';
import vue from '@vitejs/plugin-vue';
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
		vue(),
	],
	build: {
		outDir: p('dist'),
		emptyOutDir: true,
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			external: ['json-canvas-viewer', 'vue', 'json-canvas-viewer/modules'],
		},
		lib: {
			entry: p('src/index.ts'),
			formats: ['es'],
		},
	},
});
