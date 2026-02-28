import type { JSONCanvas } from '.';

declare global {
	// @ts-expect-error
	module '*.canvas' {
		const content: JSONCanvas;
		export default content;
	}
}
