import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame, Rotation } from "../../unit-math";
import { Angle, Distance, Mass, Value } from "../../util";
import ComboBox from "../ComboBox";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import ScrollArea from "../ScrollArea";
import Section from "../Section";
import { ThemeProps } from "../theme";
import ValueEdit from "../ValueEdit";
import { AngleAxis, Euler } from "../../math";
import NodeSettings from "./NodeSettings";
import Node from "../../state/State/Scene/Node";

import * as uuid from 'uuid';
import Scene from "../../state/State/Scene";
import Geometry from "../../state/State/Scene/Geometry";
import { Fa } from "../Fa";

export interface AddNodeAcceptance {
  node: Node;
  geometry?: Geometry;
}

export interface AddNodeDialogProps extends ThemeProps {
  scene: Scene;
  onAccept: (acceptance: AddNodeAcceptance) => void;
  onClose: () => void;
}

interface AddNodeDialogState {
  id: string;
  node: Node;

  geometryId: string;
  geometry: Geometry;
}

type Props = AddNodeDialogProps;
type State = AddNodeDialogState;

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '400px',
  flex: '1 1',
}));

class AddNodeDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const geometryId = uuid.v4();
    this.state = {
      id: uuid.v4(),
      node: {
        type: 'object',
        geometryId,
        name: 'Unnamed Object',
        origin: {
          position: {
            x: Distance.centimeters(0),
            y: Distance.centimeters(0),
            z: Distance.centimeters(0),
          },
          orientation: {
            type: 'euler',
            x: Angle.degrees(0),
            y: Angle.degrees(0),
            z: Angle.degrees(0),
            order: 'yzx',
          }
        },
        editable: true,
        visible: true,
        physics: {
          mass: Mass.kilograms(1),
          friction: 5,
          type: 'box',
        }
      },
      geometryId,
      geometry: Geometry.Box.DEFAULT
    };
  }

  private onAccept_ = () => {
    this.props.onAccept({
      node: this.state.node,
      geometry: this.state.geometry
    });
  };


  private onNodeChange_ = (node: Node) => this.setState({ node });

  private onGeometryRemove_ = (id: string) => {
    if (id !== this.state.geometryId) return;
    this.setState({
      geometryId: undefined,
      geometry: undefined
    });
  };
  
  private onGeometryChange_ = (id: string, geometry: Geometry) => {
    if (id !== this.state.geometryId) return;

    this.setState({
      geometry
    });
  };

  private onGeometryAdd_ = (id: string, geometry: Geometry) => {
    if (id !== this.state.geometryId) return;

    this.setState({
      geometryId: id,
      geometry
    });
  };

  render() {
    const { props, state } = this;
    const { theme, onClose, scene } = props;
    const { node, id } = state;

    const modifiedScene: Scene = {
      ...scene,
      geometry: {
        ...scene.geometry,
        [state.geometryId]: state.geometry
      }
    };

    return (
      <Dialog theme={theme} name='Add Item' onClose={onClose}>
        <StyledScrollArea theme={theme}>
          <NodeSettings
            theme={theme}
            node={node}
            id={id}
            scene={modifiedScene}
            onNodeChange={this.onNodeChange_}
            onGeometryAdd={this.onGeometryAdd_}
            onGeometryChange={this.onGeometryChange_}
            onGeometryRemove={this.onGeometryRemove_}
          />
        </StyledScrollArea>
        <DialogBar theme={theme} onAccept={this.onAccept_}>
          <Fa icon='check' /> Accept
        </DialogBar>
      </Dialog>
    );
  }
}

export default AddNodeDialog;