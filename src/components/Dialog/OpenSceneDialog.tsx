import * as React from "react";
import { connect } from "react-redux";
import { styled } from "styletron-react";
import Dict from "../../util/objectOps/Dict";
import { State as ReduxState } from "../../state";
import { Scenes } from "../../state/State";
import Async from "../../state/State/Async";
import Scene, { AsyncScene } from "../../state/State/Scene";
import { Dialog } from "./Dialog";
import DeleteDialog from "./DeleteDialog";
import { ThemeProps, GREEN } from "../constants/theme";
import { Spacer } from '../constants/common';
import { ScenesAction } from "../../state/reducer";
import ScrollArea from "../interface/ScrollArea";
import { FontAwesome } from "../FontAwesome";

import { faCheck, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import Author from '../../db/Author';
import { auth } from '../../firebase/firebase';

import tr from '@i18n';
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';
import TourTarget from "../Tours/TourTarget";
import { TourRegistry } from "../../tours/TourRegistry";
import {
  ARCHIVED_SCENES,
  BEX_SANDBOX_SCENE_ID,
  CREATE_YOUR_OWN_SCENE_OPTION_ID,
  JBC_SANDBOX_SCENE_ID,
} from '../constants/defaultScene';
import { isCustomChallengeId } from '../../util/customChallengeFactory';
import { Card } from "../../components/interface/Card";
import ChallengeCard from "../../components/interface/ChallengeCard";
export interface OpenSceneDialogPublicProps extends ThemeProps {
  onClose: () => void;
  onStartCustomChallengeSetup?: () => void;
  tourRegistry?: TourRegistry;
  continueTour?: () => void;
}

interface OpenSceneDialogPrivateProps {
  scenes: Scenes;
  locale: LocalizedString.Language;
  listUserScenes: () => void;
  removeScene: (sceneId: string) => void;

}

type Props = OpenSceneDialogPublicProps & OpenSceneDialogPrivateProps & WithNavigateProps;

interface SelectSceneDialogState {
  selectedSceneId: string | null;
  showCreateYourOwnInstructions: boolean;
  selectedDeleteSceneIds: string[];
  deleteSceneIds: string[] | null;
  folderSelected: string | null;
}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '25em',
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
  width: '100%',
  display: 'block',
}));

const SceneRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
});

const MultiSelectToggle = styled('button', (props: ThemeProps & { $selected: boolean }) => ({
  marginLeft: `${props.theme.itemPadding}px`,
  width: '18px',
  minWidth: '18px',
  height: '18px',
  borderRadius: '3px',
  border: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.$selected ? GREEN.standard : 'transparent',
  color: props.$selected ? '#fff' : props.theme.color,
  cursor: 'pointer',
  padding: 0,
  lineHeight: '1',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const InfoColumn = styled('div', {
  flex: '1 1',
  alignContent: 'center',
  // height:'100%'
});

const InfoContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0',
  height: '100%',
}));
const ChallengeItemContainer = styled('div', (props: ThemeProps) => ({
  display: 'grid',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  alignContent: 'center',
  justifyItems: 'center',
  minWidth: '200px',
  // minHeight: '60vh',

  rowGap: '15px',
  gridTemplateColumns: "repeat(3, 1fr)",
}));
const InfoText = styled('span', (props: ThemeProps) => ({
  userSelect: 'none',
  padding: `${props.theme.itemPadding * 2}px`,
}));

const InstructionsBody = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  lineHeight: 1.5,
  userSelect: 'none',
}));

const DialogBarRow = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderTop: `1px solid ${props.theme.borderColor}`,
}));

const DialogBarButton = styled('div', (props: ThemeProps & { $muted?: boolean }) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  cursor: 'pointer',
  borderLeft: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.$muted ? 'rgba(255, 255, 255, 0.08)' : GREEN.standard,
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: props.$muted ? 'rgba(255, 255, 255, 0.14)' : GREEN.hover,
  },
  ':first-child': {
    borderLeft: 'none',
  },
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

interface SectionProps {
  selected?: boolean;
}

class OpenSceneDialog extends React.PureComponent<Props, SelectSceneDialogState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSceneId: null,
      showCreateYourOwnInstructions: false,
      selectedDeleteSceneIds: [],
      deleteSceneIds: null,
      folderSelected: null,
    };
  }

  componentDidMount(): void {
    this.props.listUserScenes();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (this.props.scenes !== prevProps.scenes) {
      const { selectedSceneId, deleteSceneIds, selectedDeleteSceneIds } = this.state;
      const nextSelectedDeleteSceneIds = selectedDeleteSceneIds.filter(sceneId =>
        Object.prototype.hasOwnProperty.call(this.props.scenes, sceneId)
      );
      if (
        selectedSceneId !== null &&
        selectedSceneId !== CREATE_YOUR_OWN_SCENE_OPTION_ID &&
        !Object.prototype.hasOwnProperty.call(this.props.scenes, selectedSceneId)
      ) {
        this.setState({ selectedSceneId: null, selectedDeleteSceneIds: nextSelectedDeleteSceneIds });
        return;
      }
      const nextDeleteSceneIds = deleteSceneIds?.filter(sceneId =>
        Object.prototype.hasOwnProperty.call(this.props.scenes, sceneId)
      ) ?? null;
      if (
        nextSelectedDeleteSceneIds.length !== selectedDeleteSceneIds.length ||
        (deleteSceneIds !== null && (nextDeleteSceneIds === null || nextDeleteSceneIds.length !== deleteSceneIds.length))
      ) {
        this.setState({
          selectedDeleteSceneIds: nextSelectedDeleteSceneIds,
          deleteSceneIds: nextDeleteSceneIds && nextDeleteSceneIds.length > 0 ? nextDeleteSceneIds : null,
        });
      }
    }
  }

  render() {
    const { theme, onClose, scenes, locale, tourRegistry } = this.props;
    const {
      selectedSceneId,
      showCreateYourOwnInstructions,
      selectedDeleteSceneIds,
      deleteSceneIds,
      folderSelected
    } = this.state;

    const dialogName = showCreateYourOwnInstructions
      ? LocalizedString.lookup(tr('Create Your Own Challenge'), locale)
      : LocalizedString.lookup(tr('Open World'), locale);

    const instructionsBody_ = (
      <InstructionsBody theme={theme}>
        <p>
          {LocalizedString.lookup(
            tr('Next, set up success and failure rules like a standard JBC challenge.'),
            locale
          )}
        </p>
        <p>
          {LocalizedString.lookup(
            tr('Then customize the sandbox world and scene scripts.'),
            locale
          )}
        </p>
      </InstructionsBody>
    );

    const instructionsBar_ = (
      <DialogBarRow theme={theme}>
        <DialogBarButton theme={theme} $muted onClick={this.onBackFromInstructions_}>
          <FontAwesome icon={faChevronLeft} /> {LocalizedString.lookup(tr('Back'), locale)}
        </DialogBarButton>
        <Spacer />
        <DialogBarButton theme={theme} onClick={this.onEnterSandbox_}>
          {LocalizedString.lookup(tr('Continue'), locale)}{' '}
          <FontAwesome icon={faChevronRight} />
        </DialogBarButton>
      </DialogBarRow>
    );

    const loadedScenesArray: [string, Scene][] = [];
    const sandboxScene = Async.latestValue(scenes[JBC_SANDBOX_SCENE_ID]);
    if (sandboxScene) {
      loadedScenesArray.push([JBC_SANDBOX_SCENE_ID, sandboxScene]);
    }
    Dict.forEach(scenes, (value, key) => {
      if (key === JBC_SANDBOX_SCENE_ID) return;
      const underlying = Async.latestValue(value);
      if (!underlying) return;
      loadedScenesArray.push([key, underlying]);
    });

    const jbc_scenes = loadedScenesArray.filter(([sceneId, scene]) => sceneId.startsWith('jbc') && sceneId !== JBC_SANDBOX_SCENE_ID);
    const bex_scenes = loadedScenesArray.filter(([sceneId, scene]) => sceneId.startsWith('bex') && sceneId !== BEX_SANDBOX_SCENE_ID);
    const archived_scenes = loadedScenesArray.filter(([sceneId, scene]) => ARCHIVED_SCENES.includes(sceneId));
    const sandbox_scenes = loadedScenesArray.filter(([sceneId, scene]) => sceneId.includes('Sandbox') && !ARCHIVED_SCENES.includes(sceneId));
    const remainderScenes = loadedScenesArray.filter(([sceneId, scene]) => !sceneId.startsWith('jbc') && !sceneId.startsWith('bex'));
    const folderScenes = {
      'JBC Challenges': jbc_scenes,
      'Botball Explorer 2026 Challenges': bex_scenes,
      'Archived Scenes': archived_scenes,
    };

    const sceneColumn_ = (
      <div>
        {/* {this.createCreateYourOwnSceneName()} */}
        {
          sandbox_scenes.map(([sceneId, scene]) => this.createSceneName(sceneId, scene))
        }
        {Object.entries(folderScenes).map(([folderName, scenes]) => (
          <div key={scenes.map(s => s[0]).join('-')}>
            <SceneName onClick={() => this.handleFolderSelect(folderName)} key={folderName} theme={theme} selected={false}>
              <strong>{folderName}</strong>

            </SceneName>
            {folderSelected === folderName && (
              <div style={{ paddingLeft: '20px' }}>
                {scenes.map(s => this.createSceneName(s[0], s[1]))}
              </div>
            )}
          </div>
        ))}
      </div>
    );

    const infoColumn_ = (<InfoContainer theme={theme}>
      {selectedSceneId === null
        ? this.createNoSceneInfo()
        : this.createSelectedSceneInfo(scenes)}
      {/* <StyledScrollArea theme={theme}>
        <ChallengeItemContainer theme={theme}>
          {jbc_scenes.map(([sceneId, scene]) => (
            // <div key={sceneId}>
            //   {sceneId}
            //   <img style={{ maxWidth: '9em' }} src='../../static/assets/challenge-0.png' />

            // </div>
            <ChallengeCard cardContent={{ title: scene.name, description: scene.description }} key={sceneId} onClick={() => { }} theme={theme} customheight='150px' customwidth='150px' />
          ))}
        </ChallengeItemContainer>
      </StyledScrollArea> */}
    </InfoContainer>);

    const canDeleteSelected = selectedDeleteSceneIds.length > 0;
    const scenePickerBar_ = (
      <DialogBarRow theme={theme}>
        <DialogBarButton
          theme={theme}
          $muted
          onClick={this.onDeleteSelectedScenes_}
          style={{
            visibility: canDeleteSelected ? 'visible' : 'hidden',
            pointerEvents: canDeleteSelected ? 'auto' : 'none',
          }}
        >
          {LocalizedString.lookup(tr('Delete'), locale)}{canDeleteSelected ? ` (${selectedDeleteSceneIds.length})` : ''}
        </DialogBarButton>
        <Spacer />
        <DialogBarButton theme={theme} onClick={this.onAccept}>
          <FontAwesome icon={faCheck} /> {LocalizedString.lookup(tr('Accept'), locale)}
        </DialogBarButton>
      </DialogBarRow>
    );

    const scenePickerBody_ = (
      <Container theme={theme}>
        <SceneColumn theme={theme} data-tour-clamp>
          {tourRegistry ? (
            <TourTarget registry={tourRegistry} targetKey="open-scene-list">
              {sceneColumn_}
            </TourTarget>
          ) : (
            sceneColumn_
          )}
        </SceneColumn>
        <InfoColumn>
          {tourRegistry ? (
            <TourTarget registry={tourRegistry} targetKey="open-scene-info">
              {infoColumn_}
            </TourTarget>
          ) : (
            infoColumn_
          )}
        </InfoColumn>
      </Container>
    );

    const body_ = showCreateYourOwnInstructions ? instructionsBody_ : scenePickerBody_;
    const bar_ = showCreateYourOwnInstructions ? instructionsBar_ : scenePickerBar_;

    const tourContent_ = (
      <Dialog name={dialogName} theme={theme} onClose={onClose} tourRegistry={tourRegistry}>
        <TourTarget registry={tourRegistry} targetKey={'open-scene-dialog'} style={{ position: 'relative' }}>
          {body_}
          {bar_}
        </TourTarget>
      </Dialog>
    );

    const normalContent_ = (
      <Dialog name={dialogName} theme={theme} onClose={onClose}>
        {body_}
        {bar_}
      </Dialog>
    );

    const deleteSceneCount = deleteSceneIds?.length ?? 0;

    if (deleteSceneIds) {
      return (
        <DeleteDialog
          theme={theme}
          name={
            deleteSceneCount === 1
              ? (Async.latestValue(this.props.scenes[deleteSceneIds[0]])?.name ?? tr('this scene'))
              : tr('these scenes')
          }
          onClose={this.onCloseDeleteDialog_}
          onAccept={this.onConfirmDeleteScenes_}
        />
      );
    }

    return (
      <>{tourRegistry ? tourContent_ : normalContent_}</>
    );
  }

  private onAccept = () => {
    const { scenes } = this.props;
    const { selectedSceneId } = this.state;

    if (selectedSceneId === CREATE_YOUR_OWN_SCENE_OPTION_ID) {
      this.setState({ showCreateYourOwnInstructions: true });
      return;
    }

    const selectedAsyncScene =
      selectedSceneId !== null ? scenes[selectedSceneId] : null;
    const selectedScene = Async.latestValue(selectedAsyncScene);

    if (selectedScene && selectedSceneId) {
      this.props.navigate(`/scene/${selectedSceneId}`);
      location.reload();
    }
    this.props.onClose();
  };

  private onBackFromInstructions_ = () => {
    this.setState({ showCreateYourOwnInstructions: false });
  };

  private onEnterSandbox_ = () => {
    this.props.onStartCustomChallengeSetup?.();
  };

  private isSceneDeletable_ = (sceneId: string): boolean => {
    if (sceneId === CREATE_YOUR_OWN_SCENE_OPTION_ID) return false;
    if (sceneId === JBC_SANDBOX_SCENE_ID) return false;
    const scene = Async.latestValue(this.props.scenes[sceneId]);
    if (!scene) return false;
    const isUserAuthored =
      scene.author.type === Author.Type.User && scene.author.id === auth.currentUser?.uid;
    return isUserAuthored || isCustomChallengeId(sceneId);
  };

  private onSceneDeleteSelectToggle_ = (sceneId: string) => {
    if (!this.isSceneDeletable_(sceneId)) return;
    this.setState(prev => ({
      selectedDeleteSceneIds: prev.selectedDeleteSceneIds.includes(sceneId)
        ? prev.selectedDeleteSceneIds.filter(id => id !== sceneId)
        : [...prev.selectedDeleteSceneIds, sceneId],
    }));
  };

  private onDeleteSelectedScenes_ = () => {
    const deleteSceneIds = this.state.selectedDeleteSceneIds.filter(sceneId => this.isSceneDeletable_(sceneId));
    if (deleteSceneIds.length === 0) return;
    this.setState({ deleteSceneIds });
  };

  private onCloseDeleteDialog_ = () => {
    this.setState({ deleteSceneIds: null });
  };

  private onConfirmDeleteScenes_ = () => {
    const { deleteSceneIds } = this.state;
    if (!deleteSceneIds || deleteSceneIds.length === 0) return;
    deleteSceneIds.forEach(sceneId => {
      if (this.isSceneDeletable_(sceneId)) {
        this.props.removeScene(sceneId);
      }
    });
    this.setState({
      selectedSceneId: null,
      showCreateYourOwnInstructions: false,
      selectedDeleteSceneIds: [],
      deleteSceneIds: null,
    });
  };

  private createCreateYourOwnSceneName = () => {
    const { theme, locale } = this.props;
    const { selectedSceneId } = this.state;

    return (
      <SceneName
        key={CREATE_YOUR_OWN_SCENE_OPTION_ID}
        theme={theme}
        selected={selectedSceneId === CREATE_YOUR_OWN_SCENE_OPTION_ID}
        onClick={() => this.onSceneClick(CREATE_YOUR_OWN_SCENE_OPTION_ID)}
      >
        {LocalizedString.lookup(tr('Create Your Own Challenge'), locale)}
      </SceneName>
    );
  };

  private createSelectedSceneInfo = (scenes: Scenes) => {
    const { selectedSceneId } = this.state;
    if (selectedSceneId === CREATE_YOUR_OWN_SCENE_OPTION_ID) {
      return this.createCreateYourOwnSceneInfo(scenes[JBC_SANDBOX_SCENE_ID]);
    }
    return this.createSceneInfo(scenes[selectedSceneId]);
  };

  private createCreateYourOwnSceneInfo = (sandboxScene: AsyncScene | undefined) => {
    const { theme, locale } = this.props;

    if (!sandboxScene) {
      return (
        <InfoText theme={theme}>
          {LocalizedString.lookup(
            tr('Build a custom challenge on the JBC sandbox with a guided setup wizard.'),
            locale
          )}
        </InfoText>
      );
    }

    return (
      <>
        <InfoText theme={theme}>
          {LocalizedString.lookup(
            tr('Build a custom challenge on the JBC sandbox with a guided setup wizard.'),
            locale
          )}
        </InfoText>
        {this.createSceneInfo(sandboxScene)}
      </>
    );
  };

  private handleFolderSelect = (folderName: string) => {
    this.setState(prevState => ({
      folderSelected: prevState.folderSelected === folderName ? null : folderName,
    }));
  };
  private createSceneName = (sceneId: string, scene: Scene) => {
    const { theme, locale } = this.props;
    const { selectedSceneId, selectedDeleteSceneIds } = this.state;
    const isDeletable = this.isSceneDeletable_(sceneId);
    const isDeleteSelected = selectedDeleteSceneIds.includes(sceneId);

    return (
      <SceneRow key={sceneId}>
        {isDeletable && (
          <MultiSelectToggle
            theme={theme}
            $selected={isDeleteSelected}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              this.onSceneDeleteSelectToggle_(sceneId);
            }}
            title={LocalizedString.lookup(tr('Select for deletion'), locale)}
          >
            {isDeleteSelected ? 'x' : ''}
          </MultiSelectToggle>
        )}
        <SceneName theme={theme} selected={sceneId === selectedSceneId} onClick={() => this.onSceneClick(sceneId)}>
          {LocalizedString.lookup(scene.name, locale)}
        </SceneName>
      </SceneRow>
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
      showCreateYourOwnInstructions: false,
    }, () => {
      this.props.continueTour?.();
    });
  };
}

const ConnectedOpenSceneDialog = connect<unknown, unknown, Props>((state: ReduxState) => ({
  scenes: state.scenes,
  locale: state.i18n.locale,
}), dispatch => ({
  listUserScenes: () => dispatch(ScenesAction.LIST_USER_SCENES),
  removeScene: (sceneId: string) => dispatch(ScenesAction.removeScene({ sceneId })),
}))(withNavigate(OpenSceneDialog)) as React.ComponentType<OpenSceneDialogPublicProps>;

export default ConnectedOpenSceneDialog;