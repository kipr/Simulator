import * as React from 'react';

import { styled, withStyleDeep } from 'styletron-react';
import { StyleProps } from '../../style';
import { Switch } from '../Switch';
import { ThemeProps } from '../theme';
import Field from '../Field';
import ScrollArea from '../ScrollArea';
import Section from '../Section';
import { Spacer } from '../common';
import { StyledText } from '../../util';
import { DropdownList, OptionDefinition } from '../DropdownList';
import { SurfaceStatePresets } from '../../SurfaceState';

import {
  Items,
} from '../../items';
import EditableList from '../EditableList';
import Item from './Item';
import AddItemDialog, { AddItemAcceptance } from './AddItemDialog';
import { Fa } from '../Fa';
import ItemSettingsDialog from './ItemSettingsDialog';

export interface WorldProps extends StyleProps, ThemeProps {
  items: boolean[];
  onItemChange: (id: string, enabled: boolean) => void;
  
  surfaceName: string;
  onSurfaceChange: (surfaceName: string) => void;
}

namespace UiState {
  export enum Type {
    None,
    AddItem,
    ItemSettings,
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface AddItem {
    type: Type.AddItem;
  }

  export const ADD_ITEM: AddItem = { type: Type.AddItem };

  export interface ItemSettings {
    type: Type.ItemSettings;
    index: number;
  }

  export const itemSettings = (index: number): ItemSettings => ({ type: Type.ItemSettings, index });
}

type UiState = UiState.None | UiState.AddItem | UiState.ItemSettings;

interface WorldState {
  collapsed: { [section: string]: boolean };
  modal: UiState;
}

type Props = WorldProps;
type State = WorldState;

const NAME_STYLE: React.CSSProperties = {
  fontSize: '1.2em'
};



const SURFACE_NAME = StyledText.text({
  text: 'Surface',
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

const StyledListSection = withStyleDeep(StyledSection, {
  padding: 0,
  overflow: 'hidden'
});

const StyledField = styled(Field, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  ':first-child': {
    marginTop: 0
  }
}));

const SURFACE_OPTIONS: OptionDefinition[] = [
  { displayName: SurfaceStatePresets.jbcA.surfaceName, value: SurfaceStatePresets.jbcA.surfaceName },
  { displayName: SurfaceStatePresets.jbcB.surfaceName, value: SurfaceStatePresets.jbcB.surfaceName }
];

const SectionIcon = styled(Fa, (props: ThemeProps) => ({
  marginLeft: `${props.theme.itemPadding}px`,
  paddingLeft: `${props.theme.itemPadding}px`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  opacity: 0.5,
  ':hover': {
    opacity: 1.0
  },
  transition: 'opacity 0.2s'
}));

class World extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapsed: {},
      modal: UiState.NONE
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

  private onSurfaceChange_ = (newSurfaceName: string) => {
    this.props.onSurfaceChange(newSurfaceName);
  };

  private onAddItemAccept_ = (acceptance: AddItemAcceptance) => {
  };

  private onAddItemClick_ = () => this.setState({ modal: UiState.ADD_ITEM });
  private onItemSettingsClick_ = (index: number) => () => this.setState({ modal: UiState.itemSettings(index) });
  private onModalClose_ = () => this.setState({ modal: UiState.NONE });

  private onItemRemove_ = (index: number) => {
  };

  private onItemVisibilityChange_ = (index: number) => (visibility: boolean) => {
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, surfaceName } = props;
    let items = props.items;
    const { collapsed, modal } = state;
    const defaultItemList = Object.keys(Items);
    if (items === undefined) {
      items = [];
    }

    let mockList: EditableList.Item[] = [];
    // Mock list
    for (let i = 0; i < 4; ++i) {
      mockList.push(EditableList.Item.standard({
        component: Item,
        props: { name: 'asd', theme },
        onSettings: this.onItemSettingsClick_(i),
        onVisibilityChange: this.onItemVisibilityChange_(i),
      }, {
        removable: true
      }));
    }

    const itemsName = StyledText.compose({
      items: [
        StyledText.text({
          text: `${mockList.length} Items`,
          style: NAME_STYLE
        }),
        StyledText.component({
          component: SectionIcon,
          props: {
            icon: 'plus',
            theme,
            onClick: this.onAddItemClick_
          }
        })
      ]
    });

    

    return (
      <>
        <ScrollArea theme={theme} style={{ flex: '1 1' }}>
          <Container theme={theme} style={style} className={className}>
            <StyledListSection 
              name={itemsName}
              theme={theme}
              onCollapsedChange={this.onCollapsedChange_('items')}
              collapsed={!collapsed['items']}
              noBodyPadding
            >
              <EditableList onItemRemove={this.onItemRemove_} items={mockList} theme={theme} />
            </StyledListSection>
            <StyledSection theme={theme} name={SURFACE_NAME}>
              <StyledField theme={theme} name={'Surface:'}>
                <DropdownList theme={theme} value={surfaceName} options={SURFACE_OPTIONS} onValueChange={this.onSurfaceChange_} />
              </StyledField>
            </StyledSection>
          </Container>
        </ScrollArea>
        {modal.type === UiState.Type.AddItem && <AddItemDialog theme={theme} onClose={this.onModalClose_} onAccept={this.onAddItemAccept_} />}
        {modal.type === UiState.Type.ItemSettings && <ItemSettingsDialog theme={theme} onClose={this.onModalClose_} onAccept={this.onAddItemAccept_} />}
      </>
    );
  }
}

export default World;