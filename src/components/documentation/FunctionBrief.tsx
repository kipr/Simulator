import * as React from 'react';
import { styled } from 'styletron-react';

import FunctionDocumentation from '../../state/State/Documentation/FunctionDocumentation';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';
import { Decoration, FunctionName, ParameterName, Type } from './common';
import FunctionPrototype from './FunctionPrototype';

const Container = styled('div', ({ onClick }: { onClick?: (event: React.MouseEvent) => void }) => ({
  cursor: onClick ? 'pointer' : 'default',
}));

export interface FunctionBriefProps extends StyleProps, ThemeProps {
  func: FunctionDocumentation;
  onClick?: (event: React.MouseEvent) => void;
}

type Props = FunctionBriefProps;

const StyledFunctionPrototype = styled(FunctionPrototype, ({ theme }: ThemeProps) => ({
  marginBottom: `${theme.itemPadding}px`,
  ':last-child': {
    marginBottom: 0
  }
}));

const FunctionBrief = ({ func, onClick, style, className, theme }: Props) => (
  <StyledFunctionPrototype
    theme={theme}
    func={func}
    onClick={onClick}
    style={style}
    className={className}
  />
);

export default FunctionBrief;