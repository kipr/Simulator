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
import Node from '../../state/State/Scene/Node';
import Scene from "../../state/State/Scene";
import Geometry from "../../state/State/Scene/Geometry";

export type NodeSettingsAcceptance = Node;

export interface NodeSettingsDialogProps extends ThemeProps {
  node: Node;
  id: string;
  scene: Scene;

  onChange: (node: Node) => void;
  onOriginChange: (origin: ReferenceFrame) => void;

  onGeometryAdd: (id: string, geometry: Geometry) => void;
  onGeometryChange: (id: string, geometry: Geometry) => void;
  onGeometryRemove: (id: string) => void;

  onClose: () => void;
}

interface NodeSettingsDialogState {
}

type Props = NodeSettingsDialogProps;
type State = NodeSettingsDialogState;

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '300px',
  flex: '1 1',
}));

class NodeSettingsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { props, state } = this;
    const { theme, onClose, onChange, onOriginChange, node, id, scene, onGeometryAdd, onGeometryChange, onGeometryRemove } = props;

    return (
      <Dialog theme={theme} name={`${node.name || ''} Settings`} onClose={onClose}>
        <StyledScrollArea theme={theme}>
          <NodeSettings
            theme={theme}
            node={node}
            id={id}
            scene={scene}
            onNodeChange={onChange}
            onNodeOriginChange={onOriginChange}
            onGeometryAdd={onGeometryAdd}
            onGeometryChange={onGeometryChange}
            onGeometryRemove={onGeometryRemove}
          />
        </StyledScrollArea>
      </Dialog>
    );
  }
}

export default NodeSettingsDialog;