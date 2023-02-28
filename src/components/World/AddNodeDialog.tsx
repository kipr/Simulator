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
import { AxisAngle, Euler } from "../../math";
import NodeSettings from "./NodeSettings";
import Node from "../../state/State/Scene/Node";

import * as uuid from 'uuid';
import Scene from "../../state/State/Scene";
import Geometry from "../../state/State/Scene/Geometry";
import { Fa } from "../Fa";

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import tr from '@i18n';

export interface AddNodeAcceptance {
  node: Node;
  geometry?: Geometry;
}

export interface AddNodeDialogPublicProps extends ThemeProps {
  scene: Scene;
  onAccept: (acceptance: AddNodeAcceptance) => void;
  onClose: () => void;
}

interface AddNodeDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface AddNodeDialogState {
  id: string;
  node: Node;

  geometryId: string;
  geometry: Geometry;
}

type Props = AddNodeDialogPublicProps & AddNodeDialogPrivateProps;
type State = AddNodeDialogState;

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '400px',
  flex: '1 1',
}));

class AddNodeDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const origin: ReferenceFrame = {
      position: {
        x: Distance.centimeters(0),
        y: Distance.centimeters(0),
        z: Distance.centimeters(50),
      },
      orientation: {
        type: 'euler',
        x: Angle.degrees(0),
        y: Angle.degrees(0),
        z: Angle.degrees(0),
        order: 'yzx',
      }
    };

    this.state = {
      id: uuid.v4(),
      node: {
        type: 'from-template',
        templateId: 'can',
        name: tr('Unnamed Object'),
        startingOrigin: origin,
        origin,
        editable: true,
        visible: true,
      },
      geometryId: undefined,
      geometry: undefined,
    };
  }

  private onAccept_ = () => {
    this.props.onAccept({
      node: this.state.node,
      geometry: this.state.geometry
    });
  };


  private onNodeChange_ = (node: Node) => this.setState({ node });

  private onNodeOriginChange_ = (origin: ReferenceFrame) => {
    this.setState(prevState => ({
      node: {
        ...prevState.node,
        origin: {
          ...prevState.node.origin,
          ...origin,
        },
      },
    }));
  };

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
    this.setState({
      geometryId: id,
      geometry
    });
  };

  render() {
    const { props, state } = this;
    const { theme, onClose, scene, locale } = props;
    const { node, id } = state;

    // If there's a geometry in progress, create a temporary scene containing the geometry
    const modifiedScene: Scene = !state.geometryId ? scene : {
      ...scene,
      geometry: {
        ...scene.geometry,
        [state.geometryId]: state.geometry
      }
    };

    return (
      <Dialog theme={theme} name={LocalizedString.lookup(tr('Add Item'), locale)} onClose={onClose}>
        <StyledScrollArea theme={theme}>
          <NodeSettings
            theme={theme}
            node={node}
            id={id}
            scene={modifiedScene}
            onNodeChange={this.onNodeChange_}
            onNodeOriginChange={this.onNodeOriginChange_}
            onGeometryAdd={this.onGeometryAdd_}
            onGeometryChange={this.onGeometryChange_}
            onGeometryRemove={this.onGeometryRemove_}
          />
        </StyledScrollArea>
        <DialogBar theme={theme} onAccept={this.onAccept_}>
          <Fa icon={faCheck} /> {LocalizedString.lookup(tr('Accept'), locale)}
        </DialogBar>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(AddNodeDialog) as React.ComponentType<AddNodeDialogPublicProps>;