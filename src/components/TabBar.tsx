import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Fa } from './Fa';
import { ThemeProps } from './theme';

export interface TabProps extends ThemeProps, StyleProps {
  description: TabBar.TabDescription;
  selected?: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const TabContainer = styled('div', (props: ThemeProps & { selected: boolean }) => ({
  flex: '1 1',
  borderRight: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.selected ? `rgba(255, 255, 255, 0.1)` : undefined,
  transition: 'background-color 0.2s',
  padding: `${props.theme.itemPadding}px`,
  ':last-child': {
    borderRight: 'none'
  },
  textAlign: 'center',
}));

const TabIcon = styled(Fa, {
  paddingRight: '5px'
});

export class Tab extends React.PureComponent<TabProps> {
  render() {
    const { props } = this;
    const { description, theme, onClick, selected } = props;
    return (
      <TabContainer theme={theme} onClick={onClick} selected={selected}>
        {description.icon ? <TabIcon icon={description.icon} /> : undefined}
        {description.name}
      </TabContainer>
    );
  }
}

export interface TabBarProps extends ThemeProps, StyleProps {
  tabs: TabBar.TabDescription[];
  index: number;

  onIndexChange: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
}

type Props = TabBarProps;

const TabBarContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color
}));

export class TabBar extends React.PureComponent<Props> {
  private onClick_ = (index: number) => (event: React.MouseEvent<HTMLDivElement>) => {
    this.props.onIndexChange(index, event);
  };

  render() {
    const { props } = this;
    const { tabs, index, theme } = props;
    console.log('tabs', tabs);
    return (
      <TabBarContainer theme={theme}>
        {tabs.map((tab, i) => (
          <Tab key={i} selected={i === index} theme={theme} description={tab} onClick={this.onClick_(i)} />
        ))}
      </TabBarContainer>
    );
  }
}

export namespace TabBar {
  export interface TabDescription {
    name: string;
    icon?: string;
  }
}