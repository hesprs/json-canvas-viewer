<h1 align="center">
    <img src="../../assets/logo.svg" alt="JSON Canvas Viewer logo" width="280px">
    <br />
    JSON Canvas Viewer React
    <br />
</h1>

<h4 align="center">JSON Canvas Viewer as a React component</h4>

<p align="center">
    <a href="https://github.com/hesprs/json-canvas-viewer/wiki">
        <strong>Documentation</strong>
    </a> • 
    <a href="https://www.npmjs.com/package/json-canvas-viewer">
        <strong>Vanilla</strong>
    </a> • 
    <a href="https://www.npmjs.com/package/vite-plugin-json-canvas">
        <strong>Vite Plugin</strong>
    </a> • 
    <strong>React Component</strong> • 
    <a href="https://www.npmjs.com/package/@json-canvas-viewer/vue">
        <strong>Vue Component</strong>
    </a> • 
    <a href="https://www.npmjs.com/package/@json-canvas-viewer/preact">
        <strong>Preact Component</strong>
    </a>
</p>

## ✏️ Description

This is the React component of JSON Canvas Viewer, it wraps around the vanilla viewer class to provide a seamless integration with React. This package additionally re-exports everything from the core package, so you do not need to install the core package separately.

Install this package if you want to use JSON Canvas Viewer in a **React** project. If you are not using it, please head to the corresponding package in the navigation bar above.

## 📦 Installation

Install with your favorite package manager:

```bash
npm add @json-canvas-viewer/react

# or
pnpm add @json-canvas-viewer/react

# or
yarn add @json-canvas-viewer/react

# or
bun add @json-canvas-viewer/react
```

Now you have two options: **build-time** canvas parsing or **client-side** canvas parsing.

### Build-time Canvas Parsing

This is the recommended way to parse canvas data, it will result in significantly smaller bundle size and faster load times.

Firstly, you need a bundler. JSON Canvas Viewer currently supports [Vite](https://vitejs.dev/) only. Please install [Vite Plugin](https://www.npmjs.com/package/vite-plugin-json-canvas) and setup it.

After bundler setup, you can directly import a canvas file and use it in viewer instantiation:

```tsx
import { JSONCanvasViewerComponent } from '@json-canvas-viewer/react';
import canvas from 'path/to/your.canvas';

export function App() {
  return <JSONCanvasViewerComponent canvas={canvas} />;
}
```

### Client-side Canvas Parsing

This method doesn't require any bundler setup. You just need to import the parser and fetch the canvas file:

```tsx
import { JSONCanvasViewerComponent, fetchCanvas, parser } from '@json-canvas-viewer/react';

export async function App() {
  return (
    <JSONCanvasViewerComponent
      canvas={await fetchCanvas('path/to/your.canvas')}
      options={{ parser }}
    />
  );
}
```

Refer to the [documentation](https://github.com/hesprs/json-canvas-viewer/wiki/) for more details.

## 📝 Copyright & License

Copyright ©️ 2025-2026 Hesprs (Hēsperus) | [MIT License](https://mit-license.org/)
