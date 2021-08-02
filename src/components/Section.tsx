import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

import { Spacer } from './common';
import { AnyText } from '../util';
import { Text } from './Text';
import { Fa } from './Fa';


const Container = styled('div', ({ theme, $noBorder }: ThemeProps & { $noBorder: boolean }) => ({
  width: '100%',
  overflow: 'none',
  borderBottom: !$noBorder ? `1px solid ${theme.borderColor}` : undefined,
}));

const Name = styled(Text, {
  userSelect: 'none'
});

const Header = styled('div', (props: ThemeProps & { $noPadding?: boolean; $canCollapse?: boolean; }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  fontSize: '16px',
  fontWeight: 400,
  padding: props.$noPadding ? undefined : `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    borderBottom: 'none'
  },
  ':hover': props.$canCollapse ? {
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : undefined,
  cursor: props.$canCollapse ? 'pointer' : undefined,
  transition: 'background-color 0.2s',
}));

const Body = styled('div', (props: ThemeProps & { $noPadding?: boolean; }) => ({
  padding: props.$noPadding ? undefined : `${props.theme.itemPadding * 2}px`
}));

export interface SectionProps extends ThemeProps, StyleProps {
  name: AnyText;
  children: React.ReactNode;

  collapsed?: boolean;

  onCollapsedChange?: (collapsed: boolean) => void;

  noHeaderPadding?: boolean;
  noBodyPadding?: boolean;
  noBorder?: boolean;
}

type Props = SectionProps;

class Section extends React.PureComponent<Props> {
  private onCollapseClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (!this.props.onCollapsedChange) return;
    this.props.onCollapsedChange(!this.props.collapsed);
  };

  render() {
    const { props } = this;
    const { name, theme, children, collapsed, onCollapsedChange, style, className, noBodyPadding, noHeaderPadding, noBorder } = props;
    return (
      <Container theme={theme} style={style} className={className} $noBorder={noBorder}>
        <Header theme={theme} $noPadding={noHeaderPadding} $canCollapse={!!onCollapsedChange} onClick={this.onCollapseClick_}>
          <Name text={name} />
          <Spacer />
          {onCollapsedChange ? <Fa icon={!collapsed ? 'caret-up' : 'caret-down'} onClick={this.onCollapseClick_} /> : undefined}
        </Header>
        {!collapsed ? <Body $noPadding={noBodyPadding} theme={theme}>{children}</Body> : undefined}
      </Container>
    );
  }
}

export default Section;