import { createP } from '@repo/shared/build';
import react from '@vitejs/plugin-react';
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
		react(),
	],
	build: {
		outDir: p('dist'),
		emptyOutDir: true,
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			external: ['json-canvas-viewer', 'react'],
		},
		lib: {
			entry: p('src/index.ts'),
            fileName: 'index',
			formats: ['es'],
		},
	},
});
