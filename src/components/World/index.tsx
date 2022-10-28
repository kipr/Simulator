import * as React from 'react';

import { styled, withStyleDeep } from 'styletron-react';
import { StyleProps } from '../../style';
import { Switch } from '../Switch';
import { Theme, ThemeProps } from '../theme';
import Field from '../Field';
import ScrollArea from '../ScrollArea';
import Section from '../Section';
import { Spacer } from '../common';
import { Angle, StyledText } from '../../util';
import { DropdownList, OptionDefinition } from '../DropdownList';

import EditableList from '../EditableList';
import Item from './Item';
import AddNodeDialog, { AddNodeAcceptance } from './AddNodeDialog';
import { Fa } from '../Fa';
import NodeSettingsDialog, { NodeSettingsAcceptance } from './NodeSettingsDialog';
import { connect } from 'react-redux';

import { State as ReduxState } from '../../state';

import { ScenesAction } from '../../state/reducer';

import * as uuid from 'uuid';
import { ReferenceFrame, Rotation, Vector3 } from '../../unit-math';
import { Vector3 as RawVector3 } from '../../math';
import ComboBox from '../ComboBox';
import Node from '../../state/State/Scene/Node';
import Dict from '../../Dict';
import Geometry from '../../state/State/Scene/Geometry';

import { Button } from '../Button';
import { BarComponent } from '../Widget';
import { faGlobeAmericas, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import Scene, { AsyncScene } from '../../state/State/Scene';
import Async from '../../state/State/Async';
import LocalizedString from '../../util/LocalizedString';

namespace SceneState {
  export enum Type {
    Clean,
    Saveable,
    Copyable
  }

  export interface Clean {
    type: Type.Clean;
  }

  export const CLEAN: Clean = { type: Type.Clean };

  export interface Saveable {
    type: Type.Saveable;
  }

  export const SAVEABLE: Saveable = { type: Type.Saveable };

  export interface Copyable {
    type: Type.Copyable;
  }

  export const COPYABLE: Copyable = { type: Type.Copyable };
}

export type SceneState = SceneState.Clean | SceneState.Saveable | SceneState.Copyable;

export const createWorldBarComponents = ({ theme, saveable, onSelectScene, onSaveScene, onCopyScene }: {
  theme: Theme,
  saveable: boolean,
  onSelectScene: () => void,
  onSaveScene: () => void,
  onCopyScene: () => void
}) => {
  const worldBar: BarComponent<object>[] = [];

  worldBar.push(BarComponent.create(Button, {
    theme,
    onClick: onSelectScene,
    children:
      <>
        <Fa icon={faGlobeAmericas} />
        {' Select Scene'}
      </>,
  }));

  worldBar.push(BarComponent.create(Button, {
    theme,
    onClick: onSaveScene,
    disabled: !saveable,
    children:
      <>
        <Fa icon={faSave} />
        {' Save Scene'}
      </>,
  }));

  worldBar.push(BarComponent.create(Button, {
    theme,
    onClick: onCopyScene,
    children:
      <>
        <Fa icon={faPlus} />
        {' Copy Scene'}
      </>,
  }));

  return worldBar;
};

export interface WorldProps extends StyleProps, ThemeProps {
  sceneId: string;

}

interface ReduxWorldProps {
  scene: AsyncScene;

  onNodeAdd: (id: string, node: Node) => void;
  onNodeRemove: (id: string) => void;
  onNodeChange: (id: string, node: Node, modifyReferenceScene: boolean, modifyOrigin: boolean) => void;

  onObjectAdd: (id: string, object: Node.Obj, geometry: Geometry) => void;

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

class World_ extends React.PureComponent<Props & ReduxWorldProps, State> {
  constructor(props: Props & ReduxWorldProps) {
    super(props);

    this.state = {
      collapsed: {},
      modal: UiState.NONE
    };
  }

  private onCollapsedChange_ = (section: string) => (collapsed: boolean) => {
    this.setState({
      collapsed: {
        ...this.state.collapsed,
        [section]: collapsed
      }
    });
  };

  private onAddNodeAccept_ = (acceptance: AddNodeAcceptance) => {
    if (acceptance.node.type === 'object' && acceptance.geometry) {
      const object: Node.Obj = acceptance.node;
      this.setState({ modal: UiState.NONE }, () => {
        this.props.onObjectAdd(uuid.v4(), object, acceptance.geometry);
      });
    } else {
      this.setState({ modal: UiState.NONE }, () => {
        this.props.onNodeAdd(uuid.v4(), acceptance.node);
      });
    }
  };

  private onNodeSettingsAccept_ = (id: string) => (acceptance: NodeSettingsAcceptance) => {
    this.props.onNodeChange(id, acceptance, true, false);
  };

  private onNodeOriginAccept_ = (id: string) => (origin: ReferenceFrame) => {
    const originalNode = Async.previousValue(this.props.scene).nodes[id];
    this.props.onNodeChange(id, {
      ...originalNode,
      origin: {
        ...originalNode.origin,
        ...origin,
      },
    }, true, true);
  };

  private onAddNodeClick_ = (event: React.SyntheticEvent<MouseEvent>) => {
    this.setState({ modal: UiState.ADD_NODE });
    event.stopPropagation();
    event.preventDefault();
  };

  private onNodeResetClick_ = (id: string) => () => {
    const { props } = this;
    const { scene } = props;

    const originalNode = Async.previousValue(scene).nodes[id];
    
    this.props.onNodeChange(id, {
      ...originalNode,
      origin: {
        position: originalNode.origin?.position || Vector3.zero('centimeters'),
        orientation: originalNode.origin?.orientation || Rotation.Euler.identity(Angle.Type.Degrees),
        scale: originalNode.origin?.scale || RawVector3.ONE,
      },
    }, false, true);
  };
  private onItemSettingsClick_ = (id: string) => () => this.setState({ modal: UiState.itemSettings(id) });
  private onModalClose_ = () => this.setState({ modal: UiState.NONE });

  private onNodeRemove_ = (index: number, id?: unknown) => {
    const { props } = this;
    const { scene } = props;
    const idStr = id as string;

    const referenceScene = Async.previousValue(scene);
    
    const node = referenceScene.nodes[idStr];
    if (node.type === 'object') {
      if (node.geometryId !== undefined) {
        let unique = true;
        for (const nodeId in referenceScene.nodes) {
          const otherNode = referenceScene.nodes[nodeId];
          if (nodeId !== idStr && otherNode.type === 'object' && node.geometryId === otherNode.geometryId) {
            unique = false;
            break;
          }
        }
        if (unique) {
          this.props.onGeometryRemove(node.geometryId);
        }
      }
    }

    this.props.onNodeRemove(idStr);
  };

  private onItemVisibilityChange_ = (id: string) => (visibility: boolean) => {
    const originalNode = Async.previousValue(this.props.scene).nodes[id];

    this.props.onNodeChange(id, {
      ...originalNode,
      visible: visibility,
    }, true, false);
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, scene, onGeometryAdd, onGeometryRemove, onGeometryChange } = props;
    const { collapsed, modal } = state;

    const itemList: EditableList.Item[] = [];

    const workingScene = Async.latestValue(scene);
    const referenceScene = Async.previousValue(scene);
    // Mock list
    for (const nodeId of Dict.keySet(workingScene.nodes)) {
      const node = workingScene.nodes[nodeId];
      const hasReset = referenceScene.nodes[nodeId] !== undefined;
      itemList.push(EditableList.Item.standard({
        component: Item,
        props: { name: node.name[LocalizedString.EN_US], theme },
        onReset: hasReset ? this.onNodeResetClick_(nodeId) : undefined,
        onSettings: node.editable ? this.onItemSettingsClick_(nodeId) : undefined,
        onVisibilityChange: this.onItemVisibilityChange_(nodeId),
        visible: node.visible,
      }, {
        removable: node.editable,
        userdata: nodeId,
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
            icon: faPlus,
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
        {modal.type === UiState.Type.AddNode && <AddNodeDialog scene={referenceScene} theme={theme} onClose={this.onModalClose_} onAccept={this.onAddNodeAccept_} />}
        {modal.type === UiState.Type.NodeSettings && <NodeSettingsDialog
          onGeometryAdd={onGeometryAdd}
          onGeometryRemove={onGeometryRemove}
          onGeometryChange={onGeometryChange}
          scene={referenceScene}
          id={modal.id}
          node={referenceScene.nodes[modal.id]}
          theme={theme}
          onClose={this.onModalClose_}
          onChange={this.onNodeSettingsAccept_(modal.id)}
          onOriginChange={this.onNodeOriginAccept_(modal.id)}
        />}
      </>
    );
  }
}

export default connect<unknown, unknown, Props, ReduxState>((state: ReduxState, { sceneId }: WorldProps) => {
  return {
    scene: state.scenes[sceneId],
  };
}, (dispatch, { sceneId }: WorldProps) => ({
  onNodeAdd: (nodeId: string, node: Node) => {
    dispatch(ScenesAction.setNode({ sceneId, nodeId, node }));
  },
  onNodeChange: (nodeId: string, node: Node) => {
    dispatch(ScenesAction.setNode({ sceneId, nodeId, node }));
  },
  onNodeRemove: (nodeId: string) => {
    dispatch(ScenesAction.removeNode({ sceneId, nodeId }));
  },
  onGeometryAdd: (geometryId: string, geometry: Geometry) => {
    dispatch(ScenesAction.addGeometry({ sceneId, geometryId, geometry }));
  },
  onGeometryChange: (geometryId: string, geometry: Geometry) => {
    dispatch(ScenesAction.setGeometry({ sceneId, geometryId, geometry }));
  },
  onGeometryRemove: (geometryId: string) => {
    dispatch(ScenesAction.removeGeometry({ sceneId, geometryId }));
  },
  onObjectAdd: (nodeId: string, object: Node.Obj, geometry: Geometry) => {
    dispatch(ScenesAction.addObject({ sceneId, nodeId, object, geometry }));
  },


}))(World_) as React.ComponentType<Props>;