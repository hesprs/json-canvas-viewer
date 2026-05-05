import { defineConfig } from 'tsdown';

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
	dts: false,
	entry: 'src/chimp.ts',
	minify: true,
	outExtensions: () => ({ js: '.js' }),
});

export default isChimp ? chimpConfig : fullConfig;
