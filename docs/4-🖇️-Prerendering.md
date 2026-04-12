## Prerendering

`json-canvas-viewer` provides an export `renderToString` async function that renders the canvas content to a string:

```TypeScript
function renderToString(options: {
    canvas: JSONCanvas,
    attachmentDir?: string;
    attachments?: Record<string, string>,
    parser?: (markdown: string) => string | Promise<string>,
}): Promise<string>;
```

- `options`: the [same requirements](2-🏗️-Construction-Details.md#options) as `canvas`, `attachmentDir`, `attachments`, and `markdownParser` passed in the main constructor options.

You can use the returned string as the `innerHTML` of your container element. To achieve this:

- in `React`/`Preact`: `dangerouslySetInnerHTML`
- in `Vue`: `v-html`

**Disclaimer: for customizability, the viewer instance itself does not sanitize the output, but it is basically safe provided**:

- The export `parser`'s output is sanitized by `DOMPurify`.
- if you are using the Vite + `vite-plugin-json-canvas`, since you directly import the canvas file, the file is under your control, so there's no risk of XSS. Alternatively, you can include a sanitizer in your build-time parser.

During client-side code execution, pre-rendered HTML will be replaced with the actual interactive viewer.

### Vue

The Vue component naturally supports prerendering. To enable prerendering, you can set the `isPrerendering` prop to true.

### React / Preact

Due to the lack of support of asynchronous rendering in React, you need to manually render the component to a string in a place that supports asynchronous rendering. The React/Preact component supports a `prerenderHtml` prop that accepts a string for prerendering.

Below is a minimal example (in your server component):

```tsx
import { JSONCanvasViewerComponent } from '@json-canvas-viewer/react'; // or '@json-canvas-viewer/preact'
import canvas from 'path/to/your.canvas';

// a server component
export default async function App() {
  const html = await renderToString({ canvas });

  return (
    <main>
      {/* ... your other components */}
      <JSONCanvasViewerComponent prerenderHtml={html} canvas={canvas} />
    </main>
  );
}
```
