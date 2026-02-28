import type { BaseOptions } from '$';
import type {
	JSONCanvasFileNode,
	JSONCanvasLinkNode,
	JSONCanvasNode,
	JSONCanvasTextNode,
	Parser,
} from 'shared';
import { type BaseArgs, BaseModule } from '$/BaseModule';
import Controller from '$/Controller';
import DataManager from '$/DataManager';
import InteractionHandler from '$/InteractionHandler';
import StyleManager, { type Color } from '$/StyleManager';
import utilities, { destroyError, type Hook } from '$/utilities';

interface Options extends BaseOptions {
	parser?: Parser;
	nodeComponents?: Partial<ComponentDict>;
}

interface Augmentation {
	onNodeActive: OverlayManager['onNodeActive'];
	onNodeLosesActive: OverlayManager['onNodeLosesActive'];
}

// TODO: add more formats
const fileRegex = {
	markdown: /\.(md|mdx|markdown|txt)$/i,
	image: /\.(png|jpg|jpeg|gif|svg|webp|avif|bmp|ico|heic|heif)$/i,
	audio: /\.(mp3|wav|ogg|opus|aac|m4a|flac)$/i,
	video: /\.(mp4|webm|ogv|mov|m3u8|mpd)$/i,
};

type NodeComponentHook<N extends JSONCanvasNode> = (
	container: HTMLDivElement,
	content: string,
	node: N,
	onBeforeUnmount: Hook,
	onActive: Hook,
	onLoseActive: Hook,
) => void | Promise<void>;

type CreateOverlayArgs =
	| [ComponentNodeMap['text'], string, 'text']
	| [ComponentNodeMap['markdown'], string, 'markdown']
	| [ComponentNodeMap['image'], string, 'image']
	| [ComponentNodeMap['audio'], string, 'audio']
	| [ComponentNodeMap['video'], string, 'video']
	| [ComponentNodeMap['link'], string, 'link'];

type ComponentNodeMap = {
	text: JSONCanvasTextNode;
	markdown: JSONCanvasFileNode;
	image: JSONCanvasFileNode;
	audio: JSONCanvasFileNode;
	video: JSONCanvasFileNode;
	link: JSONCanvasLinkNode;
};

type ComponentDict = {
	[K in keyof ComponentNodeMap]: NodeComponentHook<ComponentNodeMap[K]>;
};

const supportedTypes = ['markdown', 'image', 'audio', 'video'] as const;

export default class OverlayManager extends BaseModule<Options, Augmentation> {
	private _overlaysLayer: HTMLDivElement | null = document.createElement('div');
	private overlays: Record<string, HTMLDivElement> = {}; // { id: node } the overlays in viewport
	private selectedId: string | null = null;
	private aborted = false;
	private eventListeners: Record<string, Array<EventListener | null>> = {};
	private DM: DataManager;
	private SM: StyleManager;
	private parse: Parser;
	private componentDict: ComponentDict = {
		text: (container, content) => {
			container.classList.add('JCV-markdown-content');
			const parsedContentWrapper = document.createElement('div');
			parsedContentWrapper.innerHTML = content;
			parsedContentWrapper.classList.add('JCV-parsed-content-wrapper');
			container.appendChild(parsedContentWrapper);
		},
		markdown: async (container, content) => {
			container.classList.add('JCV-markdown-content');
			const parsedContentWrapper = document.createElement('div');
			parsedContentWrapper.textContent = 'Loading...';
			parsedContentWrapper.classList.add('JCV-parsed-content-wrapper');
			container.appendChild(parsedContentWrapper);
			let parsedContent: string;
			try {
				const response = await fetch(content);
				const result = await response.text();
				const frontmatterMatch = result.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
				if (frontmatterMatch) parsedContent = await this.parse(frontmatterMatch[2]);
				else parsedContent = await this.parse(result);
			} catch (err) {
				console.error('[JSON Canvas Viewer] Failed to load markdown:', err);
				parsedContent = 'Failed to load content.';
			}
			parsedContentWrapper.innerHTML = parsedContent;
		},
		link: (container, content) => {
			const iframe = document.createElement('iframe');
			iframe.src = content;
			iframe.sandbox = 'allow-scripts allow-same-origin';
			iframe.className = 'JCV-link-iframe';
			iframe.loading = 'lazy';
			container.appendChild(iframe);
		},
		audio: (container, content) => {
			const audio = document.createElement('audio');
			audio.className = 'JCV-audio';
			audio.src = content;
			audio.controls = true;
			container.appendChild(audio);
		},
		image: (container, content) => {
			const img = document.createElement('img');
			img.className = 'JCV-img';
			img.src = content;
			img.loading = 'lazy';
			container.appendChild(img);
		},
		video: (container, content) => {
			const video = document.createElement('video');
			video.className = 'JCV-video';
			video.src = content;
			video.controls = true;
			container.appendChild(video);
		},
	};

	private get overlaysLayer() {
		if (!this._overlaysLayer) throw destroyError;
		return this._overlaysLayer;
	}

	onInteractionStart = utilities.makeHook();
	onInteractionEnd = utilities.makeHook();
	onNodeActive = utilities.makeHook<[JSONCanvasNode]>();
	onNodeLosesActive = utilities.makeHook<[JSONCanvasNode]>();

	constructor(...args: BaseArgs) {
		super(...args);
		this.parse = this.options.parser || ((markdown: string) => markdown);
		this.DM = this.container.get(DataManager);
		this.SM = this.container.get(StyleManager);
		const controller = this.container.get(Controller);
		controller.onRefresh.subscribe(this.updateOverlays);
		this.SM.onChangeTheme.subscribe(this.themeChanged);

		this._overlaysLayer = document.createElement('div');
		this._overlaysLayer.className = 'JCV-overlays';
		this._overlaysLayer.id = 'overlays';
		this.DM.data.container.appendChild(this.overlaysLayer);

		const components = this.options.nodeComponents;
		if (components) Object.assign(this.componentDict, components);

		this.augment({
			onNodeActive: this.onNodeActive,
			onNodeLosesActive: this.onNodeLosesActive,
		});
		this.onStart(this.start);
		this.onRestart(this.restart);
		this.onDispose(this.dispose);
	}

	private start = () => {
		this.container.get(InteractionHandler).onClick.subscribe(this.select);
		this.renderOverlays();
	};

	private restart = () => {
		this.clearOverlays();
		this.renderOverlays();
	};

	private renderOverlays = () => {
		const overlayMatcher = async (node: JSONCanvasNode) => {
			switch (node.type) {
				case 'text': {
					this.createOverlay(node, await this.parse(node.text), 'text');
					break;
				}
				case 'file': {
					for (const type of supportedTypes) {
						if (!node.file.match(fileRegex[type])) continue;
						this.createOverlay(node, node.file, type);
						break;
					}
					break;
				}
				case 'link': {
					this.createOverlay(node, node.url, 'link');
					break;
				}
			}
		};
		Object.values(this.DM.data.nodeMap).forEach(async (node) => {
			await overlayMatcher(node.ref);
		});
	};

	private themeChanged = () => {
		Object.values(this.overlays).forEach((overlay) => {
			const node = this.DM.data.nodeMap[overlay.id].ref;
			const color = this.SM.getColor(node.color);
			this.setOverlayColor(overlay, color);
		});
	};

	private select = (id: string | null) => {
		const previousId = this.selectedId;
		const previous = !previousId ? null : this.overlays[previousId];
		const current = !id ? null : this.overlays[id];
		if (previous && previousId) {
			previous.classList.remove('JCV-active');
			const nodeItem = this.DM.data.nodeMap[previousId];
			this.onNodeLosesActive(nodeItem.ref);
			nodeItem.onLoseActive?.();
		}
		if (current && id) {
			current.classList.add('JCV-active');
			this.onInteractionStart();
			const nodeItem = this.DM.data.nodeMap[id];
			this.onNodeActive(nodeItem.ref);
			nodeItem.onActive?.();
		} else this.onInteractionEnd();
		this.selectedId = id;
	};

	private updateOverlays = () => {
		const data = this.DM.data;
		this.overlaysLayer.style.transform = `translate(${data.offsetX}px, ${data.offsetY}px) scale(${data.scale})`;
	};

	private createOverlay = (...args: CreateOverlayArgs) => {
		if (this.aborted) return;
		const node = args[0];
		let element = this.overlays[node.id];
		if (!element) {
			element = this.constructOverlay(...args);
			if (this.aborted) return;
			this.overlaysLayer.appendChild(element);
			this.overlays[node.id] = element;
			element.style.left = `${node.x}px`;
			element.style.top = `${node.y}px`;
			element.style.width = `${node.width}px`;
			element.style.height = `${node.height}px`;
		}
	};

	private constructOverlay = (...args: CreateOverlayArgs) => {
		const node = args[0];
		const overlay = document.createElement('div');
		overlay.classList.add('JCV-overlay-container');
		overlay.id = node.id;
		this.setOverlayColor(overlay, this.SM.getColor(node.color));
		const contentWrapper = document.createElement('div');
		contentWrapper.classList.add('JCV-content');
		overlay.appendChild(contentWrapper);
		const clickLayer = document.createElement('div');
		clickLayer.className = 'JCV-click-layer';
		overlay.appendChild(clickLayer);
		const overlayBorder = document.createElement('div');
		overlayBorder.className = 'JCV-overlay-border';
		overlay.appendChild(overlayBorder);
		const nodeItem = this.DM.data.nodeMap[node.id];

		nodeItem.onActive = utilities.makeHook();
		nodeItem.onLoseActive = utilities.makeHook();
		nodeItem.onBeforeUnmount = utilities.makeHook();

		void this.componentDict[args[2]](
			contentWrapper,
			args[1],
			args[0] as never,
			nodeItem.onBeforeUnmount,
			nodeItem.onActive,
			nodeItem.onLoseActive,
		);
		const onStart = () => {
			if (node.id === this.selectedId) this.onInteractionStart();
		};
		const onEnd = () => {
			if (node.id === this.selectedId) this.onInteractionEnd();
		};
		overlay.addEventListener('pointerenter', onStart);
		overlay.addEventListener('pointerleave', onEnd);
		overlay.addEventListener('touchstart', onStart);
		overlay.addEventListener('touchend', onEnd);
		this.eventListeners[node.id] = [onStart, onEnd];
		return overlay;
	};

	private setOverlayColor = (overlay: HTMLDivElement, color: Color) => {
		Object.entries(color).forEach(([key, value]) => {
			overlay.style.setProperty(`--overlay-${key}`, value);
		});
	};

	private clearOverlays = () => {
		Object.entries(this.overlays).forEach(([id, overlay]) => {
			this.DM.data.nodeMap[id].onBeforeUnmount?.();
			if (this.eventListeners[id]) {
				const onStart = this.eventListeners[id][0];
				const onEnd = this.eventListeners[id][1];
				if (!onStart || !onEnd) throw destroyError;
				overlay.removeEventListener('pointerenter', onStart);
				overlay.removeEventListener('pointerleave', onEnd);
				overlay.removeEventListener('touchstart', onStart);
				overlay.removeEventListener('touchend', onEnd);
				this.eventListeners[id][0] = null;
				this.eventListeners[id][1] = null;
			}
			overlay.remove();
			delete this.overlays[id];
		});
	};

	private dispose = () => {
		this.aborted = true;
		this.clearOverlays();
		this.overlaysLayer.remove();
		this._overlaysLayer = null;
	};
}
