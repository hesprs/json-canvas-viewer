We provide you two versions of JSON Canvas Viewer - `chimp` version and `full` version.

## 🐒 Chimpanzee Version

This version is specially built for fast trials and environments that do not have bundlers or package managers. It has everything bundled into one file, enabling you to use within seconds. However, it's **not recommended** for production use since it does not support deep customization or tree-shaking.

The chimp version has everything prepared for you, including a lightweight and secure runtime markdown parser, a canvas loader and [four optional modules](3-🧩-Modules.md). You almost always need the parser and loader, but you can choose modules according to yourself.

Create an HTML file and paste the following lines:

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<title>🐒 Canvas Viewer</title>
	<style>
		body,
		html {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
		}
	</style>
</head>
<body></body>
<script type="module">
    import { JSONCanvasViewer, parser, fetchCanvas, Minimap } from 'https://unpkg.com/json-canvas-viewer';

    new JSONCanvasViewer(
	    {
		    container: document.body, // The element to attach the viewer to
		    canvas: await fetchCanvas('path/to/your.canvas'), // remember to prepare your canvas
            markdownParser: parser,
	    },
	    [Minimap], // The modules to load
    );
</script>
</html>
```

You can now start your dev server and a interactive canvas should be right in the body.

## 📦 Full Version

You should always choose this version for serious uses. It provides the viewer itself, all modules, development kit, and prerendering / Vite / React / Preact / Vue bridges. Also, you can enjoy modern tooling, full customizability and resource efficiency.

### Setup

The packages to install depends on your project, see the following checklist:

- Uses vanilla JS: `json-canvas-viewer`
- Uses React: `@json-canvas-viewer/react`
- Uses Vue: `@json-canvas-viewer/vue`
- Uses Preact: `@json-canvas-viewer/preact`
- Uses Vite as bundler: `vite-plugin-json-canvas`

### Vite

Vite is supported to enable build-time canvas parsing, which can significantly improve the performance of canvas rendering and reduce the bundle size. With the plugin, you can directly import a canvas file by `import yourCanvas from 'path/to/your.canvas';`.

```TypeScript
// vite.config.ts or vite.config.js
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';

export default defineConfig({
	plugins: [canvas()],
});
```

The plugin accepts any markdown parser that inputs and outputs a string. You can set it to `(md) => md` to disable parsing.

### Non-Vite

Even if without Vite, if your bundler supports JSON import, you can change the extension of your canvas file to `.json` and import it as a JSON file, then use client-side parsing with the `parser` option.

If JSON import is also impossible, you can use the `fetchCanvas()` function to fetch the canvas file and parse it.

```TypeScript
import { JSONCanvasViewer, Minimap, fetchCanvas, parser } from 'json-canvas-viewer';

import canvas from 'path/to/your-canvas.json'; // if JSON import is supported
const canvas = await fetchCanvas('path/to/your-canvas.json'); // if JSON import is not supported

new JSONCanvasViewer({
	container: document.body, // The element to attach the viewer to
	canvas,
    parser,
});
```

For convenience, later this document will use the Vite way in examples, adapt accordingly.

### Vanilla JS/TS

Instantiate the viewer:

```TypeScript
import { JSONCanvasViewer, Minimap } from 'json-canvas-viewer';
import canvasData from 'path/to/your.canvas';

new JSONCanvasViewer(
	{
		container: document.body, // The element to attach the viewer to
		canvas: canvasData, // The path to the canvas to load
	},
	[Minimap], // The modules to load
);
```

And the viewer should be right there, you can instantiate the viewer multiple times to render multiple canvases.

### React

The `@json-canvas-viewer/react` package exports a `JSONCanvasViewerComponent` component that wraps around the viewer. It additionally re-exports everything exported from the `json-canvas-viewer` package, so you don't need to install the `json-canvas-viewer` package.

```tsx
import { JSONCanvasViewerComponent } from '@json-canvas-viewer/react';
import canvas from 'path/to/your.canvas';

export function App() {
  return <JSONCanvasViewerComponent canvas={canvas} />;
}
```

The component exposes the viewer instance via component reference in the `viewer` field.

### Preact

We've also crafted a Preact component (`@json-canvas-viewer/preact`) that wraps around the viewer. It also re-exports everything exported from the `json-canvas-viewer` package. Its usage is almost the same as React.

```tsx
import { JSONCanvasViewerComponent } from '@json-canvas-viewer/react';
import canvas from 'path/to/your.canvas';

export function App() {
  return <JSONCanvasViewerComponent canvas={canvas} />;
}
```

The component exposes the viewer instance via component reference in the `viewer` field.

### Vue 3

Except for the `JSONCanvasViewerComponent`, this package additionally re-exports everything from the `json-canvas-viewer`, so you do not need to install the core package separately.

```vue
<script setup>
import { JSONCanvasViewerComponent } from '@json-canvas-viewer/vue';
import canvas from 'path/to/your.canvas';
</script>

<template>
  <Suspense>
    <!-- Suspense is crucial -->
    <JSONCanvasViewerComponent :canvas="canvas" />
  </Suspense>
</template>
```

The component exposes the viewer instance via component reference in the `viewer` field.

---

**Read Next**: [Construction Details](2-🏗️-Construction-Details.md)
