import type { BaseOptions } from '$';
import type { BaseArgs } from '$/BaseModule';
import { BaseModule } from '$/BaseModule';
import DataManager from '$/DataManager';
import { applyStyles, destroyError } from '$/utilities';
import style from './styles.scss?inline';

type Options = {
	preventMistouchAtStart?: boolean;
	mistouchPreventerBannerText?: string;
} & BaseOptions;

type Augmentation = {
	startMistouchPrevention: MistouchPreventer['startPrevention'];
	endMistouchPrevention: MistouchPreventer['endPrevention'];
};

export default class MistouchPreventer extends BaseModule<Options, Augmentation> {
	private _preventionContainer?: HTMLDivElement;
	private preventMt = false;
	private readonly DM: DataManager;
	private readonly preventMistouch: {
		record: boolean;
		lastX: number;
		lastY: number;
		initialX: number;
		initialY: number;
	} = {
		initialX: 0,
		initialY: 0,
		lastX: 0,
		lastY: 0,
		record: false,
	};

	private get preventionContainer() {
		if (!this._preventionContainer) throw destroyError;
		return this._preventionContainer;
	}

	constructor(...args: BaseArgs) {
		super(...args);

		const preventionBanner = document.createElement('div');
		preventionBanner.className = 'JCV-prevention-banner JCV-border-shadow-bg';
		preventionBanner.textContent =
			this.options.mistouchPreventerBannerText ?? 'Click on to unlock.';
		this.DM = this.container.get(DataManager);
		this._preventionContainer = document.createElement('div');
		this._preventionContainer.className =
			'JCV-prevention-container JCV-hidden JCV-full JCV-flex-center';

		applyStyles(this._preventionContainer, style);
		this._preventionContainer.appendChild(preventionBanner);
		this.DM.data.container.appendChild(this._preventionContainer);

		if (this.options.preventMistouchAtStart) this.startPrevention();

		window.addEventListener('pointerdown', this.onPointerDown);
		window.addEventListener('pointermove', this.onPointerMove);
		window.addEventListener('pointerup', this.onPointerUp);

		this.augment({
			endMistouchPrevention: this.endPrevention,
			startMistouchPrevention: this.startPrevention,
		});
		this.onDispose(this.dispose);
	}

	private readonly onPointerDown = (e: PointerEvent) => {
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

	private readonly onPointerMove = (e: PointerEvent) => {
		if (this.preventMistouch.record) {
			this.preventMistouch.lastX = e.clientX;
			this.preventMistouch.lastY = e.clientY;
		}
	};

	private readonly onPointerUp = () => {
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
		this.preventionContainer.classList.remove('JCV-hidden');
		this.DM.data.container.classList.add('JCV-numb');
		this.preventMt = true;
	};

	endPrevention = () => {
		this.preventMt = false;
		this.preventionContainer.classList.add('JCV-hidden');
		setTimeout(() => this.DM.data.container.classList.remove('JCV-numb'), 50); // Minimum delay to prevent triggering undesired button touch
	};

	private readonly dispose = () => {
		window.removeEventListener('pointerdown', this.onPointerDown);
		window.removeEventListener('pointermove', this.onPointerMove);
		window.removeEventListener('pointerup', this.onPointerUp);
		this.preventionContainer.remove();
		this._preventionContainer = undefined;
	};
}
