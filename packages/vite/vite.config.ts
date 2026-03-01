import dts from 'unplugin-dts-bundle-generator/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		dts({
			fileName: 'index.d.ts',
			output: {
				inlineDeclareExternals: true,
				inlineDeclareGlobals: true,
				noBanner: true,
				exportReferencedTypes: false,
			},
			libraries: {
				inlinedLibraries: ['@repo/shared/module-type'],
			},
		}),
	],
	build: {
		emptyOutDir: true,
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			external: ['marked'],
		},
		lib: {
			entry: 'src/index.ts',
			fileName: 'index',
			formats: ['es'],
		},
	},
});
