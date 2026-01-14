## Server Side Rendering

We've experimented with a viable path using **progressive enhancement** for server-side rendering JSON canvases.

`json-canvas-viewer/bridges` provides an export `renderToString` async function that renders the canvas to a string:

```TypeScript
renderToString(options: {
    canvas: JSONCanvas;
    attachmentDir?: string;
    markdownParser?: MarkdownParser,
}): Promise<string>;
```

- `options`: the [same requirements](2-🏗️-Construction-Details.md#options) as `canvas`, `attachmentDir`, and `markdownParser` passed in the main constructor options.

You can use the returned string as the `innerHTML` of your container element. To achieve this:
- in `React`: `dangerouslySetInnerHTML`
- in `Vue`: `v-html`

**Disclaimer: for customizability, `json-canvas-viewer` does not sanitize the output, but it is basically safe provided**:
- if you are using the chimp version, the default `parser` output is sanitized by `DOMPurify`.
- if you are using the full version, since you directly import the canvas file, the file is under your control, so there's no risk of XSS. Alternatively, you can include a sanitizer in your build-time parser.

During client-side code execution, pre-rendered HTML will be replaced with the actual interactive viewer.

## Vue Component

A Vue3 wrapper (`JSONCanvasViewerVue`) is ready to use in the full version of JSON Canvas Viewer. This component comes with natural support of SSR. For maximum customizability, the component comes **unstyled**, you can assign class yourself.

Below is a minimal example:

```vue
<script lang="ts" setup>
import { JSONCanvasViewerVue } from 'json-canvas-viewer/bridges'
import { Minimap, MistouchPreventer, Controls } from 'json-canvas-viewer/modules';
import canvas from 'path/to/your.canvas'
const options = {
    lazyLoading: true,
    canvas,
    minimapCollapsed: true,
}
const modules = [Minimap, MistouchPreventer, Controls];
</script>

<template>
    <JSONCanvasViewerVue class="viewer" :modules :options />
    <!-- ... your other components -->
</template>

<style scoped>
/* sample styles */
.viewer {
	width: 100%;
	aspect-ratio: 16 / 9;
	border-radius: 12px;
	overflow: hidden;
}

@media (max-width: 768px) {
	.viewer {
		aspect-ratio: 1 / 1;
	}
}
</style>
```

The component has props of:

```ts
{
    options: <JSON Canvas Viewer Options>;
    modules?: <JSON Canvas Viewer Module>[];
    isSSR?: boolean;
}
```

- `modules`: The optional modules to load, the same requirements as documented in [Construction Details](2-🏗️-Construction-Details.md#modules).
- `options`: The options object passed to the viewer, the same requirements as documented in [Construction Details](2-🏗️-Construction-Details.md#options). **Note that the `container` field is omitted**.
- `isSSR`: Whether to run in SSR mode. If not defined, it will be inferred from the existence of `window`, which is reliable enough that in most cases you don't need to specify this property.