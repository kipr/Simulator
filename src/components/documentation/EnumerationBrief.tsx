import * as React from 'react';
import { styled } from 'styletron-react';

import EnumerationDocumentation from '../../state/State/Documentation/EnumerationDocumentation';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';
import { Decoration, Keyword, Type } from './common';
import FileName from './FileName';

export interface EnumerationBriefProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  enumeration: EnumerationDocumentation;
  onClick?: (event: React.MouseEvent) => void;
}

type Props = EnumerationBriefProps;

const StyledEnumerationName = styled(FileName, ({ theme }: ThemeProps) => ({
  display: 'block',
  marginBottom: `${theme.itemPadding}px`,
  ':last-child': {
    marginBottom: 0
  },
}));

const EnumerationBrief = ({ language, theme, enumeration, onClick, style, className }: Props) => (
  <StyledEnumerationName
    theme={theme}
    style={style}
    className={className}
    onClick={onClick}
  >
    {language === 'c' ? (
      <>
        <Keyword>enum</Keyword>
        {' '}
        <Type $language={language}>{enumeration.name}</Type>
      </>
    ) : (
      <>
        <Type $language={language}>{enumeration.name}</Type>
        {' = '}
        <Keyword>enum.Enum</Keyword>
      </>
    )}
  </StyledEnumerationName>
);

export default EnumerationBrief;