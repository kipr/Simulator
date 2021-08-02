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

import EditableList from '../EditableList';
import Item from './Item';
import AddItemDialog, { AddItemAcceptance } from './AddItemDialog';
import { Fa } from '../Fa';
import ItemSettingsDialog, { ItemSettingsAcceptance } from './ItemSettingsDialog';
import { connect } from 'react-redux';

import { State as ReduxState, Item as ReduxItem } from '../../state';
import { SceneAction } from '../../state/reducer';

import * as uuid from 'uuid';
import { Rotation, Vector3 } from '../../unit-math';
import ComboBox from '../ComboBox';

export interface WorldProps extends StyleProps, ThemeProps {
  

  surfaceName: string;
  onSurfaceChange: (surfaceName: string) => void;
}

interface ReduxWorldProps {
  itemOrdering: string[];
  items: { [key: string]: ReduxItem };

  onItemAdd: (id: string, item: ReduxItem) => void;
  onItemChange: (id: string, item: ReduxItem) => void;
  onItemRemove: (id: string) => void;
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
    id: string;
  }

  export const itemSettings = (id: string): ItemSettings => ({ type: Type.ItemSettings, id });
}

type UiState = UiState.None | UiState.AddItem | UiState.ItemSettings;

interface WorldState {
  collapsed: { [section: string]: boolean };
  modal: UiState;
}

type Props = WorldProps;
type State = WorldState;




const SURFACE_NAME = StyledText.text({
  text: 'Scene',
});

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  color: props.theme.color,
}));

const StyledSection = styled(Section, {
});

const StyledListSection = withStyleDeep(StyledSection, {
  padding: 0,
  overflow: 'hidden'
});

const StyledField = styled(Field, (props: ThemeProps) => ({

}));

const SURFACE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option(SurfaceStatePresets.jbcA.surfaceName, SurfaceStatePresets.jbcA.surfaceName),
  ComboBox.option(SurfaceStatePresets.jbcB.surfaceName, SurfaceStatePresets.jbcB.surfaceName),
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

class World extends React.PureComponent<Props & ReduxWorldProps, State> {
  constructor(props: Props & ReduxWorldProps) {
    super(props);

    this.state = {
      collapsed: {},
      modal: UiState.NONE
    };
  }

  private onItemChange_ = (id: string) => (item: ReduxItem) => {
    this.props.onItemChange(id, item);
  };

  private onCollapsedChange_ = (section: string) => (collapsed: boolean) => {
    this.setState({
      collapsed: {
        ...this.state.collapsed,
        [section]: collapsed
      }
    });
  };

  private onSurfaceChange_ = (index: number, option: ComboBox.Option) => {
    this.props.onSurfaceChange(option.data as string);
  };

  private onAddItemAccept_ = (acceptance: AddItemAcceptance) => {
    

    this.setState({ modal: UiState.NONE }, () => {
      this.props.onItemAdd(uuid.v4(), acceptance);
    });
  };

  private onItemSettingsAccept_ = (id: string) => (acceptance: ItemSettingsAcceptance) => {
    this.props.onItemChange(id, acceptance);
  };

  private onAddItemClick_ = () => this.setState({ modal: UiState.ADD_ITEM });
  private onItemResetClick_ = (id: string) => () => {
    const item = this.props.items[id];
    if (!item?.startingOrigin) return;
    
    this.props.onItemChange(id, {
      ...item,
      origin: {
        position: item.startingOrigin.position ?? Vector3.zero(),
        orientation: item.startingOrigin.orientation ?? Rotation.Euler.identity(),
      },
    });
  };
  private onItemSettingsClick_ = (id: string) => () => this.setState({ modal: UiState.itemSettings(id) });
  private onModalClose_ = () => this.setState({ modal: UiState.NONE });

  private onItemRemove_ = (index: number) => {
    const { itemOrdering } = this.props;
    this.props.onItemRemove(itemOrdering[index]);
  };

  private onItemVisibilityChange_ = (id: string) => (visibility: boolean) => {
    this.props.onItemChange(id, {
      ...this.props.items[id],
      visible: visibility
    });
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, surfaceName, items, itemOrdering } = props;
    const { collapsed, modal } = state;


    const itemList: EditableList.Item[] = [];
    // Mock list
    for (const id of itemOrdering) {
      const item = items[id];
      itemList.push(EditableList.Item.standard({
        component: Item,
        props: { name: item.name, theme },
        onReset: this.onItemResetClick_(id),
        onSettings: this.onItemSettingsClick_(id),
        onVisibilityChange: this.onItemVisibilityChange_(id),
        visible: item.visible,
      }, {
        removable: item.removable === undefined ? true : item.removable,
      }));
    }

    const itemsName = StyledText.compose({
      items: [
        StyledText.text({
          text: `Item${itemList.length === 1 ? '' : 's'} (${itemList.length})`,
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
            <StyledSection theme={theme} name={SURFACE_NAME}>
              <StyledField theme={theme} name='Surface'>
                <ComboBox
                  theme={theme}
                  index={SURFACE_OPTIONS.findIndex(s => s.text === surfaceName)}
                  onSelect={this.onSurfaceChange_}
                  options={SURFACE_OPTIONS}
                />
              </StyledField>
            </StyledSection>
            <StyledListSection 
              name={itemsName}
              theme={theme}
              onCollapsedChange={this.onCollapsedChange_('items')}
              collapsed={collapsed['items']}
              noBodyPadding
            >
              <EditableList onItemRemove={this.onItemRemove_} items={itemList} theme={theme} />
            </StyledListSection>
          </Container>
        </ScrollArea>
        {modal.type === UiState.Type.AddItem && <AddItemDialog theme={theme} onClose={this.onModalClose_} onAccept={this.onAddItemAccept_} />}
        {modal.type === UiState.Type.ItemSettings && <ItemSettingsDialog item={items[modal.id]} theme={theme} onClose={this.onModalClose_} onChange={this.onItemSettingsAccept_(modal.id)} />}
      </>
    );
  }
}

export default connect<unknown, unknown, Props, ReduxState>(state => {
  const { itemOrdering, items } = state.scene;

  return {
    itemOrdering,
    items,
  };
}, (dispatch) => ({
  onItemChange: (id: string, item: ReduxItem) => {
    dispatch(SceneAction.setItem({ id, item }));
  },
  onItemAdd: (id: string, item: ReduxItem) => {
    dispatch(SceneAction.addItem({ id, item }));
  },
  onItemRemove: (id: string) => {
    dispatch(SceneAction.removeItem({ id }));
  }
}))(World) as React.ComponentType<Props>;