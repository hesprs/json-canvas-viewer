import { defineConfig } from 'tsdown';
import pkg from './package.json' with { type: 'json' };

const isChimp = process.env.MODE === 'chimp';

const fullConfig = defineConfig({
	dts: { eager: true },
	entry: 'src/index.ts',
	minify: true,
	outExtensions: () => ({ dts: '.d.ts', js: '.js' }),
	sourcemap: true,
	unbundle: true,
});

const chimpConfig = defineConfig({
	clean: false,
	deps: { alwaysBundle: Object.keys(pkg.dependencies) },
	dts: false,
	entry: 'src/chimp.ts',
	minify: true,
	outExtensions: () => ({ js: '.js' }),
});

export default isChimp ? chimpConfig : fullConfig;
