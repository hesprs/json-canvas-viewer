import { defineConfig } from 'tsdown';

const isChimp = process.env.MODE === 'chimp';

const fullConfig = defineConfig({
	entry: 'src/index.ts',
	dts: { eager: true },
	minify: true,
	sourcemap: true,
	outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
	unbundle: true,
});

const chimpConfig = defineConfig({
	entry: 'src/chimp.ts',
	minify: true,
	dts: false,
	outExtensions: () => ({ js: '.js' }),
	clean: false,
});

export default isChimp ? chimpConfig : fullConfig;
