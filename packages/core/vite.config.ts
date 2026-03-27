// Build core package using Vite instead Tsdown since it needs to handle `.scss?inline`

import { createP } from '@repo/shared/build';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';
import pkg from './package.json' with { type: 'json' };

const mode = process.env.MODE;
const isBuilding = mode === 'chimp' || mode === 'full' ? mode : 'dev';
const p = createP(import.meta.url);

const baseConfig = defineConfig({
	resolve: {
		alias: {
			'@': p('src'),
			$: p('src/kernel'),
		},
	},
});

const devConfig = defineConfig({
	...baseConfig,
	plugins: [canvas()],
	root: p('test'),
});

const fullConfig = defineConfig({
	...baseConfig,
	plugins: [
		canvas(),
		dts({
			bundleTypes: {
				bundledPackages: ['@repo/shared'],
			},
		}),
	],
	build: {
		outDir: p('dist'),
		emptyOutDir: true,
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			external: Object.keys(pkg.dependencies),
			output: {
				preserveModules: true,
			},
		},
		lib: {
			entry: p('src/index.ts'),
			fileName: '[name]',
			formats: ['es'],
		},
	},
});

const chimpConfig = defineConfig({
	...baseConfig,
	build: {
		outDir: p('dist'),
		emptyOutDir: false,
		minify: 'terser',
		sourcemap: false,
		lib: {
			entry: p('src/chimp.ts'),
			fileName: 'chimp',
			formats: ['es'],
		},
	},
});

export default isBuilding === 'chimp'
	? chimpConfig
	: isBuilding === 'full'
		? fullConfig
		: devConfig;
