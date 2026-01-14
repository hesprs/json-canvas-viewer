## Constructor Arguments

The constructor receives arguments `(options, modules?)`.

### `options`

An object that lets you customize the viewer. Its type grows as you use more modules by using advanced generics. Here are the options with default values that are available without any modules:

```TypeScript
{
    container: <HTMLElement>,
    canvas: <JSONCanvas>,
    attachmentDir?: './',
    markdownParser?: (markdown: string) => markdown,
    extraCSS?: '',
    noShadow?: false,
    lazyLoading?: false,
    pointeract?: <PointeractOptions>,
}
```

- `container`: the HTML element to attach the viewer to.
- `canvas`: the canvas object. **You can obtain it from `loadCanvas` (in chimp version) or importing canvas file (in full version)**.
- `attachmentDir`: the directory of attachments, if there are any images or other media files in your canvas, you may need it. The path is relative to the file where instantiation happens. **Please put all your attachments in this directory, wherever they originally are**.
- `markdownParser`: the markdown parser. In full version, this is unnecessary since the canvas is already parsed during build time, but in chimp version, it is required. The default value simply returns the input.
- `extraCSS`: extra CSS string to be injected into the viewer, please import your CSS as strings (e.g. `import css from 'path/to/your.css?inline` if you are using Vite).
- `noShadow`: whether to put the viewer directly in light DOM.
- `lazyLoading`: whether to load the canvas only when the canvas is visible.
- `pointeract`: options passed to `pointeract`, the user interaction resolver. **For more information, please refer to [its documentation](https://pointeract.consensia.cc/)**.

### `modules`

An array of modules to load, currently available modules are documented in [Modules](3-🧩-Modules.md).

## Public Methods & Properties

- `viewer.dispose()`: cleans up and removes the viewer from DOM.
- `viewer.container`: the DI container, the viewer uses dependency injection internally. Accessing the container unlocks the full potential of customization.

## Accessing Option Type

Sometimes you may need to access the options type without truly instantiating a viewer. The viewer has an exported `Options` type that can be used for this. You can also pass modules to it:

```ts
import type { Options } from "json-canvas-viewer";
import { Minimap, MistouchPreventer } from "json-canvas-viewer/modules";
type MyOptions = Options<[Minimap, MistouchPreventer]>;
```

The `MyOptions` type above is the type of the options object can be passed to the viewer that loads the `Minimap` and `MistouchPreventer` optional modules.

> [!TIP]
> `Options` type is designed to be flexible, it accepts an array of either module constructors or their instances, for example:
>
> ``` TypeScript
> import { Minimap, MistouchPreventer } from "json-canvas-viewer/modules";
> import type { Options } from "json-canvas-viewer";
>
> type MyOptions1 = Options<[Minimap, MistouchPreventer]>;
> type MyOptions2 = Options<[typeof Minimap, typeof MistouchPreventer]>;
> ```
>
> In the above example, `MyOptions1` and `MyOptions2` are equivalent.

---

**Next Read**: [Modules](3-🧩-Modules.md)