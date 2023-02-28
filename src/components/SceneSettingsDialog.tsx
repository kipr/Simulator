import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';
import { Fa } from './Fa';
import Scene from '../state/State/Scene';
import SceneSettings from './SceneSettings';
import DialogBar from './DialogBar';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import deepNeq from '../deepNeq';

import tr from '@i18n';

import { connect } from 'react-redux';

import { State as ReduxState } from '../state';
import LocalizedString from '../util/LocalizedString';

export interface SceneSettingsDialogPublicProps extends ThemeProps, StyleProps {
  scene: Scene;

  onClose: () => void;
  onAccept: (scene: Scene) => void;
}

interface SceneSettingsDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface SceneSettingsDialogState {
  scene: Scene;
}

type Props = SceneSettingsDialogPublicProps & SceneSettingsDialogPrivateProps;
type State = SceneSettingsDialogState;

const StyledSceneSettings = styled(SceneSettings, ({ theme }: ThemeProps) => ({
  color: theme.color,
  padding: `${theme.itemPadding * 2}px`, 
}));

class SceneSettingsDialog extends React.PureComponent<Props, State> {
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
    const { theme, onClose, locale } = props;
    const { scene } = state;

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('World Settings'), locale)}
        onClose={onClose}
      >
        <StyledSceneSettings
          scene={scene}
          onSceneChange={this.onSceneChange_}
          theme={theme}
        />
        <DialogBar theme={theme} onAccept={this.onAccept_}><Fa icon={faCheck} /> {LocalizedString.lookup(tr('Accept'), locale)}</DialogBar>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(SceneSettingsDialog) as React.ComponentType<SceneSettingsDialogPublicProps>;