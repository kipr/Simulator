import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

import { Spacer } from './common';
import { AnyText, StyledText } from '../util';
import { Text } from './Text';
import { Fa } from './Fa';


const Container = styled('div', ({ theme }: ThemeProps) => ({
  width: '100%',
  borderRadius: `${theme.itemPadding}px`,
  overflow: 'none',
  border: `1px solid ${theme.borderColor}`
}));

const Name = styled(Text, {
  userSelect: 'none'
});

const Header = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  fontSize: '9pt',
  padding: `${props.theme.itemPadding}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: `rgba(0, 0, 0, 0.1)`,
  ':last-child': {
    borderBottom: 'none'
  }
}));

const Body = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding}px`
}));

export interface SectionProps extends ThemeProps, StyleProps {
  name: AnyText;
  children?: any;

  collapsed?: boolean;

  onCollapsedChange?: (collapsed: boolean) => void;
}

type Props = SectionProps;

class Section extends React.PureComponent<Props> {
  private onCollapseClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.props.onCollapsedChange(!this.props.collapsed);
  };

  render() {
    const { props } = this;
    const { name, theme, children, collapsed, onCollapsedChange, style, className } = props;
    return (
      <Container theme={theme} style={style} className={className}>
        <Header theme={theme}>
          <Name text={name} />
          <Spacer />
          {onCollapsedChange ? <Fa icon={!collapsed ? 'caret-up' : 'caret-down'} onClick={this.onCollapseClick_} /> : undefined}
        </Header>
        {!collapsed ? <Body theme={theme}>{children}</Body> : undefined}
      </Container>
    );
  }
}

export default Section;