declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	// oxlint-disable-next-line @typescript/no-explicit-any
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module '*.scss?inline' {
	const content: string;
	export default content;
}
