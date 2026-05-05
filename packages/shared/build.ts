// oxlint-disable import/no-nodejs-modules
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default function createP(url: string) {
	const filename = fileURLToPath(url);
	const dirName = dirname(filename);
	return (path: string) => resolve(dirName, path);
}
