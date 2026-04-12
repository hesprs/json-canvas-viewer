import { createP } from '@repo/shared/build';
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';

const p = createP(import.meta.url);

export default defineConfig({
	resolve: {
		alias: {
			'@': p('src'),
			$: p('src/kernel'),
		},
	},
	plugins: [canvas()],
	root: p('test'),
});
