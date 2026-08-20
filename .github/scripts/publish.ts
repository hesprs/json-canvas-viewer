#!/usr/bin/env bun
import { $ } from 'bun';

type Package = {
	name?: string;
	version?: string;
	private?: boolean;
	workspaces?: Array<string> | { packages?: Array<string> };
	publishConfig?: { registry?: string; access: string };
};

const root = (await Bun.file('package.json').json()) as Package;
const patterns = Array.isArray(root.workspaces)
	? root.workspaces
	: (root.workspaces?.packages ?? []);

const dirs = new Set<string>();

for (const p of patterns) {
	if (typeof p !== 'string' || p.startsWith('!')) continue;

	const base = p.replace(/\/+$/u, '');
	const glob =
		base === '' || base === '.'
			? 'package.json'
			: base.endsWith('package.json')
				? base
				: `${base}/package.json`;

	for await (const found of new Bun.Glob(glob).scan('.')) {
		const path = found.replaceAll('\\', '/');
		if (path.includes('node_modules/')) continue;
		dirs.add(path === 'package.json' ? '.' : path.slice(0, -'/package.json'.length));
	}
}

const npmName = (name: string) =>
	name.startsWith('@') ? `@${encodeURIComponent(name.slice(1))}` : encodeURIComponent(name);

await Promise.all(
	[...dirs].map(async (dir) => {
		const pkg = (await Bun.file(`${dir}/package.json`).json()) as Package;

		if (!pkg.name || !pkg.version || pkg.private) return;

		const registry = (
			pkg.publishConfig?.registry ??
			root.publishConfig?.registry ??
			'https://registry.npmjs.org/'
		).replace(/\/+$/u, '');

		const res = await fetch(
			`${registry}/${npmName(pkg.name)}/${encodeURIComponent(pkg.version)}`,
		);

		if (res.ok) return;
		if (res.status !== 404)
			throw new Error(`Registry check failed for ${pkg.name}: ${res.status}`);

		const out = await $`bun pm pack`.cwd(dir).text();

		let tar = /[^\s"']+\.tgz/u.exec(out)?.[0]?.replaceAll('\\', '/').replace(/^\.\//u, '');

		if (!tar) {
			const { value } = new Bun.Glob('*.tgz').scanSync(dir).next() as { value: string };
			if (value) tar = value.replaceAll('\\', '/').replace(/^\.\//u, '');
		}

		if (!tar) throw new Error(`No tarball produced for ${pkg.name}`);

		const local = `${dir}/${tar}`;
		const tarPath = (await Bun.file(local).exists()) ? local : tar;

		await (pkg.publishConfig?.access
			? $`bunx npm@latest publish ${tarPath} --access ${pkg.publishConfig.access}`
			: $`bunx npm@latest publish ${tarPath}`);
	}),
);
