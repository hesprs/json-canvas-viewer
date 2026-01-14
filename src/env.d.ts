declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	// biome-ignore lint/suspicious/noExplicitAny: upstream problem
	// biome-ignore lint/complexity/noBannedTypes: upstream problem
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module '*.scss?inline' {
	const content: string;
	export default content;
}
