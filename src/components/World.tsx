import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Switch } from './Switch';
import { ThemeProps } from './theme';
import Field from './Field';
import ScrollArea from './ScrollArea';
import Section from './Section';
import { Spacer } from './common';
import { StyledText } from '../util';

import {
  Items,
} from '../items';

export interface WorldProps extends StyleProps, ThemeProps {
  items: boolean[];
  onItemChange: (id: string, enabled: boolean) => void;
}

interface WorldState {
  collapsed: { [section: string]: boolean }
}

type Props = WorldProps;
type State = WorldState;

const NAME_STYLE: React.CSSProperties = {
  fontSize: '1.2em'
};

const ITEMS_NAME = StyledText.text({
  text: 'Items',
  style: NAME_STYLE
});

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  color: props.theme.color,
  padding: '10px'
}));

const StyledSection = styled(Section, {
  marginTop: '10px',
  ':first-child': {
    marginTop: 0
  },
});

const StyledField = styled(Field, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  ':first-child': {
    marginTop: 0
  }
}));

class World extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapsed: {}
    };
  }

  private onItemChange_ = (id: string) => (value: boolean) => {
    this.props.onItemChange(id, value);
  };

  private onCollapsedChange_ = (section: string) => (collapsed: boolean) => {
    this.setState({
      collapsed: {
        ...this.state.collapsed,
        [section]: !collapsed
      }
    });
  };

  render() {
    const { props, state } = this;
    const { style, className, theme } = props;
    let items = props.items;
    const { collapsed } = state;
    const defaultItemList = Object.keys(Items);
    if (items === undefined) {
      items = [];
    }
    console.log(items.length);
    return (
      <ScrollArea theme={theme} style={{ flex: '1 1' }}>
        <Container theme={theme} style={style} className={className}>
          <StyledSection 
            name={ITEMS_NAME}
            theme={theme}
            onCollapsedChange={this.onCollapsedChange_('items')}
            collapsed={!collapsed['items']}
          >
            { items.map((item, i) => (
              <StyledField key={i} theme={theme} name={defaultItemList[i]}>
                <Spacer />
                <Switch value={item} onValueChange={this.onItemChange_(defaultItemList[i])} theme={theme} />
              </StyledField>
            ))}
          </StyledSection>
        </Container>
      </ScrollArea>
    );
  }
}

export default World;