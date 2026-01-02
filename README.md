# JSON Canvas Viewer

[![npm](https://img.shields.io/npm/v/json-canvas-viewer?logo=npm&labelColor=red&logoColor=white&color=333333)](https://www.npmjs.com/package/json-canvas-viewer)
[![Gzipped + Minified Size](https://img.shields.io/bundlephobia/minzip/json-canvas-viewer?style=flat&logo=webpack&labelColor=orange&logoColor=white&color=333333&label=Minified%2bGzipped)](https://bundlephobia.com/package/json-canvas-viewer)
[![ci](https://img.shields.io/github/actions/workflow/status/hesprs/json-canvas-viewer/ci.yml?style=flat&logo=github&logoColor=white&label=CI&labelColor=d4ab00&color=333333)](https://github.com/hesprs/json-canvas-viewer/actions)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/hesprs/json-canvas-viewer?style=flat&logo=codefactor&logoColor=white&label=Code%20Quality&labelColor=17b37a&color=333333)](https://www.codefactor.io/repository/github/hesprs/json-canvas-viewer)
![TypeScript](https://img.shields.io/badge/Types-Strict-333333?logo=typescript&labelColor=blue&logoColor=white)
[![Snyk Security](https://img.shields.io/badge/Snyk%20Security-Monitored-333333?logo=snyk&style=flat&labelColor=8A2BE2&logoColor=white)](https://snyk.io/test/npm/json-canvas-viewer)
[![Documentation](https://img.shields.io/badge/Documentation-Ready-333333?labelColor=5C73E7&logo=github&logoColor=white)](https://github.com/hesprs/json-canvas-viewer/wiki)
![Made by Humans](https://img.shields.io/badge/%F0%9F%96%90%EF%B8%8F%20Made%20by-Humans-333333?labelColor=25C260)

![Canvas Viewer](test/preview.png)

A **TypeScript-based** viewer for **JSON Canvas** files. View and interact with your canvas files directly in the browser, or embed the viewer in front-end projects with ease. It is built without frameworks so it can be easily integrated into any framework.

This project is derived from [sofanati-nour/obsidian-canvas-web-renderer](https://github.com/sofanati-nour/obsidian-canvas-web-renderer), but is far more developed and optimized.

- **Documentation**: [project wiki](https://github.com/hesprs/json-canvas-viewer/wiki)
- **More about JSON Canvas**: [jsoncanvas.org](https://jsoncanvas.org/)

## 🐶 Features

- View JSON Canvas files (`.canvas`) in a web browser
- Full markdown syntax support (auto-parsed to HTML)
- Embed into websites easily
- Interactive pan and zoom functionality
- Support for different node types:
  - Text nodes
  - File nodes (including Markdown files)
  - Link nodes (embedded web content)
  - Group nodes with custom colors
- Edge connections between nodes with labels
- Minimap for easy navigation (optional extension)
- Mistouch prevention (optional extension)
- Responsive design with mobile and touchpad adaptation
- TypeScript native support
- [Server-side rendering (**SSR**) support](https://github.com/hesprs/json-canvas-viewer/wiki/4-%F0%9F%A7%91%E2%80%8D%F0%9F%92%BB-Development#server-side-rendering)
- 🧩 Out-of-the-box **extensibility** and tree-shaking
- 🔥 **More performant** than rendering canvases in Obsidian!

## 🚀 Quick Start

We recommend using your favourite package manager to install the package.

```sh
# npm
npm add json-canvas-viewer

# pnpm
pnpm add json-canvas-viewer

# yarn
yarn add json-canvas-viewer
```

Or include the following lines directly in your HTML file:

```html
<script type="module">
    import { JSONCanvasViewer } from 'https://unpkg.com/json-canvas-viewer/dist/index.js';
</script>
```

This link ships the latest ESM version by default, to access CJS version or earlier versions, try using a different URL like:

```html
<script src="https://unpkg.com/json-canvas-viewer@3.2.0/dist/index.cjs"></script>
```

The link above ships version 3.2.0 in CJS.

Then we can instantiate the viewer:

```TypeScript
import { Controls, JSONCanvasViewer, Minimap, MistouchPreventer } from 'json-canvas-viewer';

new JSONCanvasViewer(
	{
		container: document.body, // The element to attach the viewer to
		canvasPath: './Example/introduction.canvas', // The path to the canvas to load
		controlsCollapsed: true, // Other options, depending on the modules you passed in
		mistouchPreventer: {
			preventAtStart: false,
		},
	},
	[Controls, Minimap, MistouchPreventer], // The modules to load
);
```

And the viewer should be right in the body, you can instantiate the viewer multiple times to render multiple canvases.

## 📝 Copyright & License

Copyright ©️ 2025-2026 Hesprs (Hēsperus) | [MIT License](https://mit-license.org/)
