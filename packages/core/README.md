<h1 align="center">
    <img src="../../assets/logo.svg" alt="JSON Canvas Viewer logo" width="280px">
    <br />
    JSON Canvas Viewer
    <br />
</h1>

<h4 align="center">An extensible web-based viewer for JSON Canvas</h4>

<p align="center">
    <a href="https://github.com/hesprs/json-canvas-viewer/wiki">
        <strong>Documentation</strong>
    </a> • 
    <strong>Vanilla</strong> • 
    <a href="https://www.npmjs.com/package/vite-plugin-json-canvas">
        <strong>Vite Plugin</strong>
    </a> • 
    <a href="https://www.npmjs.com/package/@json-canvas-viewer/react">
        <strong>React Component</strong>
    </a> • 
    <a href="https://www.npmjs.com/package/@json-canvas-viewer/vue">
        <strong>Vue Component</strong>
    </a> • 
    <a href="https://www.npmjs.com/package/@json-canvas-viewer/preact">
        <strong>Preact Component</strong>
    </a>
</p>

## ✏️ Description

This is the core package of JSON Canvas Viewer, contains the vanilla viewer class, all modules and development kit.

Install this package if you want to use JSON Canvas Viewer in a **vanilla JavaScript / TypeScript** project. If you are using a framework, please head to the corresponding package in the navigation bar above.

## 📦 Installation

Install with your favorite package manager:

```bash
npm add json-canvas-viewer

# or
pnpm add json-canvas-viewer

# or
yarn add json-canvas-viewer

# or
bun add json-canvas-viewer
```

Now you have two options: **build-time** canvas parsing or **client-side** canvas parsing.

### Build-time Canvas Parsing

This is the recommended way to parse canvas data, it will result in significantly smaller bundle size and faster load times.

Firstly, you need a bundler. JSON Canvas Viewer currently supports [Vite](https://vitejs.dev/) only. Please install [Vite Plugin](https://www.npmjs.com/package/vite-plugin-json-canvas) and setup it.

After bundler setup, you can directly import a canvas file and use it in viewer instantiation:

```Typescript
import { JSONCanvasViewer } from 'json-canvas-viewer';
import canvas from 'path/to/your.canvas';

const container = document.getElementById('container') as HTMLElement;
new JSONCanvasViewer({ canvas, container });
```

### Client-side Canvas Parsing

This method doesn't require any bundler setup. You just need to import the parser and fetch the canvas file:

```Typescript
import { parser, fetchCanvas, JSONCanvasViewer } from 'json-canvas-viewer';

const container = document.getElementById('container') as HTMLElement;
new JSONCanvasViewer({
    container,
    parser,
    canvas: await fetchCanvas('path/to/your.canvas'),
});
```

Refer to the [documentation](https://github.com/hesprs/json-canvas-viewer/wiki/) for more details.

## 📝 Copyright & License

Copyright ©️ 2025-2026 Hesprs (Hēsperus) | [MIT License](https://mit-license.org/)
