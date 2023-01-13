import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

import { Spacer } from './common';
import { AnyText } from '../util';
import { Text } from './Text';
import { Fa } from './Fa';

import { faCaretDown, faCaretUp, faFile } from '@fortawesome/free-solid-svg-icons';

const Container = styled('div', ({ theme, $noBorder }: ThemeProps & { $noBorder: boolean }) => ({
  width: '100%',
  overflow: 'none',
  borderTop: !$noBorder ? `1px solid ${theme.borderColor}` : undefined,
  ':first-child': {
    borderTop: 'none'
  }
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
  private onCollapseClick_ = () => {
    if (!this.props.onCollapsedChange) return;
    this.props.onCollapsedChange(!this.props.collapsed);
  };

  render() {
    const { props } = this;
    const { name, theme, children, collapsed, onCollapsedChange, style, className, noBodyPadding, noHeaderPadding, noBorder } = props;
    return (
      <Container
        theme={theme}
        style={style}
        className={className}
        $noBorder={noBorder}
      >
        <Header
          theme={theme}
          $noPadding={noHeaderPadding}
          $canCollapse={!!onCollapsedChange}
          onClick={this.onCollapseClick_}
        >
          <Name text={name} />
          <Spacer />
          {onCollapsedChange && (
            <Fa
              icon={!collapsed ? faCaretUp : faCaretDown}
              onClick={this.onCollapseClick_}
            />
          )}
        </Header>
        {!collapsed && (
          <Body
            $noPadding={noBodyPadding}
            theme={theme}
          >
            {children}
          </Body>
        )}
      </Container>
    );
  }
}

export default Section;