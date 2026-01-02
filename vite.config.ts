import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	root: 'test',
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/'),
		},
	},
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			external: ['@needle-di/core', 'pointeract', 'micromark'],
		},
		lib: {
			entry: {
				index: resolve(__dirname, 'src'),
			},
			name: 'JSONCanvasViewer',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
		},
	},
});
