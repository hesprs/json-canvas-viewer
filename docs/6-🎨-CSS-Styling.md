## CSS Styling Guide

The core package scopes its CSS under `.JSON-Canvas-Viewer`. Most styling is driven by a small set of utility classes plus module-specific classes.

### Used CSS classes

#### Root / layout

| Class                 | Controls                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `.JSON-Canvas-Viewer` | Root viewer container. Sets base theme variables, layout, sizing, overflow, and text/fill/stroke defaults. |
| `.JCV-main-canvas`    | Main rendered canvas element.                                                                              |
| `.JCV-overlays`       | Overlay layer that sits above the canvas.                                                                  |

#### Overlay content

| Class                         | Controls                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `.JCV-overlay-container`      | Root box for a node overlay: radius, containment, background, transitions, and interaction state. |
| `.JCV-overlay-border`         | Overlay border styling and active border color.                                                   |
| `.JCV-content`                | Content wrapper inside an overlay.                                                                |
| `.JCV-markdown-content`       | Markdown overlay layout and scroll styling.                                                       |
| `.JCV-parsed-content-wrapper` | Parsed markdown content area, padding, scrolling, and flow layout.                                |
| `.JCV-click-layer`            | Transparent interaction layer for embedded content.                                               |
| `.JCV-link-iframe`            | Full-size iframe overlay content.                                                                 |
| `.JCV-audio`                  | Full-size audio overlay content.                                                                  |
| `.JCV-video`                  | Full-size video overlay content.                                                                  |
| `.JCV-img`                    | Image overlay sizing and object-fit behavior.                                                     |

### How to override styles

The viewer injects its stylesheet into the container it attaches to, so later CSS can override it. You can simply import a CSS file with `!important` or equal or higher specificity to override specific styles.

### Color palette customization

If you want to customize the viewer color palette, use the constructor `colors` option.

- `colors.light` and `colors.dark` customize the theme palettes.
- Color keys `0` to `6` control the JSON Canvas node/edge palette.
- Named keys such as `background`, `background-secondary`, `border`, `shadow`, `text`, and `dots` control the viewer UI colors.

See [Construction Details](2-🏗️-Construction-Details.md#options) for the constructor shape and supported color formats.
