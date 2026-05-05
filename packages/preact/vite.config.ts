import { preact } from '@preact/preset-vite';
import createP from '@repo/shared/build';
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';

const p = createP(import.meta.url);

export default defineConfig({
	plugins: [canvas(), preact()],
	resolve: {
		alias: {
			'@': p('src'),
		},
	},
	root: 'test',
});
