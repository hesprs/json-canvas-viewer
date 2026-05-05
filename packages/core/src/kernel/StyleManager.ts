import type { BaseOptions } from '$';
import type { BaseArgs } from '$/BaseModule';
import type { HslColor } from '@ahmedsemih/color-fns';
import { BaseModule } from '$/BaseModule';
import DataManager from '$/DataManager';
import { makeHook } from '$/utilities';
import { parseHex, toHslString, rgbToHsl, parseHsl, parseRgb } from '@ahmedsemih/color-fns';

type Color = {
	border: string;
	background: string;
	active: string;
	text: string;
	card: string;
};

export type WithBorderWidth = {
	'border-width': string;
} & Color;

type ColorOptions = {
	[K in keyof (StyleManager['definedColors']['light'] &
		StyleManager['namedColors']['light'])]?: string;
};

type Options = {
	theme?: 'dark' | 'light';
	colors?: {
		light?: ColorOptions;
		dark?: ColorOptions;
	};
} & BaseOptions;

type Augmentation = {
	changeTheme: StyleManager['changeTheme'];
	onChangeTheme: StyleManager['onChangeTheme'];
};

export default class StyleManager extends BaseModule<Options, Augmentation> {
	theme: 'dark' | 'light' = 'light';
	onChangeTheme = makeHook<['light' | 'dark']>();
	definedColors = {
		dark: {
			'0': { hue: 0, lightness: 40, saturation: 0 },
			'1': { hue: 358, lightness: 65, saturation: 100 },
			'2': { hue: 23, lightness: 63, saturation: 86 },
			'3': { hue: 39, lightness: 70, saturation: 91 },
			'4': { hue: 153, lightness: 45, saturation: 80 },
			'5': { hue: 217, lightness: 62, saturation: 100 },
			'6': { hue: 259, lightness: 75, saturation: 100 },
		},
		light: {
			'0': { hue: 0, lightness: 72, saturation: 0 },
			'1': { hue: 358, lightness: 55, saturation: 81 },
			'2': { hue: 19, lightness: 58, saturation: 87 },
			'3': { hue: 41, lightness: 52, saturation: 79 },
			'4': { hue: 150, lightness: 37, saturation: 100 },
			'5': { hue: 221, lightness: 59, saturation: 100 },
			'6': { hue: 257, lightness: 62, saturation: 81 },
		},
	};

	namedColors = {
		dark: {
			background: 'rgb(30, 30, 30)',
			'background-secondary': 'rgb(37, 37, 40)',
			border: 'hsla(0, 0%, 30%, 0.7)',
			dots: 'hsla(0, 0%, 40%, 0.3)',
			shadow: '0px 0px 8px rgb(0, 0, 0, 0.2)',
			text: 'rgb(242, 242, 242)',
		},
		light: {
			background: 'rgb(250, 250, 250)',
			'background-secondary': 'rgb(255, 255, 255)',
			border: 'hsla(0, 0%, 82%, 0.7)',
			dots: 'hsla(0, 0%, 72%, 0.4)',
			shadow: '0px 0px 8px rgb(0, 0, 0, 0.1)',
			text: 'rgb(30, 30, 30)',
		},
	};

	private readonly colorCache: {
		dark: Record<string, WithBorderWidth>;
		light: Record<string, WithBorderWidth>;
	} = {
		dark: {},
		light: {},
	};

	constructor(...args: BaseArgs) {
		super(...args);

		// User-defined color merging
		const colors = this.options.colors;
		if (colors) {
			const themes = ['light', 'dark'] as const;
			themes.forEach((theme) => {
				if (!(theme in colors)) return;
				const colorObject = colors[theme];
				if (!colorObject) return;
				Object.entries(colorObject).forEach(([key, value]) => {
					if (!value) return;
					const namedColorsDict = this.namedColors[theme];
					const definedColorsDict = this.definedColors[theme];
					if (key in namedColorsDict)
						namedColorsDict[key as keyof typeof namedColorsDict] = value;
					else if (key in definedColorsDict) {
						const color = this.parseColor(value);
						if (!color) {
							console.warn(`[JSON Canvas Viewer] Color ${value} unsupported.`);
							return;
						}
						definedColorsDict[key as keyof typeof definedColorsDict] = color;
					}
				});
			});
		}

		this.changeTheme(this.options.theme ?? 'light');
		this.augment({
			changeTheme: this.changeTheme,
			onChangeTheme: this.onChangeTheme,
		});
	}

	private readonly hslProcessor = (color: HslColor) => {
		const { hue, saturation, lightness } = color;
		const result =
			this.theme === 'dark'
				? {
						active: color,
						background: { ...color, alpha: 0.1 },
						border: { ...color, alpha: 0.7 },
						card: { hue, lightness: lightness / 3, saturation: saturation / 3 },
						text: color.lightness >= 70 ? 'rgb(30, 30, 30)' : 'rgb(242, 242, 242)',
					}
				: {
						active: color,
						background: { ...color, alpha: 0.1 },
						border: { ...color, alpha: 0.7 },
						card:
							hue === 0
								? { hue, lightness: 100, saturation }
								: { hue, lightness: 90, saturation: saturation * 0.4 },
						text: color.lightness >= 70 ? 'rgb(30, 30, 30)' : 'rgb(242, 242, 242)',
					};
		return {
			active: toHslString(result.active),
			background: toHslString(result.background),
			border: toHslString(result.border),
			card: toHslString(result.card),
			text: result.text,
		};
	};

	private readonly parseColor = (color: string) => {
		if (color.startsWith('rgb')) return rgbToHsl(parseRgb(color));
		if (color.startsWith('#')) return rgbToHsl(parseHex(color));
		if (color.startsWith('hsl')) return parseHsl(color);
	};

	getColor = (colorIndex = '0') => {
		const theme = this.theme;
		let color: Color;
		if (this.colorCache[theme][colorIndex]) return this.colorCache[theme][colorIndex];
		else if (colorIndex in this.definedColors[theme])
			color = this.hslProcessor(
				this.definedColors[theme][colorIndex as keyof typeof this.definedColors.dark],
			);
		else color = this.hslProcessor(rgbToHsl(parseHex(colorIndex)));
		const withBorderWidth: WithBorderWidth = {
			...color,
			'border-width': colorIndex === '0' ? '1px' : '2px',
		};
		this.colorCache[theme][colorIndex] = withBorderWidth;
		return withBorderWidth;
	};

	getNamedColor = (name: keyof typeof this.namedColors.light) =>
		this.namedColors[this.theme][name];

	changeTheme = (theme?: 'dark' | 'light') => {
		this.theme = theme ?? (this.theme === 'dark' ? 'light' : 'dark');
		const container = this.container.get(DataManager).data.container;
		Object.entries(this.namedColors[this.theme]).forEach(([key, value]) => {
			container.style.setProperty(`--${key}`, value);
		});
		this.onChangeTheme(this.theme);
	};
}
