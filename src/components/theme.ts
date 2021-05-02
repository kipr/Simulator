export interface Theme {
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderRadius: number;
  widget: {
    padding: number;
  };
}

export const COMMON: Theme = {
  backgroundColor: undefined,
  color: undefined,
  borderColor: undefined,
  borderRadius: 10,
  widget: {
    padding: 10
  }
};

export const LIGHT: Theme = {
  ...COMMON,
  color: '#000',
  backgroundColor: '#fff'
};

export const DARK: Theme = {
  ...COMMON,
  color: '#fff',
  backgroundColor: '#212121',
  borderColor: '#323232'
};

export interface ThemeProps {
  theme: Theme;
}