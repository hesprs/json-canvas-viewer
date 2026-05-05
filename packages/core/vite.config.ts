import createP from '@repo/shared/build';
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';

const p = createP(import.meta.url);

export default defineConfig({
	plugins: [canvas()],
	resolve: {
		alias: {
			$: p('src/kernel'),
			'@': p('src'),
		},
	},
	root: p('test'),
});
