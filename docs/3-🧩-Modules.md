## How Modules Work

JSON Canvas Viewer is built in a modular way, its core is simply the composition of several internal modules. This unlocks unlimited extensibility and DX by loose coupling.

By using advanced type generics and runtime logic. A module can register options to the main interface, augment new properties and methods to the main and use other modules via dependency injection.

About how to write your own module, please refer to [Develop a Module](5-🧑‍💻-Develop-a-Module.md).

We have built some extended modules for you to use:

(**For those who are using `chimp` version, you can import the following modules by changing `json-canvas-viewer/modules` to the URL of CDN**)

## Minimap

Displays a minimap of current canvas at the bottom right corner.

**Import**:

```TypeScript
import { Minimap } from 'json-canvas-viewer/modules';
```

**New Option**:

`minimapCollapsed: boolean`: whether to start the viewer with the minimap collapsed.

- Default: `false`

**New Method Augmented to the Main**:

`toggleMinimapCollapse(): void`: toggle between normal and collapsed state.

### Debug Panel

Displays current scale and coordinates at the bottom left corner.

**Import**:

```TypeScript
import { DebugPanel } from 'json-canvas-viewer/modules';
```

## Controls

Displays zoom-in/out and fullscreen controls at the top right corner.

**Import**:

```TypeScript
import { Controls } from 'json-canvas-viewer/modules';
```

**New Option**:

`controlsCollapsed: boolean`: whether to start the viewer with controls collapsed.

- Default: `false`

**New Method Augmented to the Main**:

`toggleControlsCollapse(): void`: toggle between normal and collapsed state.

## Mistouch Preventer

If you put the canvas inside a scrollable element, the default behavior is to pan (or zoom is using a mouse) the canvas. This could be annoying if he user intents to scroll the page. This extension freezes the canvas when user is touching outside the canvas to prevent this behavior.

Import:

```TypeScript
import { MistouchPreventer } from 'json-canvas-viewer/modules';
```

**New Options**:

`preventMistouchAtStart: boolean`: whether to prevent the canvas from being mistouched when the viewer is instantiated.

- Default: `false`

`mistouchPreventerBannerText: string`: The text to display in the locking banner.

- Default: `Click on to unlock.`

**New Methods Augmented to the Main**:

`startMistouchPrevention(): void`: freezes the canvas and shows the banner.

`endMistouchPrevention(): void`: unlocks the canvas and hides the banner.
