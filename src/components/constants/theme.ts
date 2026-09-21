export interface ButtonColor {
  disabled: string;
  standard: string;
  hover: string;
  border?: string;
  textColor?: string;
  textShadow?: string;
}

export interface ButtonColors {
  default: ButtonColor;
  primary: ButtonColor;
  success: ButtonColor;
  danger: ButtonColor;
  confirm: ButtonColor;
  cancel: ButtonColor;
}


export const LIGHTMODE_DEFAULT: ButtonColor = Object.freeze({
  disabled: '#808080',
  standard: '#e0e0e0',
  hover: '#d3d3d3',
  textColor: '#30323a',
  textShadow: 'none'
});

export const LIGHTMODE_GREEN: ButtonColor = Object.freeze({
  disabled: '#507255',
  standard: '#89c28a',
  hover: '#4aad52'
});

export const LIGHTMODE_RED: ButtonColor = Object.freeze({
  disabled: '#d6b8b6',
  standard: '#d98a8a',
  hover: '#bd6666'
});

export const LIGHTMODE_BLUE: ButtonColor = Object.freeze({
  disabled: '#90caf9',
  standard: '#2196f3',
  hover: '#1976d2',
});

export const LIGHTMODE_YES: ButtonColor = Object.freeze({
  disabled: '#808080',
  border: '#1f7a72',
  standard: "#41af3c",
  hover: "#51d94b",
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const LIGHTMODE_NO: ButtonColor = Object.freeze({
  disabled: '#507255',
  border: '#800000',
  standard: "#cc0000",
  hover: "#ff1a1a",
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const DARKMODE_DEFAULT: ButtonColor = Object.freeze({
  disabled: '#2c2c2e',
  standard: '#343436',   // = DARK.unselectedBackground
  hover: '#3f3f3f',   // = DARK.selectedFileBackground
  border: '#323232',   // = DARK.borderColor
  textColor: '#ffffff',
});
export const DARKMODE_GREEN: ButtonColor = Object.freeze({
  disabled: '#507255',
  standard: '#488b49',
  hover: '#4aad52',
});

export const DARKMODE_RED: ButtonColor = Object.freeze({
  disabled: '#735350',
  standard: '#8C494C',
  hover: '#AD4C4B',
});

export const DARKMODE_YES: ButtonColor = Object.freeze({
  disabled: '#5c665e',
  standard: '#488b49',
  hover: '#4aad52',
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const DARKMODE_NO: ButtonColor = Object.freeze({
  disabled: '#735350',
  standard: '#8C494C',
  hover: '#AD4C4B',
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const DARKMODE_BLUE: ButtonColor = Object.freeze({
  disabled: '#4f6f8a',
  standard: '#2196f3',
  hover: '#42a5f5',
});

/** @deprecated use DARKMODE_GREEN */
export const GREEN = DARKMODE_GREEN;
/** @deprecated use DARKMODE_RED */
export const RED = DARKMODE_RED;
/** @deprecated use DARKMODE_BLUE */
export const BLUE = DARKMODE_BLUE;

export const BROWN: ButtonColor = Object.freeze({
  disabled: '#72674f',
  standard: '#8a7547',
  hover: '#ab8c49',
});

export interface Theme {
  themeName: string;

  foreground: 'white' | 'black';
  color: string;
  backgroundColor: string;
  iconColor: string;
  whiteText: string;
  textColor: string;
  cursorColor: string;
  verticalLineColor: string;
  titleBarBackground: string;
  fileContainerBackground: string;
  leftBarContainerBackground: string;
  editorPageBackground: string;
  startContainerBackground: string;
  editorConsoleBackground: string;
  mobileEditorBarBackground?: string;
  editorBackground: string;
  homeStartContainerBackground: string;
  selectedUserBackground: string;
  selectedProjectBackground: string;
  selectedFileBackground: string;
  hoverFileBackground: string;
  hoverOptionBackground: string;
  hoverButtonBackground: string;
  confirmMessageBackground: string;
  successMessageBackground: string;
  compileWarningColor: string;
  dialogBoxTitleBackground: string;
  unselectedBackground: string;
  contextMenuBackground: string;
  boxShadow: string;
  selectedClassBackground: string;
  buttonColors: ButtonColors;
  leaderboardHighlightBackground: string;
  leaderboardHighlightHoverBackground: string;
  cardColors: {
    textColor: string;
    alternateTextColor: string;
  };

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

  transparentBackgroundColor: (a: number) => string;
  lighten: (frac: number) => string;
  darken: (frac: number) => string;
}

export const COMMON: Theme = {
  themeName: 'common',
  foreground: undefined,
  backgroundColor: undefined,
  transparentBackgroundColor: undefined,
  color: undefined,
  textColor: undefined,
  cursorColor: undefined,
  verticalLineColor: undefined,
  titleBarBackground: undefined,
  startContainerBackground: undefined,
  homeStartContainerBackground: undefined,
  selectedUserBackground: undefined,
  selectedProjectBackground: undefined,
  selectedFileBackground: undefined,
  hoverFileBackground: undefined,
  fileContainerBackground: undefined,
  leftBarContainerBackground: undefined,
  editorPageBackground: undefined,
  editorConsoleBackground: undefined,
  mobileEditorBarBackground: undefined,
  confirmMessageBackground: undefined,
  successMessageBackground: undefined,
  compileWarningColor: undefined,
  editorBackground: undefined,
  hoverOptionBackground: undefined,
  dialogBoxTitleBackground: undefined,
  whiteText: undefined,
  unselectedBackground: undefined,
  borderColor: undefined,
  contextMenuBackground: undefined,
  boxShadow: undefined,
  selectedClassBackground: undefined,
  hoverButtonBackground: undefined,
  buttonColors: undefined,
  cardColors: undefined,

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
  darken: undefined,

  iconColor: undefined
};


export const GRAPHICAL_LIGHT = {
  toolbox: '#fbfbfb',
  toolboxSelected: '#dadada',
  toolboxText: "#212121",
  toolboxHover: '#4C97FF',
  flyout: '#fbfbfb',
  workspace: '#fbfbfb',
};

export const LIGHT: Theme = {
  ...COMMON,
  themeName: 'LIGHT',
  whiteText: 'white',
  textColor: '#202124',
  color: '#30323a',
  cursorColor: '#202124',
  borderColor: '#d7dbe0',
  iconColor: '#5f6368',
  foreground: 'white',
  verticalLineColor: '#5f6368',
  backgroundColor: '#f7f8fa',
  titleBarBackground: '#eef0f3',
  startContainerBackground: '#f1f3f5',
  dialogBoxTitleBackground: '#e9ecef',
  editorPageBackground: '#f7f8fa',
  editorConsoleBackground: '#f3f4f6',
  mobileEditorBarBackground: '#e9ecef',
  editorBackground: '#ffffff',
  contextMenuBackground: '#ffffff',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',

  unselectedBackground: '#eef0f3',
  selectedClassBackground: '#dce8f7',
  fileContainerBackground: '#f1f3f5',
  leftBarContainerBackground: '#eef0f3',
  homeStartContainerBackground: '#f1f3f5',
  confirmMessageBackground: '#d9534f',
  successMessageBackground: '#4f9d69',
  compileWarningColor: '#8a6d00',

  selectedUserBackground: '#e2e6ea',
  selectedProjectBackground: '#e2e6ea',
  selectedFileBackground: '#dce8f7',

  hoverFileBackground: '#e8f1fb',
  hoverOptionBackground: '#e8f1fb',
  hoverButtonBackground: '#e8f1fb',

  leaderboardHighlightBackground: '#e6f4ea',
  leaderboardHighlightHoverBackground: '#cee8d5',

  buttonColors: {
    default: LIGHTMODE_DEFAULT,
    primary: LIGHTMODE_BLUE,
    success: LIGHTMODE_GREEN,
    danger: LIGHTMODE_RED,
    confirm: LIGHTMODE_YES,
    cancel: LIGHTMODE_NO,
  },

  cardColors: {
    textColor: '#202124',
    alternateTextColor: '#ffffff',
  },

  transparentBackgroundColor: (a) => `rgba(255, 255, 255, ${a})`,
  switch: {
    on: {
      primary: 'rgb(0, 0, 0)',
      secondary: 'rgb(72, 139, 73)',
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(0, 0, 0, 0.1)',
    },
  },
  lighten: (frac) => `rgba(0, 0, 0, ${frac})`,
  darken: (frac) => `rgba(255, 255, 255, ${frac})`,
};

export const GRAPHICAL_DARK = {
  toolbox: '#212121',
  toolboxSelected: '#313131',
  toolboxText: "#EEEEEE",
  toolbBoxHover: '#4C97FF',
  flyout: '#212121',
  workspace: '#212121',


};

export const DARK: Theme = {
  ...COMMON,
  themeName: 'DARK',
  color: '#ffffff',
  textColor: '#ffffff',
  borderColor: '#323232',
  foreground: 'black',
  backgroundColor: '#212121',
  verticalLineColor: 'white',
  titleBarBackground: '#212121',
  cursorColor: '#ffffff',
  dialogBoxTitleBackground: '#212121',
  editorPageBackground: '#212121',
  editorConsoleBackground: '#212121',
  mobileEditorBarBackground: "#1e1e1e",
  editorBackground: '#212121',
  contextMenuBackground: '#212121',
  selectedClassBackground: '#b5b5b5',
  fileContainerBackground: '#343436',
  leftBarContainerBackground: '#212121',
  homeStartContainerBackground: '#333333',
  startContainerBackground: '#404040',
  unselectedBackground: '#343436',
  confirmMessageBackground: '#ff1a1a',
  successMessageBackground: '#488b49',
  compileWarningColor: '#fbfc6e',
  boxShadow: '0px 10px 13px -6px rgba(100, 100, 120, 0.2), 0px 1px 31px 0px rgba(120, 120, 150, 0.12), 0px 8px 38px 1px rgba(160, 160, 180, 0.1)',
  selectedUserBackground: '#3f3f3f',
  selectedProjectBackground: '#3f3f3f',
  selectedFileBackground: '#3f3f3f',

  hoverFileBackground: `rgba(255, 255, 255, 0.1)`,
  hoverOptionBackground: `rgba(255, 255, 255, 0.1)`,
  hoverButtonBackground: `rgba(255, 255, 255, 0.1)`,

  leaderboardHighlightBackground: '#2c482f',
  leaderboardHighlightHoverBackground: 'rgba(76, 175, 80, 0.2)',

  buttonColors: {
    default: DARKMODE_DEFAULT,
    primary: DARKMODE_BLUE,
    success: DARKMODE_GREEN,
    danger: DARKMODE_RED,
    confirm: DARKMODE_YES,
    cancel: DARKMODE_NO,
  },

  cardColors: {
    textColor: '#ffffff',
    alternateTextColor: '#ffffff',
  }

  transparentBackgroundColor: (a) => `rgba(${0x21}, ${0x21}, ${0x21}, ${a})`,
  switch: {
    on: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgb(72, 139, 73)',
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(255, 255, 255, 0.1)',
    },
  },
  lighten: (frac) => `rgba(255, 255, 255, ${frac})`,
  darken: (frac) => `rgba(0, 0, 0, ${frac})`,
};

export interface ThemeProps {
  theme: Theme;
}