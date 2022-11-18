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

export interface NewSceneDialogProps extends ThemeProps, StyleProps {
  onClose: () => void;
  onAccept: (scene: Scene) => void;
}

interface NewSceneDialogState {
  scene: Scene;
}

type Props = NewSceneDialogProps;
type State = NewSceneDialogState;

const StyledSceneSettings = styled(SceneSettings, ({ theme }: ThemeProps) => ({
  color: theme.color,
  padding: `${theme.itemPadding * 2}px`, 
}));

class NewSceneDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      scene: Scene.EMPTY,
    };
  }

  private onSceneChange_ = (scene: Scene) => this.setState({ scene });

  private onAccept_ = () => this.props.onAccept(this.state.scene);

  render() {
    const { props, state } = this;
    const { theme, onClose, onAccept } = props;
    const { scene } = state;

    return (
      <Dialog theme={theme} name='New World' onClose={onClose}>
        <StyledSceneSettings
          scene={scene}
          onSceneChange={this.onSceneChange_}
          theme={theme}
        />
        <DialogBar theme={theme} onAccept={this.onAccept_}><Fa icon={faPlus} /> Create</DialogBar>
      </Dialog>
    );
  }
}

export default NewSceneDialog;