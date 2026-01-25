import { BaseModule, type BaseArgs } from '$/baseModule';
import DataManager from '$/dataManager';
import utilities from '$/utilities';
import { parseHex, toHslString, type HslColor, rgbToHsl } from '@ahmedsemih/color-fns';

export type Color = {
	border: string;
	background: string;
	active: string;
	text: string;
	card: string;
};

type Options = {
	theme?: 'dark' | 'light';
};

type Augmentation = {
	changeTheme: StyleManager['changeTheme'];
};

const definedColors = {
	light: {
		'0': { hue: 0, saturation: 0, lightness: 72 },
		'1': { hue: 358, saturation: 81, lightness: 55 },
		'2': { hue: 19, saturation: 87, lightness: 58 },
		'3': { hue: 41, saturation: 79, lightness: 52 },
		'4': { hue: 150, saturation: 100, lightness: 37 },
		'5': { hue: 221, saturation: 100, lightness: 59 },
		'6': { hue: 257, saturation: 81, lightness: 62 },
	},
	dark: {
		'0': { hue: 0, saturation: 0, lightness: 40 },
		'1': { hue: 358, saturation: 100, lightness: 65 },
		'2': { hue: 23, saturation: 86, lightness: 63 },
		'3': { hue: 39, saturation: 91, lightness: 70 },
		'4': { hue: 153, saturation: 80, lightness: 45 },
		'5': { hue: 217, saturation: 100, lightness: 62 },
		'6': { hue: 259, saturation: 100, lightness: 75 },
	},
};

const namedColors = {
	light: {
		dots: 'hsla(0, 0%, 72%, 0.4)',
		text: 'rgb(30, 30, 30)',
		background: 'rgb(250, 250, 250)',
		'background-secondary': 'rgb(255, 255, 255)',
		shadow: '0px 0px 8px rgb(0, 0, 0, 0.1)',
		border: 'hsla(0, 0%, 82%, 0.7)',
	},
	dark: {
		dots: 'hsla(0, 0%, 40%, 0.3)',
		text: 'rgb(242, 242, 242)',
		background: 'rgb(30, 30, 30)',
		'background-secondary': 'rgb(37, 37, 40)',
		shadow: '0px 0px 8px rgb(0, 0, 0, 0.2)',
		border: 'hsla(0, 0%, 30%, 0.7)',
	},
};

export default class StyleManager extends BaseModule<Options, Augmentation> {
	theme: 'dark' | 'light' = 'light';
	onChangeTheme = utilities.makeHook<['light' | 'dark']>();

	private colorCache: {
		dark: {
			[key: string]: Color;
		};
		light: {
			[key: string]: Color;
		};
	} = {
		dark: {},
		light: {},
	};

	constructor(...args: BaseArgs) {
		super(...args);
		this.changeTheme(this.options.theme || 'light');
		this.augment({ changeTheme: this.changeTheme });
	}

	private hslProcessor = (color: HslColor) => {
		const { hue, saturation, lightness } = color;
		let result;
		if (this.theme === 'dark') {
			result = {
				active: color,
				card: { hue, saturation: saturation / 3, lightness: lightness / 3 },
				border: { ...color, alpha: 0.7 },
				background: { ...color, alpha: 0.1 },
				text: color.lightness >= 70 ? 'rgb(30, 30, 30)' : 'rgb(242, 242, 242)',
			};
		} else {
			result = {
				active: color,
				card:
					hue === 0
						? { hue, saturation, lightness: 100 }
						: { hue, saturation: saturation * 0.4, lightness: 90 },
				border: { ...color, alpha: 0.7 },
				background: { ...color, alpha: 0.1 },
				text: color.lightness >= 70 ? 'rgb(30, 30, 30)' : 'rgb(242, 242, 242)',
			};
		}
		return {
			active: toHslString(result.active),
			card: toHslString(result.card),
			border: toHslString(result.border),
			background: toHslString(result.background),
			text: result.text,
		};
	};

	getColor = (colorIndex: string = '0') => {
		const theme = this.theme;
		let color: Color;
		if (this.colorCache[theme][colorIndex]) return this.colorCache[theme][colorIndex];
		else if (colorIndex in definedColors[theme])
			color = this.hslProcessor(
				definedColors[theme][colorIndex as keyof typeof definedColors.dark],
			);
		else color = this.hslProcessor(rgbToHsl(parseHex(colorIndex)));
		this.colorCache[theme][colorIndex] = color;
		return color;
	};

	getNamedColor = (name: keyof typeof namedColors.dark) => namedColors[this.theme][name];

	changeTheme = (theme?: 'dark' | 'light') => {
		this.theme = theme ? theme : this.theme === 'dark' ? 'light' : 'dark';
		const container = this.container.get(DataManager).data.container;
		Object.entries(namedColors[this.theme]).forEach(([key, value]) => {
			container.style.setProperty(`--${key}`, value);
		});
		this.onChangeTheme(this.theme);
	};
}
