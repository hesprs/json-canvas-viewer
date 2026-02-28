<script lang="ts" generic="T extends ModuleInputCtor" setup>
import {
	onMounted,
	onUnmounted,
	useTemplateRef,
	watch,
	getCurrentInstance,
	type ComponentInternalInstance,
	createApp,
	reactive,
} from 'vue';
import {
	JSONCanvasViewer,
	type Options,
	type JSONCanvasViewerInterface,
	renderToString,
	type GeneralModuleCtor,
	type Hook,
	type JSONCanvasTextNode,
	type JSONCanvasLinkNode,
	type JSONCanvasFileNode,
	type JSONCanvas,
} from 'json-canvas-viewer';

export type ModuleInputCtor = Array<GeneralModuleCtor>;

export interface TextSlotProps {
	content: string;
	node: JSONCanvasTextNode;
	onActive: Hook;
	onLoseActive: Hook;
}

export interface LinkSlotProps {
	content: string;
	node: JSONCanvasLinkNode;
	onActive: Hook;
	onLoseActive: Hook;
}

export interface FileSlotProps {
	content: string;
	node: JSONCanvasFileNode;
	onActive: Hook;
	onLoseActive: Hook;
}

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

const props = defineProps<ComponentOptions<T>>();
const isPrerendering = props.isPrerendering ?? false;
const viewerRef = useTemplateRef('viewerRef');
let viewer: JSONCanvasViewerInterface<T> | null = null;
const instance = getCurrentInstance() as ComponentInternalInstance;
const prerender = isPrerendering
	? await renderToString({
			canvas: props.canvas ?? {},
			attachmentDir: props.attachmentDir,
            attachments: props.attachments,
			...props.options,
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
	return (
		container: HTMLDivElement,
		content: string,
		node: N['node'],
		onBeforeUnmount: Hook,
		onActive: Hook,
		onLoseActive: Hook,
	) => {
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
	() => props.theme,
	(theme) => viewer?.changeTheme(theme),
);
watch(
	() => {
		return {
			canvas: props.canvas,
			attachmentDir: props.attachmentDir,
			attachments: props.attachments,
		};
	},
	({ canvas, attachmentDir, attachments }) =>
		viewer?.load({ canvas, attachmentDir, attachments }),
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
		Object.assign(props.options ?? {}, {
			container: viewerRef.value,
			theme: props.theme,
			canvas: props.canvas,
			attachmentDir: props.attachmentDir,
			attachments: props.attachments,
			nodeComponents,
		}) as Options<T>,
		props.modules,
	);
});

onUnmounted(() => {
	viewer?.dispose();
	viewer = null;
});
</script>

<template>
	<section ref="viewerRef" v-html="prerender" style="max-height: 100vh; max-width: 100vw" />
</template>
