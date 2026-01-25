Development of modules on the infrastructure of `json-canvas-viewer` requires an understanding of [our source code](https://github.com/hesprs/json-canvas-viewer/tree/main/src) and architecture. Important points include:

- The entire viewer is built on an entry class `JSONCanvasViewer` and several modules.
- This project uses dependency injection to manage modules.
- Essential libraries used:
  - [`needle-di`](https://needle-di.io/): dependency injection library
  - [`pointeract`](https://pointeract.consensia.cc/): resolves user interactions

**Internal modules include**:

- `Controller`: controls the rendering loop
- `Renderer`: renders the non-interactive parts of the viewer
- `InteractionHandler`: handles user interactions
- `DataManager`: manages the canvas data and viewer states
- `OverlayManager`: manages interactive canvas elements
- `styleManager`: manages and applies colors and styles across the viewer

The full version of JSON Canvas Viewer offers an export entry at `json-canvas-viewer/dev`, which includes all the internal modules used for DI, some general module types, utilities and the base module.

## Base Module

All functions are achieved by modules, and all modules extend `BaseModule`.

The minimum boilerplate for a module:

```TypeScript
import { BaseModule, type BaseArgs } from "json-canvas-viewer/dev";

class MyModule extends BaseModule {
    constructor(...args: BaseArgs) {
        super(...args);
    }
}
```

This setup gives you available properties:

- `this.container`: The DI container, you can retrieve everything you need from here.
- `this.options`: The full options the user passes in. About custom options, see [Define Options](#define-options).
- `this.onStart`: The hook to be called when the viewer is prepared, different from the constructor, this hook is called after all the modules are initialized, and the canvas is about to be interactable, which is equivalent when you call `JSONCanvasViewer.load()`.
- `this.onDispose`: The hook to be called when the viewer is disposed.
- `this.onRestart`: The hook to be called when `JSONCanvasViewer.load()` is called and is more than once.
- `this.augment`: inject methods and properties into the main class, see [Main Augmentation](#main-augmentation).

## Accessing Module Types

Although all modules extent `BaseModule`, you may encounter troubles when trying to use its type to denote the generic type of modules.

Hence, we provide types `GeneralModule` and `GeneralModuleCtor` for this purpose. You can import them from `json-canvas-viewer/dev`.

## Define Options

To ensure the correctness of option types, you need to pass a type parameter to the `BaseModule` class, for example:

```TypeScript
import { BaseModule, type BaseArgs } from "json-canvas-viewer";

type Options = {
    useAsync?: boolean;
    useCache?: boolean;
}

class MyModule extends BaseModule<Options> {
    constructor(...args: BaseArgs) {
        super(...args);
    }
}
```

Then you can see type completions when the user uses the module, or in `this.options`.

## Main Augmentation

You can inject methods and properties to the main instance, so that users don't need to use the DI container to access them. To ensure they are properly typed, you need to pass another type parameter to the base module:

```TypeScript
import { BaseModule, type BaseArgs } from "json-canvas-viewer";

type Augmentation = {
    log: MyModule['log'];
}

class MyModule extends BaseModule<{}, Augmentation> {
    constructor(...args: BaseArgs) {
        super(...args);
        this.augment({ log: this.log });
    }

    log(toLog: string) {
        console.log(`[MyModule]: ${toLog}`);
    }
}
```

**You should always ensure that `this.augment()` is called in the constructor and implements 100% the same as the type parameter.**

## Dependency Injection and Utilities

You can use dependency injection to inject services into your module, all service providers are available in `json-canvas-viewer/dev`, they are:

```TypeScript
Controller,
DataManager,
InteractionHandler,
Renderer,
OverlayManager,
StyleManager
```

Then you can access services in your module with `needle-di`. E.g., when you want to use `DataManager`:

```TypeScript
import { BaseModule, BaseArgs, DataManager } from "json-canvas-viewer/dev";

class MyModule extends BaseModule {
    private dataManager: DataManager;
    constructor(...args: BaseArgs) {
        super(...args);
        this.dataManager = this.container.get(DataManager);
    }
}
```

The package also provides a `canvasUtils` export, which provides some useful functions.

## Full Example

The following example shows the code of module `DebugPanel`:

```TypeScript
import { type BaseArgs, BaseModule, DataManager, Controller, canvasUtils } from 'json-canvas-viewer/dev';
import style from './styles.scss?inline'; // access the styles as a string if you are using Vite

// for demonstration only, we create a useless option
type Options = {
    report?: boolean;
};

type Augmentation = {
    updateDebugPanel: DebugPanel['update'];
}

export default class DebugPanel extends BaseModule<Options, Augmentation> {
	private _debugPanel: HTMLDivElement | null = null;
	private DM: DataManager;

	private get debugPanel() { // getter to handle nullable property
		if (!this._debugPanel) throw new Error("[JSONCanvasViewer] Resource hasn't been set up or has been disposed.");
	    return this._debugPanel;
	}

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager); // dependency injection
		this.container.get(Controller).hooks.onRefresh.subscribe(this.update); // subscribe to hooks

		this._debugPanel = document.createElement('div');
		this._debugPanel.className = 'debug-panel';
		const HTMLContainer = this.DM.data.container;
		canvasUtils.applyStyles(HTMLContainer, style); // access utilities
		HTMLContainer.appendChild(this._debugPanel);

		if (this.options.report) console.log('DebugPanel initialized.'); // access custom options
        this.onDispose(this.dispose); // access lifecycle hook
        this.augment({ updateDebugPanel: this.update })
	}

	private update = () => {
		const round = canvasUtils.round;
		const data = this.DM.data;
		this.debugPanel.innerHTML = `<p>Scale: ${round(data.scale, 3)}</p><p>Offset: ${round(data.offsetX, 1)}, ${round(data.offsetY, 1)}</p>`;
	};

    // clean up to prevent memory leaks
	private dispose = () => {
		this.debugPanel.remove();
		this._debugPanel = null;
	};
}
```
