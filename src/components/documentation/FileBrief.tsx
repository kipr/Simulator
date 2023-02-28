import * as React from 'react';
import { styled } from 'styletron-react';

import FileDocumentation from '../../state/State/Documentation/FileDocumentation';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';
import FileName from './FileName';

export interface FileBriefProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  file: FileDocumentation;
  onClick?: (event: React.MouseEvent) => void;
}

type Props = FileBriefProps;

const StyledFileName = styled(FileName, ({ theme }: ThemeProps) => ({
  display: 'block',
  marginBottom: `${theme.itemPadding}px`,
  ':last-child': {
    marginBottom: 0
  },
}));

const FileBrief = ({ language, theme, file, onClick, style, className }: Props) => (
  <StyledFileName
    theme={theme}
    style={style}
    className={className}
    onClick={onClick}
  >
    {language === 'c' ? file.name : file.name.replace(/\.hp?p?$/, '.py')}
  </StyledFileName>
);

export default FileBrief;