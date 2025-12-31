import type { Container } from '@needle-di/core';
import Controller from '@/controller';
import DataManager from '@/dataManager';
import { destroyError } from '@/shared';
import { UtilitiesToken, type utilities } from '@/utilities';
import style from './styles.scss?inline';

export default class DebugPanel {
	private _debugPanel: HTMLDivElement | null = null;
	private DM: DataManager;
	private utilities: typeof utilities;

	private get debugPanel() {
		if (!this._debugPanel) throw destroyError;
		return this._debugPanel;
	}

	constructor(container: Container) {
		this.DM = container.get(DataManager);
		this.utilities = container.get(UtilitiesToken);
		container.get(Controller).hooks.onRefresh.subscribe(this.update);
		this._debugPanel = document.createElement('div');
		this._debugPanel.className = 'debug-panel';
		const HTMLContainer = this.DM.data.container;
		this.utilities.applyStyles(HTMLContainer, style);
		HTMLContainer.appendChild(this._debugPanel);
	}

	private update = () => {
		const round = this.utilities.round;
		const data = this.DM.data;
		this.debugPanel.innerHTML = `
            <p>Scale: ${round(data.scale, 3)}</p>
            <p>Offset: ${round(data.offsetX, 1)}, ${round(data.offsetY, 1)}</p>
        `;
	};

	dispose = () => {
		this.debugPanel.remove();
		this._debugPanel = null;
	};
}
