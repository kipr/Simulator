import * as React from 'react';
import { styled } from 'styletron-react';

import StructureDocumentation from '../../state/State/Documentation/StructureDocumentation';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';
import { Decoration, Keyword, Type } from './common';
import FileName from './FileName';

export interface StructureBriefProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  structure: StructureDocumentation;
  onClick?: (event: React.MouseEvent) => void;
}

type Props = StructureBriefProps;

const StyledStructureName = styled(FileName, ({ theme }: ThemeProps) => ({
  display: 'block',
  marginBottom: `${theme.itemPadding}px`,
  ':last-child': {
    marginBottom: 0
  },
}));

const StructureBrief = ({ language, theme, structure, onClick, style, className }: Props) => (
  <StyledStructureName
    theme={theme}
    style={style}
    className={className}
    onClick={onClick}
  >
    {language === 'c' ? (
      <>
        <Keyword>struct</Keyword>
        {' '}
        <Type $language={language}>{structure.name}</Type>
      </>
    ) : (
      <>
        <Type $language={language}>{structure.name}</Type>
        {' = '}
        <Keyword>dataclass</Keyword>
        <Decoration>(</Decoration>
        <Keyword>frozen</Keyword>
        <Decoration>)</Decoration>
      </>
    )}
  </StyledStructureName>
);

export default StructureBrief;