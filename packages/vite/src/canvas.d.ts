import type { JSONCanvas } from '@repo/shared';

declare global {
	module '*.canvas' {
		const content: JSONCanvas;
		export default content;
	}
}
