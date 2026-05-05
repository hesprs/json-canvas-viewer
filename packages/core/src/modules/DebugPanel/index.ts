import type { BaseArgs } from '$/BaseModule';
import { BaseModule } from '$/BaseModule';
import Controller from '$/Controller';
import DataManager from '$/DataManager';
import { applyStyles, destroyError, round } from '$/utilities';
import style from './styles.scss?inline';

export default class DebugPanel extends BaseModule {
	private _debugPanel?: HTMLDivElement;
	private readonly DM: DataManager;

	private get debugPanel() {
		if (!this._debugPanel) throw destroyError;
		return this._debugPanel;
	}

	constructor(...args: BaseArgs) {
		super(...args);
		this.DM = this.container.get(DataManager);
		this.container.get(Controller).onRefresh.subscribe(this.update);
		this._debugPanel = document.createElement('div');
		this._debugPanel.className = 'JCV-debug-panel JCV-border-shadow-bg';
		const HTMLContainer = this.DM.data.container;
		applyStyles(HTMLContainer, style);
		HTMLContainer.appendChild(this._debugPanel);
		this.onDispose(this.dispose);
	}

	private readonly update = () => {
		const data = this.DM.data;
		this.debugPanel.innerHTML = `<p>Scale: ${round(data.scale, 3)}</p><p>Offset: ${round(data.offsetX, 1)}, ${round(data.offsetY, 1)}</p>`;
	};

	private readonly dispose = () => {
		this.debugPanel.remove();
		this._debugPanel = undefined;
	};
}
