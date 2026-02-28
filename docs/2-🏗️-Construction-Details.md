## Constructor Arguments

The constructor receives arguments `(options, modules?)`.

### `options`

An object that lets you customize the viewer. Its type grows as you use more modules by using advanced generics. Here are the options that are available without any modules:

```TypeScript
interface Options {
    container: HTMLElement;
    canvas?: JSONCanvas;
    theme?: 'light' | 'dark';
    attachments?: Record<string, string>;
    attachmentDir?: string;
    noAttachmentRelocation?: boolean;
    markdownParser?: (markdown: string) => string | Promise<string>;
    extraCSS?: string;
    shadowed?: boolean;
    loading?: 'normal' | 'lazy' | 'none';
    zoomInOptimization?: boolean;
    pointeract?: PointeractOptions;
    colors?: {
        light?: Colors;
        dark?: Colors;
    };
    nodeComponents?: {
        [Key: 'text' | 'image' | 'audio' | 'video' | 'link' | 'markdown']: (
            container: HTMLDivElement,
	        content: string,
	        node: N,
	        onBeforeUnmount: Hook,
	        onActive: Hook,
	        onLoseActive: Hook,
        ) => void;
    }
}

interface Colors {
    '0'?: string;
    '1'?: string;
    '2'?: string;
    '3'?: string;
    '4'?: string;
    '5'?: string;
    '6'?: string;
    dots?: string;
    text?: string;
    background?: string;
    'background-secondary'?: string;
    shadow?: string;
    border?: string;
}
```

**`container` (required)**: the HTML element to attach the viewer to.

- This option is not needed and non-existent in React/Preact/Vue components.

**`canvas`**: the canvas object.

- Default: an empty canvas will be used.
- **You can obtain it from `fetchCanvas` (in chimp version) or importing canvas file (in full version)**.
- This option is elevated to a **component property** in the React/Vue/Preact components and supports reactive updates.

**`theme`**: choose light or dark theme.

- Default: `light`
- This option is elevated to a **component property** in the React/Vue/Preact components and supports reactive updates.

**`attachments`**: remaps attachment file names with their true locations.

- Attachments are files like external markdown notes, images or other media files embedded in the canvas.
- The file path of attachments in a canvas directly exported from Obsidian is always inaccurate, thus remapping them is necessary.
- This option is to make you able to assign the attachment URLs individually.
- Keys are the file names + extensions (e.g., `photo.png`), values are the true file paths (e.g. `./photos/photo.png`).
- If using relative path, the path is relative to the file where instantiation happens.
- This option is elevated to a **component property** in the React/Vue/Preact components and supports reactive updates.

**`attachmentDir`**: the directory of attachments.

- Default: `./`
- This option lets you specify the directory where attachments are stored, so that you don't need to manually remap them with `attachments`.
- If using relative path, the path is relative to the file where instantiation happens.
- **Please put all your attachments in this directory, wherever they originally are**. You can still control individual attachments' paths using `attachments`.
- This option is elevated to a **component property** in the React/Vue/Preact components and supports reactive updates.

**`noAttachmentRelocation`**: disables attachment relocation

- Default: `false`
- The paths to attachments are kept as-is.
- You can still control individual attachments' paths using `attachments`.

**`markdownParser`**: the markdown parser.

- Default: `(markdown: string) => markdown`
- In full version, this is unnecessary since the canvas is already parsed during build time.
- In chimp version, it is required, and the chimp version exports a ready-to-use `parser`.

**`extraCSS`**: extra CSS string to be injected into the viewer.

- Default: `''`
- Please import your CSS as strings (e.g. `import css from 'path/to/your.css?inline` if you are using Vite).
- You can directly write global CSS to stylize the viewer.

**`shadowed`**: whether to put the viewer in a shadow DOM.

- Default: `false`
- By default, the viewer is rendered in the global DOM. CSS isolation is achieved scoping CSS within a CSS class `.JSON-Canvas-Viewer`.

**`loading`**: how to lead the canvas.

- Default: `normal`
- `none`: disables loading, you need to manually call `JSONCanvasViewer.load()`.
- `lazy`: delays loading until the viewer is about to enter the user's viewport.
- `normal`: loads the canvas immediately after instantiation.

**`zoomInOptimization`**: whether to reuse previous renders if the viewport of next frame is absolutely inside the previous one.

- Default: `false`
- This can de facto improve the performance when zooming in, however it may introduce visual inconsistency and jerking.

**`pointeract`**: options passed to `pointeract`, the user interaction resolver.

- For more information, please refer to [its documentation](https://pointeract.consensia.cc/).

**`colors`**: customize the color palette used in the viewer.

- `0` to `6`: customize the 6 pre-defined colors + `0` for the default one in JSON Canvas. Supports HSL, RGB, RGBA, and HEX(`#`) color strings.
- Others: shown by their names, the color of other parts of the viewer. Supports any CSS color string.

**`nodeComponents`**: render nodes with your own components.

- If any of the fields is defined, the default node will not be rendered. Instead, you can render your own node.
- Each field is a function that passes the container element, the content and the node to you.
- The content is parsed HTML string for `text` nodes, file path for other nodes.
- With this option, you can render any component inside JSON Canvas Viewer. This option is elevated into five component properties `text`, `image`, `file`, `link` and `markdown` in React and Preact components. In Vue, they are present as five named and scoped slots. **Note that in component builds, you won't see the `container` and `onBeforeUnmount` arguments since they are handled internally and automatically.**

- To use them in React/Preact:

```tsx
import canvas from 'path/to/your.canvas';
import Viewer from '@json-canvas-viewer/react'; // or '@json-canvas-viewer/preact'

export default function component() {
	return (
		<Viewer
			canvas={canvas}
			text={(/* you can receive arguments here */) => <p>this is a React/Preact component</p>} // you can pass any component here
		></Viewer>
	);
}
```

- To use them in Vue:

```vue
<script setup lang="ts">
import canvas from 'path/to/your.canvas';
import Viewer from '@json-canvas-viewer/vue';
</script>

<template>
	<Suspense>
		<Viewer class="canvas-viewer" :canvas="canvas">
			<template #text="{ /* you can receive arguments here */ }">
				<p>This is a Vue component</p>
			</template>
		</Viewer>
	</Suspense>
</template>
```

### `modules`

An array of modules to load, currently available modules are documented in [Modules](3-🧩-Modules.md).

## Public Methods and Properties

```ts
interface JSONCanvasViewer {
  container: HTMLElement;
  options: JSONCanvasViewerOptions;
  changeTheme(theme?: 'dark' | 'light'): void;
  dispose(): void;
  load(options?: { canvas?: JSONCanvas; attachmentDir?: string }): void;
  pan(delta: { x: number; y: number }): void;
  panToCoords(coords: { x: number; y: number }): void;
  refresh(): void;
  resetView(): void;
  toggleFullscreen(option?: 'enter' | 'exit'): void;
  zoom(factor: number): void;
  zoomToScale(scale: number): void;
  onStart: Hook;
  onRestart: Hook;
  onDispose: Hook;
  onRefresh: Hook;
  onResize: Hook<[number, number]>;
  onToggleFullscreen: Hook<['enter' | 'exit']>;
  onChangeTheme: Hook<['light' | 'dark']>;
  onNodeActive: Hook<[JSONCanvasNode]>;
  onNodeLosesActive: Hook<[JSONCanvasNode]>;
}

export type Hook<Args extends GeneralArray = []> = {
  (...args: Args): void;
  subs: Set<(...args: Args) => void>;
  subscribe(callback: (...args: Args) => void): void;
  unsubscribe(callback: (...args: Args) => void): void;
};
```

### Properties

**`container`**: the DI container.

- The viewer uses dependency injection internally. Accessing the container unlocks the full potential of customization.

**`options`**: the reference of the `options` object you passed to the constructor.

- You can change the options you passed to the viewer here. Note that only some fields can be responsive during runtime.

### Methods

**`changeTheme()`**: shift between dark and light theme.

- If no theme provided, toggle the theme.

**`dispose()`**: cleans up and removes the viewer from DOM.

**`load()`**: load or reload a canvas into the viewer.

- You can change the canvas by passing an argument to it. A typical use case is to pass a new `canvas` object (and potentially `attachments` and `attachmentDir`) to load a new canvas on an existing viewer.
- The key to [loading and reloading](#loading-and-reloading).
- Can be configured via `loading` option.

**`pan()`**: pan the canvas by specified delta.

**`panToCoords()`**: pan the canvas to specified coordinates.

**`refresh()`**: trigger a rerender.

**`resetView()`**: adjust the scale and offsets so that the user can see all canvas content.

**`toggleFullscreen()`**: exit or enter the fullscreen.

- If no theme provided, toggle the fullscreen state.

**`zoom()`**: zoom the canvas by a specified factor.

**`zoomToScale()`**: zoom the canvas to a specified scale.

### Hook Methods

These are **methods with properties**:

- `(method).subscribe()`: subscribe
- `(method).unsubscribe()`: unsubscribe
- `(method)()`: invocate the hook (call all subscribers)

Each hook can be subscribed for infinite times.

**`onStart()`**: called when the viewer is started (first time `load()` is called).

**`onRestart()`**: called when reloading a canvas (`load()` is called more than once).

**`onDispose()`**: called when the viewer is disposed.

**`onRefresh()`**: called each rerender.

**`onResize()`**: called when the size of the viewer container changes with arguments container width and height.

**`onToggleFullscreen()`**: called when entering or exiting fullscreen mode.

**`onChangeTheme()`**: called when changing light and dark theme.

**`onNodeActive()`**: called when a node is selected.

**`onNodeLosesActive()`**: called when a node loses selection (the user clicks outside).

## Loading and Reloading

JSON Canvas Viewer requires two stages to load a canvas - **construction stage** and **loading stage**.

During construction, the viewer itself and all modules are instantiated, this is done when you instantiate the viewer. After construction, the viewer is ready to plug any canvas file.

Loading happens after construction. If your `loading` is unset or `normal`, loading will happen immediately, otherwise it will happen when `load()` is called via lazy loading or yourself. During loading, the canvas data will be processed, the rendering loops are started and eventListeners are attached.

To load or reload a new canvas, simply call `load()` again. Everything will be updated efficiently on the existing viewer.

## Accessing Types

Sometimes you may need to access the options type without truly instantiating a viewer. The viewer has an exported `Options` type that can be used for this. You can also pass modules to it:

```ts
import { type Options, Minimap, MistouchPreventer } from 'json-canvas-viewer';
type MyOptions = Options<[Minimap, MistouchPreventer]>;
```

The `MyOptions` type above is the type of the options object can be passed to the viewer that loads the `Minimap` and `MistouchPreventer` optional modules.

> [!TIP]
> `Options` type is designed to be flexible, it accepts an array of either module constructors or their instances, for example:
>
> ```TypeScript
> import { Minimap, MistouchPreventer } from "json-canvas-viewer";
> import type { Options } from "json-canvas-viewer";
>
> type MyOptions1 = Options<[Minimap, MistouchPreventer]>;
> type MyOptions2 = Options<[typeof Minimap, typeof MistouchPreventer]>;
> ```
>
> In the above example, `MyOptions1` and `MyOptions2` are equivalent.

You can also find the JSON Canvas Viewer instance type by importing `JSONCanvasViewerInterface`, which accepts a type parameter of the same requirements to `Options`.

---

**Next Read**: [Modules](3-🧩-Modules.md)
