import * as React from 'react';
import { styled } from 'styletron-react';

import ModuleDocumentation from '../../state/State/Documentation/ModuleDocumentation';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';
import ModuleName from './ModuleName';

export interface FileBriefProps extends StyleProps, ThemeProps {
  module: ModuleDocumentation;
  onClick?: (event: React.MouseEvent) => void;
}

type Props = FileBriefProps;

const StyledModuleName = styled(ModuleName, ({ theme }: ThemeProps) => ({
  display: 'block',
  marginBottom: `${theme.itemPadding}px`,
  ':last-child': {
    marginBottom: 0
  },
}));

const ModuleBrief = ({ theme, module, onClick, style, className }: Props) => (
  <StyledModuleName
    theme={theme}
    style={style}
    className={className}
    onClick={onClick}
  >
    {module.name}
  </StyledModuleName>
);

export default ModuleBrief;