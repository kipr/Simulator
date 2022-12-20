import * as React from "react";
import { connect } from "react-redux";
import { styled } from "styletron-react";
import Dict from "../Dict";
import { State as ReduxState } from "../state";
import { Scenes } from "../state/State";
import Async from "../state/State/Async";
import Scene, { AsyncScene } from "../state/State/Scene";
import { Dialog } from "./Dialog";
import { ThemeProps } from "./theme";
import { ScenesAction } from "../state/reducer";
import DialogBar from "./DialogBar";
import ScrollArea from "./ScrollArea";
import { Fa } from "./Fa";

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { push } from 'connected-react-router';
import LocalizedString from '../util/LocalizedString';
import Author from '../db/Author';
import { auth } from '../firebase/firebase';


export interface OpenSceneDialogProps extends ThemeProps {
  scene:Scene;
  onClose: () => void;

}

interface ReduxOpenSceneDialogProps {
  scenes: Scenes;
  onSceneChange: (sceneId: string) => void;
  listUserScenes: () => void;
}

type Props = OpenSceneDialogProps;
type State = SelectSceneDialogState;

interface SelectSceneDialogState {
  scene: Scene;
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

const CurrentSceneName = styled('span', (props: ThemeProps & SectionProps) => ({
  backgroundColor: `rgba(61, 84, 103, 0.5)`,
  ':hover': {
    cursor: 'pointer',
  },
  transition: 'background-color 0.2s, opacity 0.2s',
  padding: `${props.theme.itemPadding * 2}px`,
  fontWeight: props.selected ? 400 : undefined,
  userSelect: 'none',
  display: 'block',
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

class OpenSceneDialog extends React.PureComponent<Props & ReduxOpenSceneDialogProps, SelectSceneDialogState> {
  constructor(props: Props & ReduxOpenSceneDialogProps) {
    super(props);
    this.state = {
      scene:props.scene,
      selectedSceneId: null,
    };
  }

  componentDidMount(): void {
    this.props.listUserScenes();
  }

  componentDidUpdate(prevProps: Readonly<OpenSceneDialogProps & ReduxOpenSceneDialogProps>) {
    // Check if selectedSceneId is not longer one of the scenes
    if (this.props.scenes !== prevProps.scenes) {
      if (!Object.prototype.hasOwnProperty.call(this.props.scenes, this.state.selectedSceneId)) {
        this.setState({ scene: this.props.scene });
      }
    }
  }
  
  render() {
    const {props, state} = this;
    const { theme, onClose, scenes} = props;
    const { selectedSceneId, scene } = state;
    

    const loadedScenesArray: [string, Scene][] = [];
    Dict.forEach(scenes, (value, key) => {
      const underlying = Async.latestValue(value);
      if (!underlying) return;
      loadedScenesArray.push([key, underlying]);
    });

    return (
      <Dialog name='Open World' theme={theme} onClose={onClose}>
        <Container theme={theme}>
          <SceneColumn theme={theme}>
            {loadedScenesArray.map(s => this.createSceneName(s[0], s[1]))}
        
          </SceneColumn>
          <InfoColumn>
            <InfoContainer theme={theme}>
              {this.createSceneInfo(scenes[selectedSceneId])}
            </InfoContainer>
          
          </InfoColumn>
          
        </Container>
        <DialogBar theme={theme} onAccept={this.onAccept}>
          <Fa icon={faCheck} /> Accept
        </DialogBar>
      </Dialog>
    );
  }

 
  private onAccept = () => {
    const { scenes } = this.props;
    const { selectedSceneId } = this.state;

    const selectedAsyncScene = selectedSceneId !== null ? scenes[selectedSceneId] : null;
    const selectedScene = Async.latestValue(selectedAsyncScene);
    
    if (selectedScene) this.props.onSceneChange(selectedSceneId);
    this.props.onClose();
  };

  private createSceneName = (sceneId: string, sceneIteration: Scene) => {
    const { theme } = this.props;
    const { selectedSceneId, scene } = this.state;
    
    if(sceneIteration.name != scene.name)
      {
        return (
          <SceneName key={sceneId} theme={theme} selected={sceneId === selectedSceneId} onClick={() => this.onSceneClick(sceneId)}>
            {LocalizedString.lookup(sceneIteration.name, LocalizedString.EN_US)}
          </SceneName>
        );
      }
    else {
      return(
        <CurrentSceneName theme={theme} onClick={() => this.onSceneClick(sceneId)}>
              {scene.name[LocalizedString.EN_US]}
      </CurrentSceneName>
      );
    }
    
  };

  private createSceneInfo = (currScene: AsyncScene) => {
    const { theme } = this.props;
    const {scene} = this.state;

    let name: string;
    let description: string;
    let author: Author;

    const brief = Async.brief(currScene);

    if (!brief) {
      const value = Async.latestValue(currScene);
      
      if (!value){
        name = LocalizedString.lookup(scene.name, LocalizedString.EN_US);
        description = LocalizedString.lookup(scene.description, LocalizedString.EN_US);
        author = scene.author;
      } 
      else{
        name = LocalizedString.lookup(value.name, LocalizedString.EN_US);
        description = LocalizedString.lookup(value.description, LocalizedString.EN_US);
        author = value.author;
      }

    } else {
      name = LocalizedString.lookup(brief.name, LocalizedString.EN_US);
      description = LocalizedString.lookup(brief.description, LocalizedString.EN_US);
      author = brief.author;
    }

    return (
      <>
        <InfoText theme={theme}>{`Description: ${description}`}</InfoText>
        <InfoText theme={theme}>{`Author: ${author.id === auth.currentUser.uid ? 'Me' : author.id}`}</InfoText>
      </>
    );
  };

  private createNoSceneInfo = (loadedScenesArray: [string, Scene][]) => {
    let description: string;
    description = LocalizedString.lookup(loadedScenesArray[0][1].description, LocalizedString.EN_US);
    return <InfoText theme={this.props.theme}> {description}</InfoText>;
  };

  private onSceneClick = (sceneId: string) => {
    this.setState({
      selectedSceneId: sceneId,

    });
  };
}

export default connect<unknown, unknown, Props>((state: ReduxState, ownProps) => ({
  scenes: state.scenes,
}), (dispatch, b) => ({
  onSceneChange: (sceneId: string) => {
    dispatch(push(`/scene/${sceneId}`));
  },
  listUserScenes: () => dispatch(ScenesAction.LIST_USER_SCENES),
}))(OpenSceneDialog) as React.ComponentType<OpenSceneDialogProps>;