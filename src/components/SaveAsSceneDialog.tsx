import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';
import { Fa } from './Fa';
import Scene from '../state/State/Scene';
import SceneSettings from './SceneSettings';
import DialogBar from './DialogBar';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import deepNeq from '../deepNeq';

import tr from '@i18n';
import LocalizedString from '../util/LocalizedString';
import { connect } from 'react-redux';

import { State as ReduxState } from '../state';

export interface CopySceneDialogPublicProps extends ThemeProps, StyleProps {
  scene: Scene;

  onClose: () => void;
  onAccept: (scene: Scene) => void;
}

interface CopySceneDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface CopySceneDialogState {
  scene: Scene;
}

type Props = CopySceneDialogPublicProps & CopySceneDialogPrivateProps;
type State = CopySceneDialogState;

const StyledSceneSettings = styled(SceneSettings, ({ theme }: ThemeProps) => ({
  color: theme.color,
  padding: `${theme.itemPadding * 2}px`, 
}));

class SaveAsSceneDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      scene: props.scene,
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (deepNeq(prevProps.scene.name, this.props.scene.name) || deepNeq(prevProps.scene.description, this.props.scene.description)) {
      this.setState({ scene: this.props.scene });
    }
  }

  private onSceneChange_ = (scene: Scene) => this.setState({ scene });

  private onAccept_ = () => this.props.onAccept(this.state.scene);

  render() {
    const { props, state } = this;
    const { theme, onClose, onAccept, locale } = props;
    const { scene } = state;

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Copy World'), locale)}
        onClose={onClose}
      >
        <StyledSceneSettings
          scene={scene}
          onSceneChange={this.onSceneChange_}
          theme={theme}
        />
        <DialogBar theme={theme} onAccept={this.onAccept_}><Fa icon={faPlus} /> {LocalizedString.lookup(tr('Create'), locale)}</DialogBar>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(SaveAsSceneDialog) as React.ComponentType<CopySceneDialogPublicProps>;