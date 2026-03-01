import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function createP(url: string) {
	const __filename = fileURLToPath(url);
	const __dirname = dirname(__filename);
	return (path: string) => resolve(__dirname, path);
}
