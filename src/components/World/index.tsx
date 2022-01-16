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
import AddItemDialog, { AddNodeAcceptance } from './AddNodeDialog';
import { Fa } from '../Fa';
import NodeSettingsDialog, { NodeSettingsAcceptance } from './NodeSettingsDialog';
import { connect } from 'react-redux';

import { State as ReduxState } from '../../state';

import { SceneAction } from '../../state/reducer';

import * as uuid from 'uuid';
import { Rotation, Vector3 } from '../../unit-math';
import ComboBox from '../ComboBox';
import Scene from '../../state/State/Scene';
import Node from '../../state/State/Scene/Node';
import AddNodeDialog from './AddNodeDialog';
import { Scenes } from '../../state/State';
import Async from '../../state/State/Async';
import Dict from '../../Dict';
import Geometry from '../../state/State/Scene/Geometry';

export interface WorldProps extends StyleProps, ThemeProps {
}

interface ReduxWorldProps {
  scene: Scene;
  scenes: Scenes;

  onNodeAdd: (id: string, node: AddNodeAcceptance) => void;
  onNodeRemove: (id: string) => void;
  onNodeChange: (id: string, node: Node) => void;

  onGeometryAdd: (id: string, geometry: Geometry) => void;
  onGeometryRemove: (id: string) => void;
  onGeometryChange: (id: string, geometry: Geometry) => void;
}

namespace UiState {
  export enum Type {
    None,
    AddNode,
    NodeSettings,
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface AddNode {
    type: Type.AddNode;
  }

  export const ADD_NODE: AddNode = { type: Type.AddNode };

  export interface NodeSettings {
    type: Type.NodeSettings;
    id: string;
  }

  export const itemSettings = (id: string): NodeSettings => ({ type: Type.NodeSettings, id });
}

type UiState = UiState.None | UiState.AddNode | UiState.NodeSettings;

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

  private onNodeChange_ = (id: string) => (node: Node) => {
    this.props.onNodeChange(id, node);
  };

  private onCollapsedChange_ = (section: string) => (collapsed: boolean) => {
    this.setState({
      collapsed: {
        ...this.state.collapsed,
        [section]: collapsed
      }
    });
  };

  private onAddNodeAccept_ = (acceptance: AddNodeAcceptance) => {
    

    this.setState({ modal: UiState.NONE }, () => {
      this.props.onNodeAdd(uuid.v4(), acceptance);
    });
  };

  private onNodeSettingsAccept_ = (id: string) => (acceptance: NodeSettingsAcceptance) => {
    this.props.onNodeChange(id, acceptance);
  };

  private onAddNodeClick_ = () => this.setState({ modal: UiState.ADD_NODE });
  private onNodeResetClick_ = (id: string) => () => {
    const { props } = this;
    const { scenes } = props;
    const originalScene = scenes.scenes[scenes.activeId];
    
    if (!originalScene || originalScene.type !== Async.Type.Loaded) return;

    const originalNode = originalScene.value.nodes[id];


    if (!originalNode?.origin) return;
    
    this.props.onNodeChange(id, {
      ...originalNode,
      origin: {
        position: originalNode.origin.position ?? Vector3.zero(),
        orientation: originalNode.origin.orientation ?? Rotation.Euler.identity(),
      },
    });
  };
  private onItemSettingsClick_ = (id: string) => () => this.setState({ modal: UiState.itemSettings(id) });
  private onModalClose_ = () => this.setState({ modal: UiState.NONE });

  private onNodeRemove_ = (index: number, id?: unknown) => {
    this.props.onNodeRemove(id as string);
  };

  private onItemVisibilityChange_ = (id: string) => (visibility: boolean) => {
    this.props.onNodeChange(id, {
      ...this.props.scene.nodes[id],
      
    });
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, scene, onGeometryAdd, onGeometryRemove, onGeometryChange } = props;
    const { collapsed, modal } = state;


    const itemList: EditableList.Item[] = [];
    // Mock list
    for (const nodeId of Dict.keySet(scene.nodes)) {
      const node = scene.nodes[nodeId];
      itemList.push(EditableList.Item.standard({
        component: Item,
        props: { name: node.name, theme },
        onReset: this.onNodeResetClick_(nodeId),
        onSettings: this.onItemSettingsClick_(nodeId),
        onVisibilityChange: this.onItemVisibilityChange_(nodeId),
        visible: node.visible,
      }, {
        removable: node.editable,
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
            onClick: this.onAddNodeClick_
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
              collapsed={collapsed['items']}
              noBodyPadding
            >
              <EditableList onItemRemove={this.onNodeRemove_} items={itemList} theme={theme} />
            </StyledListSection>
          </Container>
        </ScrollArea>
        {modal.type === UiState.Type.AddNode && <AddNodeDialog scene={scene} theme={theme} onClose={this.onModalClose_} onAccept={this.onAddNodeAccept_} />}
        {modal.type === UiState.Type.NodeSettings && <NodeSettingsDialog
          onGeometryAdd={onGeometryAdd}
          onGeometryRemove={onGeometryRemove}
          onGeometryChange={onGeometryChange}
          scene={scene}
          id={modal.id}
          node={scene.nodes[modal.id]}
          theme={theme}
          onClose={this.onModalClose_}
          onChange={this.onNodeSettingsAccept_(modal.id)}
        />}
      </>
    );
  }
}

export default connect<unknown, unknown, Props, ReduxState>(state => {
  return {
    scene: state.scene,
    scenes: state.scenes
  };
}, (dispatch) => ({
  onNodeAdd: (id: string, node: Node) => {
    dispatch(SceneAction.addNode({ id, node }));
  },
  onNodeChange: (id: string, node: Node) => {
    dispatch(SceneAction.setNode({ id, node }));
  },
  onNodeRemove: (id: string) => {
    dispatch(SceneAction.removeNode({ id }));
  },
  onGeometryAdd: (id: string, geometry: Geometry) => {
    dispatch(SceneAction.addGeometry({ id, geometry }));
  },
  onGeometryChange: (id: string, geometry: Geometry) => {
    dispatch(SceneAction.setGeometry({ id, geometry }));
  },
  onGeometryRemove: (id: string) => {
    dispatch(SceneAction.removeGeometry({ id }));
  }

}))(World) as React.ComponentType<Props>;