<script lang="ts" generic="T extends ModuleInputCtor" setup>
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue';
import JSONCanvasViewer, { type JSONCanvasViewerInterface } from '$';
import type { ModuleInputCtor, UserOptions } from '$/declarations';
import renderToString from './renderToString';

type ComponentOptions<T extends ModuleInputCtor> = {
	modules?: T;
	canvas?: JSONCanvas;
	attachmentDir?: string;
	options?: Omit<UserOptions<T>, 'container' | 'theme' | 'canvas' | 'attachmentDir'>;
	isPrerendering?: boolean;
	theme?: 'dark' | 'light';
};

const props = defineProps<ComponentOptions<T>>();

const isPrerendering = props.isPrerendering ?? false;
const viewerRef = useTemplateRef('viewerRef');
let viewer: JSONCanvasViewerInterface<T> | null = null;
const prerender = isPrerendering
	? await renderToString({
			canvas: props.canvas ?? {},
			attachmentDir: props.attachmentDir,
			...props.options,
		})
	: '';
watch(
	() => props.theme,
	(theme) => viewer?.changeTheme(theme),
);
watch(
	() => {
		return {
			canvas: props.canvas,
			attachmentDir: props.attachmentDir,
		};
	},
	({ canvas, attachmentDir }) => viewer?.load({ canvas, attachmentDir }),
);

onMounted(() => {
	if (!viewerRef.value) return;
	viewer = new JSONCanvasViewer(
		Object.assign(props.options ?? {}, {
			container: viewerRef.value,
			theme: props.theme,
			canvas: props.canvas,
			attachmentDir: props.attachmentDir,
		}) as UserOptions<T>,
		props.modules,
	);
});

onUnmounted(() => {
	viewer?.dispose();
	viewer = null;
});

defineExpose({ viewer });
</script>

<template>
	<section ref="viewerRef" v-html="prerender" style="max-height: 100vh; max-width: 100vw" />
</template>
