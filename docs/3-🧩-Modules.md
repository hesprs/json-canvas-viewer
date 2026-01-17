JSON Canvas Viewer is built in a modular way, its core is simply the composition of several internal modules. It's also very extensible, you can easily add your own modules to customize the viewer. About how to write your own module, please refer to [Develop a Module](5-🧑‍💻-Develop-a-Module.md).Actually, we have built some extended modules for you to use:

## Minimap

Displays a minimap of current canvas at the bottom right corner.

Import:

```TypeScript
import { Minimap } from 'json-canvas-viewer/modules';
```

New option and default value:

```TypeScript
{
    minimapCollapsed?: false,
}
```

- `minimapCollapsed`: Whether to start the viewer with the minimap collapsed.

## Debug Panel

Displays current scale and coordinates at the bottom left corner.

Import:

```TypeScript
import { DebugPanel } from 'json-canvas-viewer/modules';
```

## Controls

Displays zoom-in/out and fullscreen controls at the top right corner.

Import:

```TypeScript
import { Controls } from 'json-canvas-viewer/modules';
```

New option and default value:

```TypeScript
{
    controlsCollapsed?: false,
}
```

- `controlsCollapsed`: Whether to start the viewer with the minimap collapsed.

## Mistouch Preventer

If you put the canvas inside a scrollable element, the default behavior is to pan (or zoom is using a mouse) the canvas. This could be annoying if he user intents to scroll the page. This extension freezes the canvas when user is touching outside the canvas to prevent this behavior.

Import:

```TypeScript
import { MistouchPreventer } from 'json-canvas-viewer/modules';
```

New option and default value:

```TypeScript
{
    mistouchPreventer?: {
		preventAtStart?: true;
		labelText?: 'Click to unlock.';
	};
}
```

- `preventAtStart`: Whether to prevent the canvas from being mistouched when th viewer is created.
- `labelText`: The text to display in the locking banner.
