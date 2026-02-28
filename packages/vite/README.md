<h1 align="center">
    Vite Plugin for JSON Canvas
    <br />
</h1>

<h4 align="center">Load and parse JSON Canvas via Vite.</h4>

<p align="center">
    <a href="https://github.com/hesprs/json-canvas-viewer/wiki">
        <strong>Documentation</strong>
    </a> • 
    <a href="https://www.npmjs.com/package/json-canvas-viewer">
        <strong>Vanilla</strong>
    </a> • 
    <strong>Vite Plugin</strong> • 
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

This is the Vite plugin for JSON Canvas (`.canvas`) file. It allows you to directly import a canvas as an object by `import yourCanvas from 'path/to/your.canvas';`. It also parses all the markdown content in the canvas to HTML by default (can be disabled).

Install this package if you want to use Vite as your bundler. If you are not using it, please head to the corresponding package in the navigation bar above.

## 📦 Installation

Install with your favorite package manager:

```bash
npm add vite-plugin-json-canvas -D

# or
pnpm add vite-plugin-json-canvas -D

# or
yarn add vite-plugin-json-canvas -D

# or
bun add vite-plugin-json-canvas -D
```

Then in your `vite.config.ts` or `vite.config.js`:

```TypeScript
import { defineConfig } from 'vite';
import canvas from 'vite-plugin-json-canvas';

export default defineConfig({
	plugins: [canvas()],
});
```

`vite-plugin-json-canvas` uses `marked` as the parser by default. So you can customize the parser by `marked.use()`.

The plugin accepts an argument to customize the parser. You can pass anything that inputs and outputs a string. To disable parsing, for example, just pass in `(md) => md`.

## 📝 Copyright & License

Copyright ©️ 2025-2026 Hesprs (Hēsperus) | [MIT License](https://mit-license.org/)
