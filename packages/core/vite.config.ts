import { createP } from '@repo/shared/build';
import dts from 'unplugin-dts-bundle-generator/vite';
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';
import pkg from './package.json';

const isBuilding = process.env.BUILD === 'chimp' ? 'chimp' : 'full';
const p = createP(import.meta.url);

const baseConfig = defineConfig({
	root: 'test',
	resolve: {
		alias: {
			'@': p('src'),
			$: p('src/kernel'),
		},
	},
});

const fullConfig = defineConfig({
	...baseConfig,
	plugins: [
		canvas(),
		dts({
			fileName: 'index.d.ts',
			output: {
				inlineDeclareExternals: true,
				inlineDeclareGlobals: true,
				noBanner: true,
				exportReferencedTypes: false,
			},
			libraries: {
				inlinedLibraries: ['@repo/shared'],
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
		},
		lib: {
			entry: p('src/index.ts'),
			fileName: 'index',
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

export default isBuilding === 'chimp' ? chimpConfig : fullConfig;
