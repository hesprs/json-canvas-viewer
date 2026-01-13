<h1 align="center">
    <img src="assets/logo.svg" alt="JSON Canvas Viewer logo" width="280px">
    <br />
    JSON Canvas Viewer
    <br />
</h1>

<h4 align="center">An extensible web-based viewer for JSON Canvas</h4>

<p align="center">
    <a href="https://www.npmjs.com/package/json-canvas-viewer">
        <img src="https://img.shields.io/npm/v/json-canvas-viewer?logo=npm&labelColor=red&logoColor=white&color=333333" alt="npm">
    </a>
    <a href="https://bundlephobia.com/package/json-canvas-viewer">
        <img src="https://img.shields.io/bundlephobia/minzip/json-canvas-viewer?style=flat&logo=webpack&labelColor=orange&logoColor=white&color=333333&label=Minified%2bGzipped" alt="Gzipped + Minified Size">
    </a>
    <a href="https://github.com/hesprs/json-canvas-viewer/actions">
        <img src="https://img.shields.io/github/actions/workflow/status/hesprs/json-canvas-viewer/ci.yml?style=flat&logo=github&logoColor=white&label=CI&labelColor=d4ab00&color=333333" alt="ci">
    </a>
    <a href="https://www.codefactor.io/repository/github/hesprs/json-canvas-viewer">
        <img src="https://img.shields.io/codefactor/grade/github/hesprs/json-canvas-viewer?style=flat&logo=codefactor&logoColor=white&label=Code%20Quality&labelColor=17b37a&color=333333" alt="CodeFactor">
    </a>
    <img src="https://img.shields.io/badge/Types-Strict-333333?logo=typescript&labelColor=blue&logoColor=white" alt="TypeScript">
    <a href="https://snyk.io/test/npm/json-canvas-viewer">
        <img src="https://img.shields.io/badge/Snyk%20Security-Monitored-333333?logo=snyk&style=flat&labelColor=8A2BE2&logoColor=white" alt="Snyk Security">
    </a>
    <a href="https://github.com/hesprs/json-canvas-viewer/wiki">
        <img src="https://img.shields.io/badge/Documentation-Ready-333333?labelColor=5C73E7&logo=github&logoColor=white" alt="Documentation">
    </a>
    <img src="https://img.shields.io/badge/%F0%9F%96%90%EF%B8%8F%20Made%20by-Humans-333333?labelColor=25C260" alt="Made by Humans">
</p>

<p align="center">
    <a href="https://hesprs.github.io/json-canvas-viewer">
        <strong>Demo</strong>
    </a> • 
    <a href="https://github.com/hesprs/json-canvas-viewer/wiki">
        <strong>Documentation</strong>
    </a> • 
    <a href="https://jsoncanvas.org/">
        <strong>About JSON Canvas</strong>
    </a>
</p>

## 🐶 Features

- View JSON Canvas files (`.canvas`) in a web browser
- Embed into websites easily
- Interactive pan and zoom functionality
- Can display 100% of canvas features described in the [official spec](https://jsoncanvas.org/spec/1.0/)
- Responsive design with mobile and touchpad adaptation
- Supports Lazy loading
- TypeScript native
- Seamless integration with Vite, Vue, React or vanilla JS.
- [Supports Server-side rendering (SSR)](https://github.com/hesprs/json-canvas-viewer/wiki/4-%F0%9F%96%87%EF%B8%8F-SSR-and-Bridges#server-side-rendering)
- 🔥 More performant than rendering canvases in Obsidian!
- 🧩 Out-of-the-box extensibility and tree-shaking, current optional modules include:
  - [`Minimap`](https://github.com/hesprs/json-canvas-viewer/wiki/3-%F0%9F%A7%A9-Modules#minimap) for easy navigation
  - [`Controls`](https://github.com/hesprs/json-canvas-viewer/wiki/3-%F0%9F%A7%A9-Modules#controls) displays zoom in/out and fullscreen buttons
  - [`MistouchPreventer`](https://github.com/hesprs/json-canvas-viewer/wiki/3-%F0%9F%A7%A9-Modules#mistouch-preventer) prevents the canvas from intercepting page scroll.
  - [`DebugPanel`](https://github.com/hesprs/json-canvas-viewer/wiki/3-%F0%9F%A7%A9-Modules#debug-panel) displays scale and position data.

## 🚀 Quick Start

### Setup

You firstly need a markdown-to-HTML parser, which is of the type below:

```TypeScript
type MarkdownParser = (markdown: string) => string | Promise<string>;
```

For demonstration only, we'll use [Marked](https://github.com/markedjs/marked). **Note that `marked` is a development dependency only, when configured correctly, markdown parsing will happen only at build time.**

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
- ease for later framework integration and SSR

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

## 🤝 Get Involved

This project welcomes anyone that have ideas to improve it.

- [Open a pull request](https://github.com/hesprs/pointeract/compare) for a new module, documentation update, and so on.
- [Open an issue](https://github.com/hesprs/pointeract/issues/new) if you find a bug.
- [Start a new thread in Discussions](https://github.com/hesprs/pointeract/discussions/new) if you have feature requests or questions, please avoid posting them in Issues.
- [Report a vulnerability](https://github.com/hesprs/pointeract/security/advisories/new) if you find one, please do not disclose it publicly.

## 📝 Copyright & License

Copyright ©️ 2025-2026 Hesprs (Hēsperus) | [MIT License](https://mit-license.org/)
