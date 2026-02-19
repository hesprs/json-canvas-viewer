## Prerendering

`json-canvas-viewer/bridges` provides an export `renderToString` async function that renders the canvas content to a string:

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

**Disclaimer: for customizability, the viewer instance itself does not sanitize the output, but it is basically safe provided**:

- if you are using the chimp version, the default `parser` output is sanitized by `DOMPurify`.
- if you are using the full version, since you directly import the canvas file, the file is under your control, so there's no risk of XSS. Alternatively, you can include a sanitizer in your build-time parser.

During client-side code execution, pre-rendered HTML will be replaced with the actual interactive viewer.

## Vue Component

A Vue3 component (at `json-canvas-viewer/vue`) is ready to use in the full version of JSON Canvas Viewer. Note that:

- This component comes with natural support of prerendering.
- This component comes **unstyled**, you can assign classes yourself.
- This component toggles theme and reloads canvases reactively.
- You need to wrap it with a `<Suspense></Suspense>`.

Below is a minimal example:

```vue
<script lang="ts" setup>
import Viewer from 'json-canvas-viewer/vue';
import { Minimap, MistouchPreventer, Controls } from 'json-canvas-viewer/modules';
import canvas from 'path/to/your.canvas';
const options = {
  loading: 'lazy',
  minimapCollapsed: true,
};
const modules = [Minimap, MistouchPreventer, Controls];
const isPrerendering = import.meta.env.SSR; // if you are using Vite
</script>

<template>
  <Suspense>
    <Viewer :modules :options :canvas :isPrerendering />
  </Suspense>
  <!-- ... your other components -->
</template>
```

The component has props of:

```ts
interface Props {
    options?: <JSON Canvas Viewer Options>;
    modules?: <JSON Canvas Viewer Module>[];
    theme?: 'light' | 'dark';
    canvas?: JSONCanvas;
    attachmentDir?: string;
    isPrerendering?: boolean;
}
```

- `options`: The options object passed to the viewer, the same requirements as documented in [Construction Details](2-🏗️-Construction-Details.md#options).
  - **Note that the `container`, `theme`, `canvas` and `attachmentDir` fields inside it are omitted**.
- `modules`: The optional modules to load, the same requirements as documented in [Construction Details - Modules](2-🏗️-Construction-Details.md#modules).
- `theme`, `canvas`, `attachmentDir`: same requirements as documented in [Construction Details - Options](2-🏗️-Construction-Details.md#options).
- `isPrerendering`: Whether to run in prerendering mode. If not defined, it will be `false` and prerendering won't happen.

This component exposes:

```TypeScript
interface Exposure {
    viewer: JSONCanvasViewer;
}
```

- `viewer`: the viewer instance.

## React Component

We've also crafted a React component (`json-canvas-viewer/react`) that wraps around the viewer. It can be found the the full version of the viewer at `json-canvas-viewer/bridges`. Note that:

- Unlike the Vue component, you need to manually decide when to prerender. We recommend placing this component into a **server component** to perform prerendering, likely your main page.
- This component comes **unstyled**, you can assign class yourself.

Below is a minimal example (in your server component):

```tsx
// app/page.tsx
import { renderToString } from 'json-canvas-viewer/bridges';
import Viewer from 'json-canvas-viewer/react';
import { Minimap, MistouchPreventer, Controls } from 'json-canvas-viewer/modules';
import canvas from 'path/to/your.canvas';
const options = {
  loading: 'lazy',
  minimapCollapsed: true,
};
const modules = [Minimap, MistouchPreventer, Controls];

export default async function Page() {
  const html = await renderToString({ canvas });

  return (
    <main>
      {/* ... your other components */}
      <Viewer prerenderedContent={html} modules={modules} options={options} canvas={canvas} />
    </main>
  );
}
```

It accepts none props:

- `prerenderedContent?`: the content to be prerendered, you almost always need to pass in the result of `renderToString`. Setting this prop does not have impact on client-side execution.
- `modules?`: The optional modules to load, the same requirements as documented in [Construction Details - Modules](2-🏗️-Construction-Details.md#modules).
- `options?`: The options object passed to the viewer, the same requirements as documented in [Construction Details](2-🏗️-Construction-Details.md#options).
  - **Note that the `container`, `theme`, `canvas` and `attachmentDir` fields inside it are omitted**.
- `theme?`, `canvas?`, `attachmentDir?`: same requirements as documented in [Construction Details - Options](2-🏗️-Construction-Details.md#options).
- `className?`, `style?`, `id?`: the same as setting `className`, `style`, and `id` to a normal JSX element.
