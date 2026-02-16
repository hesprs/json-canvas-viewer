import { type BaseArgs, BaseModule, type BaseOptions } from '$/BaseModule';
import Controller from '$/Controller';
import DataManager from '$/DataManager';
import InteractionHandler from '$/InteractionHandler';
import StyleManager, { type Color } from '$/StyleManager';
import type { MarkdownParser } from '$/types';
import utilities, { destroyError } from '$/utilities';

interface Options extends BaseOptions {
	markdownParser?: MarkdownParser;
}

export default class OverlayManager extends BaseModule<Options> {
	private _overlaysLayer: HTMLDivElement | null = document.createElement('div');
	private overlays: Record<string, HTMLDivElement> = {}; // { id: node } the overlays in viewport
	private selectedId: string | null = null;
	private eventListeners: Record<string, Array<EventListener | null>> = {};
	private DM: DataManager;
	private SM: StyleManager;
	private parse: MarkdownParser;

	private get overlaysLayer() {
		if (!this._overlaysLayer) throw destroyError;
		return this._overlaysLayer;
	}

	hooks = {
		onInteractionStart: utilities.makeHook(),
		onInteractionEnd: utilities.makeHook(),
	};

	constructor(...args: BaseArgs) {
		super(...args);
		this.parse = this.options.markdownParser || ((markdown: string) => markdown);
		this.DM = this.container.get(DataManager);
		this.SM = this.container.get(StyleManager);
		const controller = this.container.get(Controller);
		controller.hooks.onRefresh.subscribe(this.updateOverlays);
		this.SM.onChangeTheme.subscribe(this.themeChanged);

		this._overlaysLayer = document.createElement('div');
		this._overlaysLayer.className = 'overlays';
		this._overlaysLayer.id = 'overlays';
		this.DM.data.container.appendChild(this.overlaysLayer);

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
		const createOverlay = async (node: JSONCanvasNode) => {
			switch (node.type) {
				case 'text': {
					await this.createOverlay(node, node.text, 'text');
					break;
				}
				case 'file': {
					if (node.file.match(/\.md$/i)) await this.loadMarkdownForNode(node);
					else if (node.file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i))
						await this.createOverlay(node, node.file, 'image');
					else if (node.file.match(/\.(mp3|wav)$/i))
						await this.createOverlay(node, node.file, 'audio');
					break;
				}
				case 'link': {
					await this.createOverlay(node, node.url, 'link');
					break;
				}
			}
		};
		Object.values(this.DM.data.nodeMap).forEach(async (node) => {
			await createOverlay(node.ref);
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
		const previous = !this.selectedId ? null : this.overlays[this.selectedId];
		const current = !id ? null : this.overlays[id];
		if (previous) previous.classList.remove('active');
		if (current) {
			current.classList.add('active');
			this.hooks.onInteractionStart();
		} else this.hooks.onInteractionEnd();
		this.selectedId = id;
	};

	private loadMarkdownForNode = async (node: JSONCanvasFileNode) => {
		await this.createOverlay(node, 'Loading...', 'text');
		let parsedContent: string;
		try {
			const response = await fetch(node.file);
			const result = await response.text();
			const frontmatterMatch = result.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
			if (frontmatterMatch) parsedContent = await this.parse(frontmatterMatch[2]);
			else parsedContent = await this.parse(result);
		} catch (err) {
			console.error('[JSONCanvasViewer] Failed to load markdown:', err);
			parsedContent = 'Failed to load content.';
		}
		this.updateOverlay(node, { content: parsedContent });
	};

	private updateOverlays = () => {
		const data = this.DM.data;
		this.overlaysLayer.style.transform = `translate(${data.offsetX}px, ${data.offsetY}px) scale(${data.scale})`;
	};

	private async createOverlay(node: JSONCanvasNode, content: string, type: string) {
		let element = this.overlays[node.id];
		if (!element) {
			element = await this.constructOverlay(node, content, type);
			this.overlaysLayer.appendChild(element);
			this.overlays[node.id] = element;
			element.style.left = `${node.x}px`;
			element.style.top = `${node.y}px`;
			element.style.width = `${node.width}px`;
			element.style.height = `${node.height}px`;
		}
	}

	private updateOverlay(
		node: JSONCanvasNode,
		toUpdate: {
			content?: string;
			color?: Color;
		},
	) {
		const element = this.overlays[node.id];
		if (toUpdate.content) {
			const content = element.getElementsByClassName('parsed-content-wrapper')[0];
			if (content) content.innerHTML = toUpdate.content;
		}
		if (toUpdate.color) {
			this.setOverlayColor(element, toUpdate.color);
		}
	}

	private async constructOverlay(node: JSONCanvasNode, content: string, type: string) {
		const overlay = document.createElement('div');
		overlay.classList.add('overlay-container');
		overlay.id = node.id;
		this.setOverlayColor(overlay, this.SM.getColor(node.color));
		switch (type) {
			case 'text': {
				overlay.classList.add('markdown-content');
				const parsedContentWrapper = document.createElement('div');
				parsedContentWrapper.innerHTML = await this.parse(content || '');
				parsedContentWrapper.classList.add('parsed-content-wrapper');
				overlay.appendChild(parsedContentWrapper);
				break;
			}
			case 'link': {
				const iframe = document.createElement('iframe');
				iframe.src = content;
				iframe.sandbox = 'allow-scripts allow-same-origin';
				iframe.className = 'link-iframe';
				iframe.loading = 'lazy';
				overlay.appendChild(iframe);
				break;
			}
			case 'audio': {
				const audio = document.createElement('audio');
				audio.className = 'audio';
				audio.src = content;
				audio.controls = true;
				overlay.appendChild(audio);
				break;
			}
			case 'image': {
				const img = document.createElement('img');
				img.src = content;
				img.loading = 'lazy';
				overlay.appendChild(img);
			}
		}
		switch (type) {
			case 'link':
			case 'audio': {
				const clickLayer = document.createElement('div');
				clickLayer.className = 'click-layer';
				overlay.appendChild(clickLayer);
			}
		}
		const overlayBorder = document.createElement('div');
		overlayBorder.className = 'overlay-border';
		overlay.appendChild(overlayBorder);
		const onStart = () => {
			if (node.id === this.selectedId) this.hooks.onInteractionStart();
		};
		const onEnd = () => {
			if (node.id === this.selectedId) this.hooks.onInteractionEnd();
		};
		overlay.addEventListener('pointerenter', onStart);
		overlay.addEventListener('pointerleave', onEnd);
		overlay.addEventListener('touchstart', onStart);
		overlay.addEventListener('touchend', onEnd);
		this.eventListeners[node.id] = [onStart, onEnd];
		return overlay;
	}

	private setOverlayColor = (overlay: HTMLDivElement, color: Color) => {
		Object.entries(color).forEach(([key, value]) => {
			overlay.style.setProperty(`--overlay-${key}`, value);
		});
	};

	private clearOverlays = () => {
		Object.entries(this.overlays).forEach(([id, overlay]) => {
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
		this.clearOverlays();
		this.overlaysLayer.remove();
		this._overlaysLayer = null;
	};
}
