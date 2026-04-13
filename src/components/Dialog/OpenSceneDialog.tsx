import * as React from "react";
import { connect } from "react-redux";
import { styled } from "styletron-react";
import Dict from "../../util/objectOps/Dict";
import { State as ReduxState } from "../../state";
import { Scenes } from "../../state/State";
import Async from "../../state/State/Async";
import Scene, { AsyncScene } from "../../state/State/Scene";
import { Dialog } from "./Dialog";
import { ThemeProps } from "../constants/theme";
import { ScenesAction } from "../../state/reducer";
import DialogBar from "./DialogBar";
import ScrollArea from "../interface/ScrollArea";
import { FontAwesome } from "../FontAwesome";

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import Author from '../../db/Author';
import { auth } from '../../firebase/firebase';

import tr from '@i18n';
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';
import TourTarget from "../Tours/TourTarget";
import { TourRegistry } from "../../tours/TourRegistry";

export interface OpenSceneDialogPublicProps extends ThemeProps {
  onClose: () => void;
  tourRegistry?: TourRegistry;
  continueTour?: () => void;
}

interface OpenSceneDialogPrivateProps {
  scenes: Scenes;
  locale: LocalizedString.Language;
  listUserScenes: () => void;

}

type Props = OpenSceneDialogPublicProps & OpenSceneDialogPrivateProps & WithNavigateProps;

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

class OpenSceneDialog extends React.PureComponent<Props, SelectSceneDialogState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSceneId: null,
    };
  }

  componentDidMount(): void {
    this.props.listUserScenes();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    // Check if selectedSceneId is not longer one of the scenes
    if (this.props.scenes !== prevProps.scenes) {
      if (!Object.prototype.hasOwnProperty.call(this.props.scenes, this.state.selectedSceneId)) {
        this.setState({ selectedSceneId: null });
      }
    }
  }

  render() {
    const { theme, onClose, scenes, locale, tourRegistry } = this.props;
    const { selectedSceneId } = this.state;

    const loadedScenesArray: [string, Scene][] = [];
    Dict.forEach(scenes, (value, key) => {
      const underlying = Async.latestValue(value);
      if (!underlying) return;
      loadedScenesArray.push([key, underlying]);
    });

    const sceneColumn_ = (
      <div>{loadedScenesArray.map(s => this.createSceneName(s[0], s[1]))}</div>);

    const infoColumn_ = (<InfoContainer theme={theme}>
      {selectedSceneId === null
        ? this.createNoSceneInfo()
        : this.createSceneInfo(scenes[selectedSceneId])}
    </InfoContainer>);

    const dialogBar_ = (<DialogBar theme={theme} onAccept={this.onAccept}>
      <FontAwesome icon={faCheck} /> {LocalizedString.lookup(tr('Accept'), locale)}
    </DialogBar>);

    const tourContent_ = (
      <Dialog name={LocalizedString.lookup(tr('Open World'), locale)} theme={theme} onClose={onClose} tourRegistry={this.props.tourRegistry}>
        <TourTarget registry={this.props.tourRegistry} targetKey={'open-scene-dialog'} style={{ position: 'relative' }}>
          <Container theme={theme}>
            <SceneColumn theme={theme} data-tour-clamp>
              <TourTarget registry={this.props.tourRegistry} targetKey="open-scene-list">
                {sceneColumn_}
              </TourTarget>
            </SceneColumn>
            <InfoColumn>
              <TourTarget registry={this.props.tourRegistry} targetKey="open-scene-info">
                {infoColumn_}
              </TourTarget>
            </InfoColumn>
          </Container>
          {dialogBar_}
        </TourTarget>
      </Dialog>
    );

    const normalContent_ = (
      <Dialog name={LocalizedString.lookup(tr('Open World'), locale)} theme={theme} onClose={onClose} >
        <Container theme={theme}>
          <SceneColumn theme={theme} data-tour-clamp>
            {sceneColumn_}
          </SceneColumn>
          <InfoColumn>
            {infoColumn_}
          </InfoColumn>
        </Container>
        {dialogBar_}
      </Dialog>
    );

    return (
      <>{tourRegistry ? tourContent_ : normalContent_}</>
    );
  }

  private onAccept = () => {
    const { scenes } = this.props;
    const { selectedSceneId } = this.state;

    const selectedAsyncScene = selectedSceneId !== null ? scenes[selectedSceneId] : null;
    const selectedScene = Async.latestValue(selectedAsyncScene);

    if (selectedScene) {
      this.props.navigate(`/scene/${selectedSceneId}`);
      location.reload();
    }
    this.props.onClose();
  };

  private createSceneName = (sceneId: string, scene: Scene) => {
    const { theme, locale } = this.props;
    const { selectedSceneId } = this.state;

    return (
      <SceneName key={sceneId} theme={theme} selected={sceneId === selectedSceneId} onClick={() => this.onSceneClick(sceneId)}>
        {LocalizedString.lookup(scene.name, locale)}
      </SceneName>
    );
  };

  private createSceneInfo = (scene: AsyncScene) => {
    const { theme, locale } = this.props;

    let name: string;
    let description: string;
    let author: Author;

    const brief = Async.brief(scene);

    if (!brief) {
      const value = Async.latestValue(scene);
      if (!value) return <InfoText theme={theme}>{LocalizedString.lookup(tr('Unknown'), locale)}</InfoText>;

      name = LocalizedString.lookup(value.name, locale);
      description = LocalizedString.lookup(value.description, locale);
      author = value.author;
    } else {
      name = LocalizedString.lookup(brief.name, locale);
      description = LocalizedString.lookup(brief.description, locale);
      author = brief.author;
    }

    return (
      <>
        <InfoText theme={theme}>{LocalizedString.lookup(tr('Description: '), locale)} {description}</InfoText>
        <InfoText theme={theme}>{LocalizedString.lookup(tr('Author: '), locale)} {author.id === auth.currentUser.uid ? LocalizedString.lookup(tr('Me'), locale) : author.id}</InfoText>
      </>
    );
  };

  private createNoSceneInfo = () => {
    return <InfoText theme={this.props.theme}>{LocalizedString.lookup(tr('Select a scene to see more details'), this.props.locale)}</InfoText>;
  };

  private onSceneClick = (sceneId: string) => {
    this.setState({
      selectedSceneId: sceneId,
    }, () => {
      this.props.continueTour();
    });
  };
}

const ConnectedOpenSceneDialog = connect<unknown, unknown, Props>((state: ReduxState) => ({
  scenes: state.scenes,
  locale: state.i18n.locale,
}), dispatch => ({
  listUserScenes: () => dispatch(ScenesAction.LIST_USER_SCENES),
}))(withNavigate(OpenSceneDialog)) as React.ComponentType<OpenSceneDialogPublicProps>;

export default ConnectedOpenSceneDialog;