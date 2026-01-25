import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import { marked } from 'marked';
import { defineConfig } from 'vite';

import jsonCanvasTransform from './src/bridges/vitePlugin';

const isBuilding = process.env.BUILD; // 'full' | 'chimp' | 'webpack_loader'

const fullConfig = defineConfig({
	root: 'test',
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/'),
			$: resolve(__dirname, 'src/core/'),
		},
	},
	plugins: [jsonCanvasTransform(marked), vue()],
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			external: ['@needle-di/core', 'pointeract', 'vue', 'react', '@ahmedsemih/color-fns'],
		},
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				modules: resolve(__dirname, 'src/modules.ts'),
				dev: resolve(__dirname, 'src/dev.ts'),
				bridges: resolve(__dirname, 'src/bridges.ts'),
                react: resolve(__dirname, 'src/bridges/reactComponent.tsx'),
                vue: resolve(__dirname, 'src/bridges/vueComponent.vue'),
			},
			name: 'JSONCanvasViewer',
			formats: ['es', 'cjs'],
			fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`,
		},
	},
});

const webpackLoaderConfig = defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/'),
			$: resolve(__dirname, 'src/core/'),
		},
	},
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: false,
		minify: false,
		rollupOptions: {
			external: ['@needle-di/core', 'pointeract', 'vue', 'react', '@ahmedsemih/color-fns', 'schema-utils'],
		},
		lib: {
			entry: {
				webpackLoader: resolve(__dirname, 'src/bridges/webpackLoader.js'),
			},
			name: 'JSONCanvasViewer',
			formats: ['es'],
			fileName: 'webpackLoader',
		},
	},
});

const chimpConfig = defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/'),
			$: resolve(__dirname, 'src/core/'),
		},
	},
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: false,
		minify: 'terser',
		sourcemap: false,
		lib: {
			entry: {
				chimp: resolve(__dirname, 'src/chimp.ts'),
			},
			name: 'JSONCanvasViewer',
			formats: ['es', 'cjs'],
			fileName: (format) => `chimp.${format === 'cjs' ? 'cjs' : 'js'}`,
		},
	},
});

export default isBuilding === 'chimp'
	? chimpConfig
	: isBuilding === 'webpack_loader'
		? webpackLoaderConfig
		: fullConfig;
