import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame } from "../../unit-math";
import { Dialog } from "../Dialog";
import ScrollArea from "../ScrollArea";
import { ThemeProps } from "../theme";
import NodeSettings from "./NodeSettings";
import Node from '../../state/State/Scene/Node';
import Scene from "../../state/State/Scene";
import Geometry from "../../state/State/Scene/Geometry";
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';

export type NodeSettingsAcceptance = Node;

export interface NodeSettingsDialogPublicProps extends ThemeProps {
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

interface NodeSettingsDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface NodeSettingsDialogState {
}

type Props = NodeSettingsDialogPublicProps & NodeSettingsDialogPrivateProps;
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
    const { theme, onClose, onChange, onOriginChange, node, id, scene, onGeometryAdd, onGeometryChange, onGeometryRemove, locale } = props;

    return (
      <Dialog theme={theme} name={`${LocalizedString.lookup(node.name, locale) || ''} ${LocalizedString.lookup(tr('Settings'), locale)}`} onClose={onClose}>
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

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(NodeSettingsDialog) as React.ComponentType<NodeSettingsDialogPublicProps>;