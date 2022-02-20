import * as React from "react";
import { connect } from "react-redux";
import { styled } from "styletron-react";
import Dict from "../Dict";
import { State as ReduxState } from "../state";
import { Scenes } from "../state/State";
import Async from "../state/State/Async";
import Scene from "../state/State/Scene";
import { Dialog } from "./Dialog";
import { ThemeProps } from "./theme";
import { SceneAction } from "../state/reducer";
import DialogBar from "./DialogBar";
import ScrollArea from "./ScrollArea";
import { Fa } from "./Fa";

export interface SelectSceneDialogProps extends ThemeProps {
  onClose: () => void;
}

interface ReduxSelectSceneDialogProps {
  scenes: Scenes;
  onSceneChange: (scene: Scene) => void;
}

type Props = SelectSceneDialogProps;

interface SelectSceneDialogState {
  selectedSceneId: string | null;
}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '300px',
}));

const SceneColumn = styled(ScrollArea, (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 150px',
  borderRight: `1px solid ${props.theme.borderColor}`
}));

const SceneName = styled('span', (props: ThemeProps & SectionProps) => ({
  backgroundColor: props.selected ? `rgba(255, 255, 255, 0.1)` : undefined,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  transition: 'background-color 0.2s, opacity 0.2s',
  padding: `${props.theme.itemPadding * 2}px`,
  fontWeight: props.selected ? 400 : undefined,
  userSelect: 'none',
  display: 'block',
}));

const InfoColumn = styled('div', {
  flex: '1 1',
});

const InfoContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0',
}));

const InfoText = styled('span', (props: ThemeProps) => ({
  userSelect: 'none',
  padding: `${props.theme.itemPadding * 2}px`,
}));

interface SectionProps {
  selected?: boolean;
}

class SelectSceneDialog extends React.PureComponent<Props & ReduxSelectSceneDialogProps, SelectSceneDialogState> {
  constructor(props: Props & ReduxSelectSceneDialogProps) {
    super(props);
    this.state = {
      selectedSceneId: null,
    };
  }

  componentDidUpdate(prevProps: Readonly<SelectSceneDialogProps & ReduxSelectSceneDialogProps>) {
    // Check if selectedSceneId is not longer one of the scenes
    if (this.props.scenes !== prevProps.scenes) {
      if (!Object.prototype.hasOwnProperty.call(this.props.scenes.scenes, this.state.selectedSceneId)) {
        this.setState({ selectedSceneId: null });
      }
    }
  }
  
  render() {
    const { theme, onClose, scenes } = this.props;
    const { selectedSceneId } = this.state;

    const loadedScenesArray: [string, Scene][] = [];
    Dict.forEach(scenes.scenes, (value, key) => {
      if (value.type === Async.Type.Loaded) {
        loadedScenesArray.push([key, value.value]);
      }
    });

    return (
      <Dialog name='Select Scene' theme={theme} onClose={onClose}>
        <Container theme={theme}>
          <SceneColumn theme={theme}>
            {loadedScenesArray.map(s => this.createSceneName(s[0], s[1]))}
          </SceneColumn>
          <InfoColumn>
            <InfoContainer theme={theme}>
              {selectedSceneId === null
                ? this.createNoSceneInfo()
                : this.createSceneInfo(scenes.scenes[selectedSceneId])}
            </InfoContainer>
          </InfoColumn>
        </Container>
        <DialogBar theme={theme} onAccept={this.onAccept}>
          <Fa icon='check' /> Accept
        </DialogBar>
      </Dialog>
    );
  }

  private onAccept = () => {
    const { scenes } = this.props;
    const { selectedSceneId } = this.state;

    const selectedAsyncScene = selectedSceneId !== null ? scenes.scenes[selectedSceneId] : null;
    const selectedScene = selectedAsyncScene?.type === Async.Type.Loaded
      ? selectedAsyncScene.value
      : null;
    
    if (selectedScene) this.props.onSceneChange(selectedScene);
    this.props.onClose();
  };

  private createSceneName = (sceneId: string, scene: Scene) => {
    const { theme } = this.props;
    const { selectedSceneId } = this.state;
    
    return (
      <SceneName key={sceneId} theme={theme} selected={sceneId === selectedSceneId} onClick={() => this.onSceneClick(sceneId)}>
        {scene.name}
      </SceneName>
    );
  };

  private createSceneInfo = (scene: Async<Scene>) => {
    const { theme } = this.props;

    switch (scene.type) {
      case Async.Type.Loaded:
        return <>
          <InfoText theme={theme}>{`Description: ${scene.value.description}`}</InfoText>
          <InfoText theme={theme}>{`Author: ${scene.value.authorId}`}</InfoText>
        </>;
      case Async.Type.Loading:
        return <InfoText theme={theme}>Loading...</InfoText>;
      default:
        return <InfoText theme={theme}>The scene is not available.</InfoText>;
    }
  };

  private createNoSceneInfo = () => {
    return <InfoText theme={this.props.theme}>Select a scene to see more details</InfoText>;
  };

  private onSceneClick = (sceneId: string) => {
    this.setState({
      selectedSceneId: sceneId,
    });
  };
}

export default connect<any, unknown, Props>((state: ReduxState, ownProps) => ({
  scenes: state.scenes,
}), (dispatch, b) => ({
  onSceneChange: (scene: Scene) => {
    dispatch(SceneAction.replaceScene({ scene }));
  }
}))(SelectSceneDialog) as React.ComponentType<SelectSceneDialogProps>;