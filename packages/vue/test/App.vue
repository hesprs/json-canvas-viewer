<script setup lang="ts">
import Viewer from '@/Viewer.vue';
import canvas from 'shared/demo.canvas';
</script>

<template>
	<Suspense>
		<Viewer class="canvas-viewer" :canvas="canvas">
			<template #text="{ node }">
				<p :class="node.type">
					This is a Vue component that is mounted into JSON Canvas Viewer
				</p>
			</template>
		</Viewer>
	</Suspense>
</template>

<style>
.canvas-viewer {
	height: calc(100vh - 6rem);
	width: calc(100vw - 6rem);
	border-radius: 24px;
	overflow: hidden;
}
</style>
