import { type BaseArgs, BaseModule } from '$/baseModule';
import Controller from '$/controller';
import DataManager from '$/dataManager';
import InteractionHandler from '$/interactionHandler';
import utilities, { destroyError } from '$/utilities';

import type { MarkdownParser } from './declarations';

type Options = {
	markdownParser?: MarkdownParser;
};

export default class OverlayManager extends BaseModule<Options> {
	private _overlaysLayer: HTMLDivElement | null = document.createElement('div');
	private overlays: Record<string, HTMLDivElement> = {}; // { id: node } the overlays in viewport
	private selectedId: string | null = null;
	private eventListeners: Record<string, Array<EventListener | null>> = {};
	private DM: DataManager;
	private IH: () => InteractionHandler;
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
		this.IH = this.container.get(InteractionHandler, { lazy: true });
		const controller = this.container.get(Controller);
		controller.hooks.onRefresh.subscribe(this.updateOverlays);

		this._overlaysLayer = document.createElement('div');
		this._overlaysLayer.className = 'overlays';
		this.DM.data.container.appendChild(this.overlaysLayer);

		this.onStart(this.start);
		this.onDispose(this.dispose);
	}

	private start = () => {
		this.IH().onClick.subscribe(this.select);
		const createOverlay = async (node: JSONCanvasNode) => {
			switch (node.type) {
				case 'text': {
					await this.updateOverlay(node, node.text, 'text');
					break;
				}
				case 'file': {
					if (node.file.match(/\.md$/i)) await this.loadMarkdownForNode(node);
					else if (node.file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i))
						await this.updateOverlay(node, node.file, 'image');
					else if (node.file.match(/\.(mp3|wav)$/i))
						await this.updateOverlay(node, node.file, 'audio');
					break;
				}
				case 'link': {
					await this.updateOverlay(node, node.url, 'link');
					break;
				}
			}
		};
		Object.values(this.DM.data.canvasMap).forEach(async (node) => {
			if (node.type === 'node') await createOverlay(node.ref);
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
		await this.updateOverlay(node, 'Loading...', 'text');
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
		await this.updateOverlay(node, parsedContent, 'text');
	};

	private updateOverlays = () => {
		const data = this.DM.data;
		this.overlaysLayer.style.transform = `translate(${data.offsetX}px, ${data.offsetY}px) scale(${data.scale})`;
	};

	private async updateOverlay(node: JSONCanvasNode, content: string, type: string) {
		let element = this.overlays[node.id];
		if (!element) {
			element = await this.constructOverlay(node, content, type);
			this.overlaysLayer.appendChild(element);
			this.overlays[node.id] = element;
			element.style.left = `${node.x}px`;
			element.style.top = `${node.y}px`;
			element.style.width = `${node.width}px`;
			element.style.height = `${node.height}px`;
		} else if (type === 'text') {
			const parsedContentContainer =
				element.getElementsByClassName('parsed-content-wrapper')[0];
			parsedContentContainer.innerHTML = content;
		}
	}

	private async constructOverlay(node: JSONCanvasNode, content: string, type: string) {
		const color = utilities.getColor(node.color);
		const overlay = document.createElement('div');
		overlay.classList.add('overlay-container');
		overlay.id = node.id;
		overlay.style.backgroundColor = color.background;
		overlay.style.setProperty('--active-color', color.active);
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
		overlayBorder.style.borderColor = color.border;
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

	private dispose = () => {
		while (this.overlaysLayer.firstElementChild) {
			const child = this.overlaysLayer.firstElementChild;
			if (this.eventListeners[child.id]) {
				const onStart = this.eventListeners[child.id][0];
				const onEnd = this.eventListeners[child.id][1];
				if (!onStart || !onEnd) throw destroyError;
				child.removeEventListener('pointerenter', onStart);
				child.removeEventListener('pointerleave', onEnd);
				child.removeEventListener('touchstart', onStart);
				child.removeEventListener('touchend', onEnd);
				this.eventListeners[child.id][0] = null;
				this.eventListeners[child.id][1] = null;
			}
			child.remove();
		}
		this.overlaysLayer.remove();
		this._overlaysLayer = null;
	};
}
