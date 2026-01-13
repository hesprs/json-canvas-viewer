## Server Side Rendering

We've experimented with a viable path using **progressive enhancement** for server-side rendering JSON canvases.

`json-canvas-viewer/bridges` provides an export `renderToString` async function that renders the canvas to a string:

```TypeScript
renderToString(options: {
    canvas: JSONCanvas;
    attachmentDir?: string;
    markdownParser?: MarkdownParser,
}): Promise<string>;
```

- `options`: the [same requirements](2-🏗️-Construction-Details.md#options) as `canvas`, `attachmentDir`, and `markdownParser` passed in the main constructor options.

You can use the returned string as the `innerHTML` of your container element. To achieve this:
- in `React`: `dangerouslySetInnerHTML`
- in `Vue`: `v-html`

**Disclaimer: for customizability, `json-canvas-viewer` does not sanitize the output, but it is basically safe provided**:
- if you are using the chimp version, the default `parser` output is sanitized by `DOMPurify`.
- if you are using the full version, since you directly import the canvas file, the file is under your control, so there's no risk of XSS. Alternatively, you can include a sanitizer in your build-time parser.

During client-side code execution, pre-rendered HTML will be replaced with the actual interactive viewer.