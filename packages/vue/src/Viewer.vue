<script lang="ts" generic="T extends ModuleInputCtor" setup>
import type {
	Options,
	JSONCanvasViewerInterface,
	GeneralModuleCtor,
	Hook,
	JSONCanvasTextNode,
	JSONCanvasLinkNode,
	JSONCanvasFileNode,
	JSONCanvas,
} from 'json-canvas-viewer';
import type { ComponentInternalInstance } from 'vue';
import { JSONCanvasViewer, renderToString } from 'json-canvas-viewer';
import {
	onMounted,
	onUnmounted,
	useTemplateRef,
	watch,
	getCurrentInstance,
	createApp,
	reactive,
} from 'vue';

export type ModuleInputCtor = Array<GeneralModuleCtor>;

export type TextSlotProps = {
	content: string;
	node: JSONCanvasTextNode;
	onActive: Hook;
	onLoseActive: Hook;
};

export type LinkSlotProps = {
	content: string;
	node: JSONCanvasLinkNode;
	onActive: Hook;
	onLoseActive: Hook;
};

export type FileSlotProps = {
	content: string;
	node: JSONCanvasFileNode;
	onActive: Hook;
	onLoseActive: Hook;
};

type ComponentOptions<T extends ModuleInputCtor> = {
	modules?: T;
	canvas?: JSONCanvas;
	attachmentDir?: string;
	attachments?: Record<string, string>;
	options?: Omit<
		Options<T>,
		'container' | 'theme' | 'canvas' | 'attachmentDir' | 'nodeComponents' | 'attachments'
	>;
	isPrerendering?: boolean;
	theme?: 'dark' | 'light';
};

const {
	isPrerendering = false,
	attachmentDir,
	canvas = {},
	attachments,
	options = {},
	theme,
	modules,
} = defineProps<ComponentOptions<T>>();
const viewerRef = useTemplateRef('viewerRef');
let viewer: JSONCanvasViewerInterface<T> | undefined;
const instance = getCurrentInstance() as ComponentInternalInstance;
const prerender = isPrerendering
	? await renderToString({
			attachmentDir,
			attachments,
			canvas,
			...options,
		})
	: '';

const slots = defineSlots<{
	text?(props: TextSlotProps): unknown;
	markdown?(props: FileSlotProps): unknown;
	image?(props: FileSlotProps): unknown;
	video?(props: FileSlotProps): unknown;
	audio?(props: FileSlotProps): unknown;
	link?(props: LinkSlotProps): unknown;
}>();
defineExpose({ viewer });

function createNodeFunc<N extends TextSlotProps | FileSlotProps | LinkSlotProps>(
	slotFn: (props: N) => unknown,
) {
	return ({
		container,
		content,
		node,
		onBeforeUnmount,
		onActive,
		onLoseActive,
	}: {
		container: HTMLDivElement;
		content: string;
		node: N['node'];
		onBeforeUnmount: Hook;
		onActive: Hook;
		onLoseActive: Hook;
	}) => {
		const app = createApp({
			render: () =>
				slotFn(
					reactive({
						content,
						node,
						onActive,
						onLoseActive,
					}) as N,
				),
		});
		app._context = instance.appContext;
		app.mount(container);
		onBeforeUnmount.subscribe(app.unmount);
	};
}

watch(
	() => theme,
	(newTheme) => viewer?.changeTheme(newTheme),
);
watch(
	() => ({ attachmentDir, attachments, canvas }),
	// oxlint-disable-next-line no-shadow
	({ canvas, attachmentDir, attachments }) =>
		viewer?.load({ attachmentDir, attachments, canvas }),
);

onMounted(() => {
	if (!viewerRef.value) return;
	const supportedNodes = ['text', 'markdown', 'link', 'audio', 'image', 'video'] as const;
	const nodeComponents: Options['nodeComponents'] = {};
	for (const nodeType of supportedNodes) {
		const slotFunc = slots[nodeType];
		if (!slotFunc) continue;
		nodeComponents[nodeType] = createNodeFunc(slotFunc as never);
	}
	viewer = new JSONCanvasViewer(
		Object.assign(options, {
			attachmentDir,
			attachments,
			canvas,
			container: viewerRef.value,
			nodeComponents,
			theme,
		}) as Options<T>,
		modules,
	);
});

onUnmounted(() => {
	viewer?.dispose();
	viewer = undefined;
});
</script>

<template>
	<section ref="viewerRef" v-html="prerender" style="max-height: 100vh; max-width: 100vw" />
</template>
