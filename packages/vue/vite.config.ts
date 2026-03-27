import { createP } from '@repo/shared/build';
import vue from 'unplugin-vue/vite';
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';

const p = createP(import.meta.url);

export default defineConfig({
	resolve: {
		alias: {
			'@': p('src'),
		},
	},
	root: 'test',
	plugins: [canvas(), vue()],
});
