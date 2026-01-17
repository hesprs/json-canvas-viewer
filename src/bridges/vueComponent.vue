<script lang="ts" generic="T extends ModuleInputCtor" setup>
import { onMounted, onUnmounted, useTemplateRef } from 'vue';
import JSONCanvasViewer from '$';
import type { ModuleInputCtor, UserOptions } from '$/declarations';
import renderToString from './renderToString';

type ComponentOptions<T extends ModuleInputCtor> = {
	modules?: T;
	options: Omit<UserOptions<T>, 'container'>;
	isPrerendering?: boolean;
};

const props = defineProps<ComponentOptions<T>>();

const isPrerendering = props.isPrerendering || typeof window === 'undefined';
const viewerRef = useTemplateRef('viewerRef');
let viewer: JSONCanvasViewer<ModuleInputCtor> | null = null;
const prerender = isPrerendering ? await renderToString(props.options) : '';

onMounted(() => {
	if (!viewerRef.value) return;
	viewer = new JSONCanvasViewer(
		Object.assign(props.options, { container: viewerRef.value }) as UserOptions<T>,
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
