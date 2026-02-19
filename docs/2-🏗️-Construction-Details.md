## Constructor Arguments

The constructor receives arguments `(options, modules?)`.

### `options`

An object that lets you customize the viewer. Its type grows as you use more modules by using advanced generics. Here are the options that are available without any modules:

```TypeScript
{
    container: HTMLElement,
    canvas?: JSONCanvas,
    theme?: 'light' | 'dark',
    attachmentDir?: string,
    markdownParser?: (markdown: string) => string | Promise<string>,
    extraCSS?: string,
    noShadow?: boolean,
    loading?: 'normal' | 'lazy' | 'none',
    zoomInOptimization?: boolean,
    pointeract?: PointeractOptions,
}
```

`container` (required): the HTML element to attach the viewer to.

`canvas`: the canvas object.

- Default: an empty canvas will be used.
- **You can obtain it from `fetchCanvas` (in chimp version) or importing canvas file (in full version)**.

`attachmentDir`: the directory of attachments (images or other media files in the canvas).

- Default: `./`
- If using relative path, the path is relative to the file where instantiation happens.
- **Please put all your attachments in this directory, wherever they originally are**.

`markdownParser`: the markdown parser.

- Default: `(markdown: string) => markdown`
- In full version, this is unnecessary since the canvas is already parsed during build time.
- In chimp version, it is required, and the chimp version exports a ready-to-use `parser`.

`extraCSS`: extra CSS string to be injected into the viewer.

- Default: `''`
- Please import your CSS as strings (e.g. `import css from 'path/to/your.css?inline` if you are using Vite).

`noShadow`: whether to put the viewer directly in light DOM.

- Default: `false`

`loading`: how to lead the canvas.

- Default: `normal`
- `none`: disables loading, you need to manually call `JSONCanvasViewer.load()`.
- `lazy`: delays loading until the viewer is about to enter the user's viewport.
- `normal`: loads the canvas immediately after instantiation.

`zoomInOptimization`: whether to reuse previous renders if the viewport of next frame is absolutely inside the previous one.

- Default: `false`
- This can de facto improve the performance when zooming in, however it may introduce visual inconsistency and jerking.

`pointeract`: options passed to `pointeract`, the user interaction resolver.

- For more information, please refer to [its documentation](https://pointeract.consensia.cc/).

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
  shiftFullscreen(option?: 'enter' | 'exit'): void;
  zoom(factor: number): void;
  zoomToScale(scale: number): void;
}
```

`container`: the DI container.

- The viewer uses dependency injection internally. Accessing the container unlocks the full potential of customization.

`options`: the reference of the `options` object you passed to the constructor.

- You can change the options you passed to the viewer here. Note that only some fields can be responsive during runtime.

`changeTheme()`: shift between dark and light theme.

- If no theme provided, toggle the theme.

`dispose()`: cleans up and removes the viewer from DOM.

`load()`: load or reload a canvas into the viewer.

- You can change the canvas by passing an argument to it. A typical use case is to pass a new `canvas` object (and potentially `attachmentDir`) to load a new canvas on an existing viewer.
- The key to [loading and reloading](#loading-and-reloading).
- Can be configured via `loading` option.

`pan()`: pan the canvas by specified delta.

`panToCoords()`: pan the canvas to specified coordinates.

`refresh()`: trigger a rerender.

`resetView()`: adjust the scale and offsets so that the user can see all canvas content.

`shiftFullscreen()`: exit or enter the fullscreen.

- If no theme provided, toggle the fullscreen state.

`zoom()`: zoom the canvas by a specified factor.

`zoomToScale()`: zoom the canvas to a specified scale.

## Loading and Reloading

JSON Canvas Viewer requires two stages to load a canvas - **construction stage** and **loading stage**.

During construction, the viewer itself and all modules are instantiated, this is done when you instantiate the viewer. After construction, the viewer is ready to plug any canvas file.

Loading happens after construction. If your `loading` is unset or `normal`, loading will happen immediately, otherwise it will happen when `load()` is called via lazy loading or yourself. During loading, the canvas data will be processed, the rendering loops are started and eventListeners are attached.

To load or reload a new canvas, simply call `load()` again. Everything will be updated efficiently on the existing viewer.

## Accessing Types

Sometimes you may need to access the options type without truly instantiating a viewer. The viewer has an exported `Options` type that can be used for this. You can also pass modules to it:

```ts
import type { Options } from 'json-canvas-viewer';
import { Minimap, MistouchPreventer } from 'json-canvas-viewer/modules';
type MyOptions = Options<[Minimap, MistouchPreventer]>;
```

The `MyOptions` type above is the type of the options object can be passed to the viewer that loads the `Minimap` and `MistouchPreventer` optional modules.

> [!TIP]
> `Options` type is designed to be flexible, it accepts an array of either module constructors or their instances, for example:
>
> ```TypeScript
> import { Minimap, MistouchPreventer } from "json-canvas-viewer/modules";
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
