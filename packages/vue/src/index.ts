export * from 'json-canvas-viewer';
export { default as JSONCanvasViewerComponent } from '@/Viewer.vue';

// must import env.d.ts, otherwise dts bundler will throw at '*.scss?inline'
import './env.d.ts';
