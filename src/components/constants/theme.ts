export interface ButtonColor {
  disabled: string;
  standard: string;
  hover: string;
}

export const GREEN: ButtonColor = Object.freeze({
  disabled: '#507255',
  standard: '#488b49',
  hover: '#4aad52'
});

export const RED: ButtonColor = Object.freeze({
  disabled: '#735350',
  standard: '#8C494C',
  hover: '#AD4C4B'
});

export const BLUE: ButtonColor = Object.freeze({
  disabled: '#4f5673',
  standard: '#495d8c',
  hover: '#4b64ad'
});

export const BROWN: ButtonColor = Object.freeze({
  disabled: '#72674f',
  standard: '#8a7547',
  hover: '#ab8c49',
});

export interface Theme {
  foreground: 'white' | 'black';
  backgroundColor: string;
  transparentBackgroundColor: (a: number) => string;
  color: string;
  borderColor: string;
  borderRadius: number;
  widget: {
    padding: number;
  };
  itemPadding: number;
  switch: {
    on: {
      primary: string;
      secondary: string;
    };
    off: {
      primary: string;
      secondary: string;
    }
  };
  lighten: (frac: number) => string;
  darken: (frac: number) => string;
}

export const COMMON: Theme = {
  foreground: undefined,
  backgroundColor: undefined,
  transparentBackgroundColor: undefined,
  color: undefined,
  borderColor: undefined,
  borderRadius: 10,
  widget: {
    padding: 10
  },
  itemPadding: 5,
  switch: {
    on: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgba(255, 255, 255, 0.2)'
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(255, 255, 255, 0.1)'
    }
  },
  lighten: undefined,
  darken: undefined
};

export const LIGHT: Theme = {
  ...COMMON,
  foreground: 'white',
  color: '#000',
  backgroundColor: '#fff',
  transparentBackgroundColor: a => `rgba(255, 255, 255, ${a})`,
  switch: {
    on: {
      primary: 'rgb(0, 0, 0)',
      secondary: 'rgb(72, 139, 73)'
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(0, 0, 0, 0.1)'
    }
  },
  lighten: (frac: number) => `rgba(0, 0, 0, ${frac})`,
  darken: (frac: number) => `rgba(255, 255, 255, ${frac})`,
};

export const DARK: Theme = {
  ...COMMON,
  foreground: 'black',
  color: '#fff',
  backgroundColor: '#212121',
  transparentBackgroundColor: a => `rgba(${0x21}, ${0x21}, ${0x21}, ${a})`,
  borderColor: '#323232',
  switch: {
    on: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgb(72, 139, 73)'
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(255, 255, 255, 0.1)'
    }
  },
  lighten: (frac: number) => `rgba(255, 255, 255, ${frac})`,
  darken: (frac: number) => `rgba(0, 0, 0, ${frac})`,
};

export interface ThemeProps {
  theme: Theme;
}