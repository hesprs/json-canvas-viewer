We provide you two versions of JSON Canvas Viewer - `chimp` version and `full` version.

## 🐒 Chimpanzee Version

This version is specially built for fast trials and environments that do not have bundlers or package managers. It has everything integrated into one file, enabling you to use within seconds. However, it's **not recommended** for production use since it does not support deep customization or tree-shaking.

### Setup

Create an HTML file and download the package:

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
    import { JSONCanvasViewer } from 'https://unpkg.com/json-canvas-viewer/dist/chimp.js';
</script>
</html>
```

When using CJS version, please use URL `https://unpkg.com/json-canvas-viewer/dist/chimp.cjs` to obtain the package.

Also prepare your `.canvas` file.

## Instantiation

The chimp version has everything prepared for you, including a lightweight and secure runtime markdown parser, a canvas loader and [four optional modules](3-🧩-Modules.md). You almost always need the parser and loader, but you can choose modules according to preference.

```JavaScript
import { JSONCanvasViewer, parser, loadCanvas, Minimap } from 'https://unpkg.com/json-canvas-viewer/dist/chimp.js';

new JSONCanvasViewer(
	{
		container: document.body, // The element to attach the viewer to
		canvas: loadCanvas('path/to/your.canvas'),
        markdownParser: parser,
	},
	[Minimap], // The modules to load
);
```

You can now start your dev server and a interactive canvas should be right in the body.

## 📦 Full Version

You should always choose this version for serious uses. It provides the viewer itself, all modules, development kit, and Vite/prerendering bridges. Also, you can enjoy modern tooling, full customizability and resource efficiency.

### Setup

You firstly need a markdown-to-HTML parser, which is of the type below:

```TypeScript
type MarkdownParser = (markdown: string) => string | Promise<string>;
```

For demonstration only, we'll use [Marked](https://github.com/markedjs/marked). **Note that `marked` will be a development dependency, when configured correctly, markdown parsing will happen only at build time.**

Then we recommend using your favourite package manager to install the package.

```sh
# npm
npm add json-canvas-viewer
npm add marked -D

# pnpm
pnpm add json-canvas-viewer
pnpm add marked -D

# yarn
yarn add json-canvas-viewer
yarn add marked -D
```

You also need to configure your bundler to support seamless canvas resolution. Currently, we only support Vite:

```TypeScript
// vite.config.ts
import { defineConfig } from 'vite';
import { jsonCanvasVitePlugin } from 'json-canvas-viewer/bridges';
import  { marked } from 'marked';

export default defineConfig({
    // ... your other config
    plugins: [
        jsonCanvasVitePlugin(marked),
        // ... your other plugins
    ]
})
```

The argument is any markdown parser, when empty, build-time parsing is disabled.

The setup above gives you:
- bundler resolution of `.canvas` file as modules
- build-time parsing of `.canvas` files (less client-side overhead)
- ease for later framework integration and prerendering

### Instantiation

Instantiate the viewer:

```TypeScript
import { JSONCanvasViewer } from 'json-canvas-viewer';
import { Minimap } from 'json-canvas-viewer/modules';
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

---

**Next Read**: [Construction Detail](2-🏗️-Construction-Details.md)