import type { JSONCanvas } from '@repo/shared';

export default async function fetchCanvas(path: `${string}.canvas` | `${string}.json`) {
	return (await fetch(path).then((res) => res.json())) as JSONCanvas;
}
