import { IconProp } from '@fortawesome/fontawesome-svg-core';
import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Fa } from './Fa';
import { ThemeProps } from './theme';

export interface TabProps extends ThemeProps, StyleProps {
  description: TabBar.TabDescription;
  selected?: boolean;
  vertical?: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const TabContainer = styled('div', (props: ThemeProps & { selected: boolean, $vertical: boolean }) => ({
  flex: '1 1',
  borderRight: `1px solid ${props.theme.borderColor}`,
  borderBottom: props.$vertical ? `1px solid ${props.theme.borderColor}` : null,
  backgroundColor: props.selected ? `rgba(255, 255, 255, 0.1)` : `rgba(0, 0, 0, 0.1)`,
  opacity: props.selected ? 1 : 0.2,
  transition: 'background-color 0.2s, opacity 0.2s',
  padding: `calc(${props.theme.itemPadding * 2}px + 0.5em)`,
  ':last-child': {
    borderRight: 'none',
    borderBottom: 'none'
  },
  textAlign: 'center',
  userSelect: 'none',
  cursor: props.selected ? 'auto' : 'pointer',
  position: 'relative',
  minWidth: '45px',
}));

const TabIcon = styled(Fa, {
  paddingRight: '5px'
});

const TabText = styled('div',  (props: { $vertical: boolean }) => ({
  position: 'absolute', 
  left: '50%', 
  top: '50%',
  transform: (props.$vertical) ? 'translate(-50%, -50%) rotate(-90deg)' : 'translate(-50%, -50%)',
  transformOrigin: 'center',
  textAlign: 'center',
  display: 'flex',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',
}));

export class Tab extends React.PureComponent<TabProps> {
  render() {
    const { props } = this;
    const { description, theme, onClick, selected, vertical } = props;
    return (
      <TabContainer theme={theme} onClick={onClick} selected={selected} $vertical={vertical}>
        <TabText $vertical={vertical}>
          {description.icon ? <TabIcon icon={description.icon} /> : undefined}
          {description.name}
        </TabText>
      </TabContainer>
    );
  }
}

export interface TabBarProps extends ThemeProps, StyleProps {
  tabs: TabBar.TabDescription[];
  index: number;
  isVertical?: boolean;
  onIndexChange: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
}


type Props = TabBarProps;

const TabBarContainer = styled('div', (props: ThemeProps & { $vertical: boolean }) => ({
  display: 'flex',
  flexDirection: (props.$vertical) ? 'column' : 'row' ,
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  
}));

export class TabBar extends React.PureComponent<Props> {
  private onClick_ = (index: number) => (event: React.MouseEvent<HTMLDivElement>) => {
    this.props.onIndexChange(index, event);
  };

  render() {
    const { props } = this;
    const { tabs, index, theme, style, className, isVertical } = props;

    return (
      <TabBarContainer theme={theme} style={style} className={className} $vertical={isVertical}>
        {tabs.map((tab, i) => (
          <Tab key={i} selected={i === index} theme={theme} description={tab} onClick={this.onClick_(i)} vertical={isVertical} />
        ))}
      </TabBarContainer>
    );
  }
}

export namespace TabBar {
  export interface TabDescription {
    name: string;
    icon?: IconProp;
  }
}