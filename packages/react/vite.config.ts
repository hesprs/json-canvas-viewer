import createP from '@repo/shared/build';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';

const p = createP(import.meta.url);

export default defineConfig({
	plugins: [canvas(), react()],
	resolve: {
		alias: {
			'@': p('src'),
		},
	},
	root: 'test',
});
