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
import Script from '../../state/State/Scene/Script';
import AddScriptDialog, { AddScriptAcceptance } from './AddScriptDialog';
import ScriptSettingsDialog, { ScriptSettingsAcceptance } from './ScriptSettingsDialog';
import { AsyncChallenge } from '../../state/State/Challenge';
import Builder from '../../db/Builder';

import tr from '@i18n';
import { sprintf } from 'sprintf-js';

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

export const createWorldBarComponents = ({ theme, saveable, onSelectScene, onSaveScene, onCopyScene, locale }: {
  theme: Theme,
  saveable: boolean,
  onSelectScene: () => void,
  onSaveScene: () => void,
  onCopyScene: () => void,
  locale: LocalizedString.Language,
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const worldBar: BarComponent<object>[] = [];

  worldBar.push(BarComponent.create(Button, {
    theme,
    onClick: onSelectScene,
    children:
      <>
        <Fa icon={faGlobeAmericas} />
        {' '} {LocalizedString.lookup(tr('Select Scene'), locale)}
      </>,
  }));

  worldBar.push(BarComponent.create(Button, {
    theme,
    onClick: onSaveScene,
    disabled: !saveable,
    children:
      <>
        <Fa icon={faSave} />
        {' '} {LocalizedString.lookup(tr('Save Scene'), locale)}
      </>,
  }));

  worldBar.push(BarComponent.create(Button, {
    theme,
    onClick: onCopyScene,
    children:
      <>
        <Fa icon={faPlus} />
        {' '} {LocalizedString.lookup(tr('Copy Scene'), locale)}
      </>,
  }));

  return worldBar;
};

export interface Capabilities {
  addNode?: boolean;
  addScript?: boolean;
  scriptSettings?: boolean;
  removeNode?: boolean;
  removeScript?: boolean;
  nodeSettings?: boolean;
  nodeVisibility?: boolean;
  nodeReset?: boolean;
}

export const DEFAULT_CAPABILITIES: Capabilities = {
  addNode: true,
  addScript: true,
  scriptSettings: true,
  removeNode: true,
  removeScript: true,
  nodeSettings: true,
  nodeVisibility: true,
  nodeReset: true,
};

export interface WorldPublicProps extends StyleProps, ThemeProps {
  scene: AsyncScene;

  onNodeAdd: (nodeId: string, node: Node) => void;
  onNodeRemove: (nodeId: string) => void;
  onNodeChange: (nodeId: string, node: Node) => void;

  onObjectAdd: (nodeId: string, object: Node.Obj, geometry: Geometry) => void;

  onGeometryAdd: (geometryId: string, geometry: Geometry) => void;
  onGeometryRemove: (geometryId: string) => void;
  onGeometryChange: (geometryId: string, geometry: Geometry) => void;

  onScriptAdd: (scriptId: string, script: Script) => void;
  onScriptRemove: (scriptId: string) => void;
  onScriptChange: (scriptId: string, script: Script) => void;

  capabilities?: Capabilities;
}


interface WorldPrivateProps {
  locale: LocalizedString.Language;
}

namespace UiState {
  export enum Type {
    None,
    AddNode,
    NodeSettings,
    AddScript,
    ScriptSettings
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

  export interface AddScript {
    type: Type.AddScript;
  }

  export const ADD_SCRIPT: AddScript = { type: Type.AddScript };

  export interface ScriptSettings {
    type: Type.ScriptSettings;
    id: string;
  }

  export const scriptSettings = (id: string): ScriptSettings => ({ type: Type.ScriptSettings, id });
}

type UiState = (
  UiState.None |
  UiState.AddNode |
  UiState.NodeSettings |
  UiState.AddScript |
  UiState.ScriptSettings
);

interface WorldState {
  collapsed: { [section: string]: boolean };
  modal: UiState;
}

type Props = WorldPublicProps & WorldPrivateProps;
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

class World extends React.PureComponent<Props, State> {
  constructor(props: Props) {
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

  private onAddScriptAccept_ = (acceptance: AddScriptAcceptance) => {
    this.setState({ modal: UiState.NONE }, () => {
      this.props.onScriptAdd(uuid.v4(), acceptance.script);
    });
  };

  private onNodeSettingsAccept_ = (id: string) => (acceptance: NodeSettingsAcceptance) => {
    this.props.onNodeChange(id, acceptance);
  };

  private onScriptSettingsAccept_ = (id: string) => (acceptance: ScriptSettingsAcceptance) => {
    this.setState({
      modal: UiState.NONE
    }, () => {
      this.props.onScriptChange(id, acceptance);
    });
  };

  private onNodeOriginAccept_ = (id: string) => (origin: ReferenceFrame) => {
    const originalNode = Async.latestValue(this.props.scene).nodes[id];
    this.props.onNodeChange(id, {
      ...originalNode,
      startingOrigin: origin,
      origin,
    });
  };

  private onAddNodeClick_ = (event: React.SyntheticEvent<MouseEvent>) => {
    this.setState({ modal: UiState.ADD_NODE });
    event.stopPropagation();
    event.preventDefault();
  };

  private onAddScriptClick_ = (event: React.SyntheticEvent<MouseEvent>) => {
    this.setState({ modal: UiState.ADD_SCRIPT });
    event.stopPropagation();
    event.preventDefault();
  };

  private onNodeResetClick_ = (id: string) => () => {
    const { props } = this;
    const { scene } = props;

    const originalNode = Async.latestValue(scene).nodes[id];
    
    this.props.onNodeChange(id, {
      ...originalNode,
      origin: {
        position: originalNode.startingOrigin?.position || Vector3.zero('centimeters'),
        orientation: originalNode.startingOrigin?.orientation || Rotation.Euler.identity(Angle.Type.Degrees),
        scale: originalNode.startingOrigin?.scale || RawVector3.ONE,
      },
    });
  };
  private onItemSettingsClick_ = (id: string) => () => this.setState({ modal: UiState.itemSettings(id) });
  private onScriptSettingsClick_ = (id: string) => () => this.setState({ modal: UiState.scriptSettings(id) });
  private onModalClose_ = () => this.setState({ modal: UiState.NONE });

  private onNodeRemove_ = (index: number, id?: unknown) => {
    const { props } = this;
    const { scene } = props;
    const idStr = id as string;

    const workingScene = Async.latestValue(scene);
    
    const node = workingScene.nodes[idStr];
    if (node.type === 'object') {
      if (node.geometryId !== undefined) {
        let unique = true;
        for (const nodeId in workingScene.nodes) {
          const otherNode = workingScene.nodes[nodeId];
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

  private onScriptRemove_ = (index: number, id?: unknown) => {
    this.props.onScriptRemove(id as string);
  };

  private onItemVisibilityChange_ = (id: string) => (visibility: boolean) => {
    const originalNode = Async.previousValue(this.props.scene).nodes[id];

    this.props.onNodeChange(id, {
      ...originalNode,
      visible: visibility,
    });
  };

  render() {
    const { props, state } = this;
    const {
      style,
      className,
      theme,
      scene,
      onGeometryAdd,
      onGeometryRemove,
      onGeometryChange,
      locale
    } = props;
    const { collapsed, modal } = state;

    const capabilities = props.capabilities || DEFAULT_CAPABILITIES;

    const addNode = capabilities.addNode ?? true;
    const addScript = capabilities.addScript ?? true;
    const removeNode = capabilities.removeNode ?? true;
    const removeScript = capabilities.removeScript ?? true;
    const nodeReset = capabilities.nodeReset ?? true;
    const nodeSettings = capabilities.nodeSettings ?? true;
    const nodeVisiblity = capabilities.nodeVisibility ?? true;
    const scriptSettings = capabilities.scriptSettings ?? true;

    const itemList: EditableList.Item[] = [];

    const workingScene = Async.latestValue(scene);
    for (const nodeId of Dict.keySet(workingScene.nodes)) {
      const node = workingScene.nodes[nodeId];
      const hasReset = workingScene.nodes[nodeId].startingOrigin !== undefined;
      itemList.push(EditableList.Item.standard({
        component: Item,
        props: { name: LocalizedString.lookup(node.name, locale), theme },
        onReset: hasReset && nodeReset ? this.onNodeResetClick_(nodeId) : undefined,
        onSettings: node.editable && nodeSettings ? this.onItemSettingsClick_(nodeId) : undefined,
        onVisibilityChange: nodeVisiblity ? this.onItemVisibilityChange_(nodeId) : undefined,
        visible: node.visible,
      }, {
        removable: node.editable && node.type !== 'robot',
        userdata: nodeId,
      }));
    }

    const scriptList: EditableList.Item[] = [];
    for (const scriptId of Dict.keySet(workingScene.scripts || {})) {
      const script = workingScene.scripts[scriptId];
      scriptList.push(EditableList.Item.standard({
        component: Item,
        props: {
          name: script.name,
          theme,
          selected: workingScene.selectedScriptId === scriptId
        },
        onSettings: scriptSettings ? this.onScriptSettingsClick_(scriptId) : undefined,
      }, {
        removable: removeScript,
        userdata: scriptId,
      }));
    }

    const itemsName = StyledText.compose({
      items: [
        StyledText.text({
          text: LocalizedString.lookup(Dict.map(tr('Item(s) (%d)'), (str: string) => sprintf(str, itemList.length)), locale)
        })
      ]
    });

    if (addNode) {
      itemsName.items.push(StyledText.component({
        component: SectionIcon,
        props: {
          icon: faPlus,
          theme,
          onClick: this.onAddNodeClick_
        }
      }));
    }

    const scriptsName = StyledText.compose({
      items: [
        StyledText.text({
          text: LocalizedString.lookup(Dict.map(tr('Script(s) (%d)'), (str: string) => sprintf(str, scriptList.length)), locale)
        })
      ]
    });

    if (addScript) {
      scriptsName.items.push(StyledText.component({
        component: SectionIcon,
        props: {
          icon: faPlus,
          theme,
          onClick: this.onAddScriptClick_
        }
      }));
    }
    
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
              <EditableList
                onItemRemove={removeNode ? this.onNodeRemove_ : undefined}
                items={itemList}
                theme={theme}
              />
            </StyledListSection>
            <StyledListSection 
              name={scriptsName}
              theme={theme}
              onCollapsedChange={this.onCollapsedChange_('scripts')}
              collapsed={collapsed['scripts']}
              noBodyPadding
            >
              <EditableList
                onItemRemove={removeScript ? this.onScriptRemove_ : undefined}
                items={scriptList}
                theme={theme}
              />
            </StyledListSection>
          </Container>
        </ScrollArea>
        {modal.type === UiState.Type.AddNode && (
          <AddNodeDialog
            scene={workingScene}
            theme={theme}
            onClose={this.onModalClose_}
            onAccept={this.onAddNodeAccept_}
          />
        )}
        {modal.type === UiState.Type.AddScript && (
          <AddScriptDialog
            theme={theme}
            onClose={this.onModalClose_}
            onAccept={this.onAddScriptAccept_}
          />
        )}
        {modal.type === UiState.Type.NodeSettings && <NodeSettingsDialog
          onGeometryAdd={onGeometryAdd}
          onGeometryRemove={onGeometryRemove}
          onGeometryChange={onGeometryChange}
          scene={workingScene}
          id={modal.id}
          node={workingScene.nodes[modal.id]}
          theme={theme}
          onClose={this.onModalClose_}
          onChange={this.onNodeSettingsAccept_(modal.id)}
          onOriginChange={this.onNodeOriginAccept_(modal.id)}
        />}
        {modal.type === UiState.Type.ScriptSettings && <ScriptSettingsDialog
          id={modal.id}
          script={workingScene.scripts[modal.id]}
          theme={theme}
          onClose={this.onModalClose_}
          onAccept={this.onScriptSettingsAccept_(modal.id)}
        />}
      </>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(World) as React.ComponentType<WorldPublicProps>;