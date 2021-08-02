export namespace Color {
  export enum Type {
    Rgba,
    Hsla,
    Rgb,
    Hsl,
  }

  export interface Rgba {
    type: Type.Rgba;
    r: number;
    g: number;
    b: number;
    a: number;
  }

  export namespace Rgba {
    export const create = (r: number, g: number, b: number, a: number): Rgba => ({ type: Type.Rgba, r, g, b, a });

    export const fromCss = (css: string): Rgba => {
      const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d+)\s*)?\)/.exec(css);
      if (!match) {
        throw new Error('Invalid rgba color');
      }
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      const a = parseInt(match[5], 10) || 1;
      return create(r, g, b, a);
    };

    export const toCss = (rgba: Rgba): string => `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;


    export const toHsla = (rgba: Rgba): Hsla => {
      const r = rgba.r / 255;
      const g = rgba.g / 255;
      const b = rgba.b / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const h = (max + min) / 2;
      const s = max === min ? 0 : h < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
      const l = max === min ? 0 : (max + min) / 2;
      const a = rgba.a;
      return { type: Type.Hsla, h, s, l, a };
    };

    export const darken = (color: Rgba, percent: number): Color => {
      const { r, g, b, a } = color;
      const hsla = toHsla(color);
      const { h, s, l } = hsla;
      const lNew = Math.max(0, l - (l * percent));
      return Hsla.create(h, s, lNew, a);
    };

    export const lighten = (color: Rgba, percent: number): Color => {
      const { r, g, b, a } = color;
      const hsla = toHsla(color);
      const { h, s, l } = hsla;
      const lNew = Math.min(1, l + (l * percent));
      return Hsla.create(h, s, lNew, a);
    };
  }

  export interface Hsla {
    type: Type.Hsla;
    h: number;
    s: number;
    l: number;
    a: number;
  }

  export namespace Hsla {
    export const create = (h: number, s: number, l: number, a: number): Hsla => ({ type: Type.Hsla, h, s, l, a });
  
    export const toCss = (hsla: Hsla): string => `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;
  }

  export interface Rgb {
    type: Type.Rgb;
    r: number;
    g: number;
    b: number;
  }

  export namespace Rgb {
    export const create = (r: number, g: number, b: number): Rgb => ({ type: Type.Rgb, r, g, b });

    export const toRgba = (rgb: Rgb): Rgba => ({ type: Type.Rgba, r: rgb.r, g: rgb.g, b: rgb.b, a: 1 });

    export const fromHex = (hex: string): Rgb => {
      const match = /^#?(\w{2})(\w{2})(\w{2})$/.exec(hex);
      if (!match) {
        throw new Error('Invalid hex color');
      }
      const r = parseInt(match[1], 16);
      const g = parseInt(match[2], 16);
      const b = parseInt(match[3], 16);
      return create(r, g, b);
    };

    export const fromCss = (css: string): Rgb => {
      const match = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(css);
      if (!match) {
        throw new Error('Invalid rgb color');
      }
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      return create(r, g, b);
    };

    export const toCss = (rgb: Rgb): string => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    export const toHsl = (rgb: Rgb): Hsl => {
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const h = max === min ? 0 : max === r ? (g - b) / (max - min) : max === g ? (b - r) / (max - min) + 2 : (r - g) / (max - min) + 4;
      const s = max === 0 ? 0 : max === min ? 0 : (max - min) / max;
      const l = max;
      return { type: Type.Hsl, h, s, l };
    };

    export const darken = (color: Rgb, percent: number): Rgb => ({
      type: Type.Rgb,
      r: Math.max(0, color.r - (color.r * percent)),
      g: Math.max(0, color.g - (color.g * percent)),
      b: Math.max(0, color.b - (color.b * percent))
    });

    export const lighten = (color: Rgb, percent: number): Color => {
      const hsla = toHsl(color);
      const { h, s, l } = hsla;
      const lNew = Math.min(1, l + (l * percent));
      return Hsla.create(h, s, lNew, 1);
    };
  }

  export interface Hsl {
    type: Type.Hsl;
    h: number;
    s: number;
    l: number;
  }

  export namespace Hsl {
    export const create = (h: number, s: number, l: number): Hsl => ({ type: Type.Hsl, h, s, l });
  
    export const fromCss = (css: string): Hsl => {
      const match = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/.exec(css);
      if (!match) {
        throw new Error('Invalid hsl color');
      }
      const h = parseInt(match[1], 10) / 360;
      const s = parseInt(match[2], 10) / 100;
      const l = parseInt(match[3], 10) / 100;
      return create(h, s, l);
    };

    export const toCss = (hsl: Hsl): string => `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;
  }

  export const toCss = (color: Color): string => {
    switch (color.type) {
      case Type.Hsla:
        return Hsla.toCss(color);
      case Type.Rgba:
        return Rgba.toCss(color);
      case Type.Rgb:
        return Rgb.toCss(color);
      case Type.Hsl:
        return Hsl.toCss(color);
      default:
        throw new Error('Unknown color type');
    }
  };
}

export type Color = Color.Rgba | Color.Hsla | Color.Rgb | Color.Hsl;