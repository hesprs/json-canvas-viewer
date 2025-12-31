import type { Container } from '@needle-di/core';
import DataManager from '@/dataManager';
import { destroyError } from '@/shared';
import { UtilitiesToken } from '@/utilities';
import style from './styles.scss?inline';

export default class MistouchPreventer {
	private _preventionContainer: HTMLDivElement | null = null;
	private preventMt: boolean = false;
	private DM: DataManager;
	private preventMistouch: {
		record: boolean;
		lastX: number;
		lastY: number;
		initialX: number;
		initialY: number;
	} = {
		record: false,
		lastX: 0,
		lastY: 0,
		initialX: 0,
		initialY: 0,
	};

	private get preventionContainer() {
		if (this._preventionContainer === null) throw destroyError;
		return this._preventionContainer;
	}

	constructor(container: Container) {
		const preventionBanner = document.createElement('div');
		preventionBanner.className = 'prevention-banner';
		preventionBanner.textContent = 'Frozen to prevent mistouch, click on to unlock.';
		this.DM = container.get(DataManager);
		this._preventionContainer = document.createElement('div');
		this._preventionContainer.className = 'prevention-container hidden';

		container.get(UtilitiesToken).applyStyles(this._preventionContainer, style);
		this._preventionContainer.appendChild(preventionBanner);
		this.DM.data.container.appendChild(this._preventionContainer);

		this.startPrevention();

		window.addEventListener('pointerdown', this.onPointerDown);
		window.addEventListener('pointermove', this.onPointerMove);
		window.addEventListener('pointerup', this.onPointerUp);
	}

	private onPointerDown = (e: PointerEvent) => {
		const bounds = this.DM.data.container.getBoundingClientRect();
		if (
			e.clientX < bounds.left ||
			e.clientX > bounds.right ||
			e.clientY < bounds.top ||
			e.clientY > bounds.bottom
		) {
			if (!this.preventMt) this.startPrevention();
		} else if (this.preventMt) {
			this.preventMistouch.initialX = e.clientX;
			this.preventMistouch.initialY = e.clientY;
			this.preventMistouch.lastX = e.clientX;
			this.preventMistouch.lastY = e.clientY;
			this.preventMistouch.record = true;
		}
	};

	private onPointerMove = (e: PointerEvent) => {
		if (this.preventMistouch.record) {
			this.preventMistouch.lastX = e.clientX;
			this.preventMistouch.lastY = e.clientY;
		}
	};

	private onPointerUp = () => {
		if (this.preventMistouch.record) {
			this.preventMistouch.record = false;
			if (
				Math.abs(this.preventMistouch.lastX - this.preventMistouch.initialX) +
					Math.abs(this.preventMistouch.lastY - this.preventMistouch.initialY) <
				5
			)
				this.endPrevention();
		}
	};

	startPrevention = () => {
		this.preventionContainer.classList.remove('hidden');
		this.DM.data.container.classList.add('numb');
		this.preventMt = true;
	};

	endPrevention = () => {
		this.preventMt = false;
		this.preventionContainer.classList.add('hidden');
		setTimeout(() => this.DM.data.container.classList.remove('numb'), 50); // minimum delay to prevent triggering undesired button touch
	};

	dispose = () => {
		window.removeEventListener('pointerdown', this.onPointerDown);
		window.removeEventListener('pointermove', this.onPointerMove);
		window.removeEventListener('pointerup', this.onPointerUp);
		this.preventionContainer.remove();
		this._preventionContainer = null;
	};
}
