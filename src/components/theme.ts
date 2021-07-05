export interface Theme {
  foreground: 'white' | 'black';
  backgroundColor: string;
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
}

export const COMMON: Theme = {
  foreground: undefined,
  backgroundColor: undefined,
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
  }
};

export const LIGHT: Theme = {
  ...COMMON,
  foreground: 'white',
  color: '#000',
  backgroundColor: '#fff',
  switch: {
    on: {
      primary: 'rgb(0, 0, 0)',
      secondary: 'rgba(0, 0, 0, 0.2)'
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(0, 0, 0, 0.1)'
    }
  }
};

export const DARK: Theme = {
  ...COMMON,
  foreground: 'black',
  color: '#fff',
  backgroundColor: '#212121',
  borderColor: '#323232',
  switch: {
    on: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgba(255, 255, 255, 0.2)'
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(255, 255, 255, 0.1)'
    }
  }
};

export interface ThemeProps {
  theme: Theme;
}