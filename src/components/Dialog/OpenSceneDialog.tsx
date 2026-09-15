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

import { faCheck, faChevronLeft, faChevronRight, faFolderClosed, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
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
type FolderScenes = Record<string, Array<[string, Scene]>>;
interface SelectSceneDialogState {
  selectedSceneId: string | null;
  showCreateYourOwnInstructions: boolean;
  selectedDeleteSceneIds: string[];
  deleteSceneIds: string[] | null;
  folderSelected: string | null;
  showSceneSummary: boolean;
  selectedCardIndex: number | null;
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


const SummaryGrid = styled('div', (props: ThemeProps) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 8fr',
  gap: '15px',
}));

const Summary = styled('div', (props: ThemeProps & { $column: string }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gridColumn: '1/-1',
  position: "relative",
  marginTop: "10px",
  padding: '24px',
  border: `2px solid ${props.theme.borderColor}`,
  borderRadius: '10px',
  width: '98%'
}));

const SummaryPointer = styled('div', (props: { $column: string }) => ({
  position: 'absolute',
  top: '-20px',

  width: '40px',
  height: '20px',

  // Centers the pointer under column 1, 2, or 3
  left: `calc(((${props.$column} - 0.5) * (100% / 3)) - 20px)`,
}));

const SummaryInfo = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '5px'
}));

const SummaryInfoTitle = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '5px',
  maxWidth: '50px',
  fontWeight: 'bold',
  paddingRight: '7px'
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

const FolderTitle = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  justifyContent: 'center',
  fontSize: '1.2em',
  fontWeight: 600,
  padding: `${props.theme.itemPadding * 2}px`,
  // borderBottom: `1px solid ${props.theme.borderColor}`,
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
      showSceneSummary: null,
      selectedCardIndex: null,
    };
  }

  componentDidMount(): void {
    this.props.listUserScenes();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    // if (this.props.scenes !== prevProps.scenes) {
    //   const { selectedSceneId, deleteSceneIds, selectedDeleteSceneIds } = this.state;
    //   const nextSelectedDeleteSceneIds = selectedDeleteSceneIds.filter(sceneId =>
    //     Object.prototype.hasOwnProperty.call(this.props.scenes, sceneId)
    //   );
    //   if (
    //     selectedSceneId !== null &&
    //     selectedSceneId !== CREATE_YOUR_OWN_SCENE_OPTION_ID &&
    //     !Object.prototype.hasOwnProperty.call(this.props.scenes, selectedSceneId)
    //   ) {
    //     this.setState({ selectedSceneId: null, selectedDeleteSceneIds: nextSelectedDeleteSceneIds });
    //     return;
    //   }
    //   const nextDeleteSceneIds = deleteSceneIds?.filter(sceneId =>
    //     Object.prototype.hasOwnProperty.call(this.props.scenes, sceneId)
    //   ) ?? null;
    //   if (
    //     nextSelectedDeleteSceneIds.length !== selectedDeleteSceneIds.length ||
    //     (deleteSceneIds !== null && (nextDeleteSceneIds === null || nextDeleteSceneIds.length !== deleteSceneIds.length))
    //   ) {
    //     this.setState({
    //       selectedDeleteSceneIds: nextSelectedDeleteSceneIds,
    //       deleteSceneIds: nextDeleteSceneIds && nextDeleteSceneIds.length > 0 ? nextDeleteSceneIds : null,
    //     });
    //   }
    // }
  }

  render() {
    const { theme, onClose, scenes, locale, tourRegistry } = this.props;
    const {
      selectedSceneId,
      showCreateYourOwnInstructions,
      selectedDeleteSceneIds,
      deleteSceneIds,
      folderSelected,
      selectedCardIndex
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
    const folderScenes: FolderScenes = {
      'JBC Challenges': jbc_scenes,
      'Botball Explorer 2026 Missions': bex_scenes,
      'Archived Scenes': archived_scenes,
    };

    const renderSummary = (selectedScene: Scene, folderName: string) => {
      const { theme, locale } = this.props;


      return (
        <Summary
          theme={this.props.theme}
          $column={
            folderName === 'JBC Challenges'
              ? ((selectedCardIndex % 3) + 1).toString()
              : (((selectedCardIndex - 1) % 3) + 1).toString()
          }
        >
          <svg
            viewBox="0 0 620 167"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            <defs>
              <linearGradient
                id="summaryGreyGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#343434" />
                <stop offset="55%" stopColor="#292929" />
                <stop offset="100%" stopColor="#1d1d1d" />
              </linearGradient>

              <linearGradient
                id="summaryHighlight"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#ffffff"
                  stopOpacity="0.10"
                />
                <stop
                  offset="65%"
                  stopColor="#ffffff"
                  stopOpacity="0.02"
                />
                <stop
                  offset="100%"
                  stopColor="#ffffff"
                  stopOpacity="0"
                />
              </linearGradient>

              <pattern
                id="summaryDotPattern"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="3"
                  cy="3"
                  r="1.2"
                  fill="white"
                  opacity="0.07"
                />
              </pattern>
            </defs>

            {/* Background */}
            <rect
              x="0"
              y="0"
              width="620"
              height="167"
              rx="8"
              fill="url(#summaryGreyGradient)"
            />

            {/* Top highlight */}
            <path
              d="M 0 2 H 620"
              fill="none"
              stroke="url(#summaryHighlight)"
              strokeWidth="2"
            />

            {/* Left circuit traces */}
            <g
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.07"
            >
              <path d="M 0 48 H 75 L 92 65 H 150" />
              <path d="M 20 77 H 110 L 132 99 H 205" />
              <path d="M 0 125 H 60 L 78 143 H 165" />
            </g>

            {/* Center traces */}
            <g
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.055"
            >
              <path d="M 230 25 H 285 L 305 45 H 365" />
              <path d="M 270 120 H 330 L 350 140 H 420" />
            </g>

            {/* Right circuit traces */}
            <g
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.07"
            >
              <path d="M 420 48 H 485 L 505 68 H 590" />
              <path d="M 465 91 H 520 L 542 113 H 620" />
            </g>

            {/* Circuit nodes */}
            <g
              fill="#343434"
              stroke="white"
              strokeWidth="1"
              opacity="0.15"
            >
              <circle cx="150" cy="65" r="3" />
              <circle cx="205" cy="99" r="3" />
              <circle cx="365" cy="45" r="3" />
              <circle cx="420" cy="140" r="3" />
              <circle cx="590" cy="68" r="3" />
            </g>

            {/* Right-side dot matrix */}
            <path
              d="
      M 470 100
      Q 530 78 620 92
      L 620 167
      L 485 167
      Q 455 140 470 100
      Z
    "
              fill="url(#summaryDotPattern)"
              opacity="0.75"
            />

            {/* Very subtle lower depth layer */}
            <path
              d="
      M 0 140
      Q 130 128 250 145
      Q 390 160 620 130
      L 620 167
      L 0 167
      Z
    "
              fill="#000000"
              opacity="0.07"
            />
          </svg>

          <SummaryPointer
            $column={
              folderName === 'JBC Challenges'
                ? ((selectedCardIndex % 3) + 1).toString()
                : (((selectedCardIndex - 1) % 3) + 1).toString()
            }
          >
            <svg viewBox="0 0 40 20">
              <path
                d="M 0 20 C 10 20, 10 0, 20 0 C 30 0, 30 20, 40 20"
                fill="none"
                stroke={this.props.theme.borderColor}
                strokeWidth="2"
              />
            </svg>
          </SummaryPointer>

          <div
            style={{
              position: 'relative',
              zIndex: 1
            }}
          >
            <div
              style={{
                fontWeight: 400,
                textDecoration: 'underline',
                marginBottom: '5px'
              }}
            >
              {selectedScene.description[this.props.locale]}
            </div>

            {selectedScene.summary && (

              <SummaryGrid theme={theme}>
                <SummaryInfoTitle theme={theme}>
                  Skill:
                </SummaryInfoTitle>
                <SummaryInfo theme={theme}>

                  {selectedScene.summary.skill[this.props.locale]}
                </SummaryInfo>
                <SummaryInfoTitle theme={theme}>
                  Base:
                </SummaryInfoTitle>
                <SummaryInfo theme={theme}>

                  {selectedScene.summary.baseMission[this.props.locale]}
                </SummaryInfo>
                {selectedScene.summary.bonusMission && (
                  <>
                    <SummaryInfoTitle theme={theme}>
                      Bonus:
                    </SummaryInfoTitle>
                    <SummaryInfo theme={theme}>
                      {selectedScene.summary.bonusMission[this.props.locale]}
                    </SummaryInfo>
                  </>
                )}
                {selectedScene.summary.advancedBonusMission && (
                  <>
                    <SummaryInfoTitle theme={theme}>
                      Advanced Bonus:
                    </SummaryInfoTitle>
                    <SummaryInfo theme={theme}>
                      {selectedScene.summary.advancedBonusMission[this.props.locale]}
                    </SummaryInfo>
                  </>
                )}

              </SummaryGrid>
              // <div>
              //   <SummaryInfo theme={theme}>
              //     <div
              //       style={{
              //         fontWeight: 'bold',
              //         paddingRight: '7px'
              //       }}
              //     >
              //       Skill:
              //     </div>

            //     {selectedScene.summary.skill[this.props.locale]}
            //   </SummaryInfo>

            //   <SummaryInfo theme={theme}>
            //     <div
            //       style={{
            //         fontWeight: 'bold',
            //         paddingRight: '7px'
            //       }}
            //     >
            //       Base:
            //     </div>

            //     {selectedScene.summary.baseMission[this.props.locale]}
            //   </SummaryInfo>

            //   <SummaryInfo theme={theme}>
            //     <div
            //       style={{
            //         fontWeight: 'bold',
            //         paddingRight: '7px'
            //       }}
            //     >
            //       Bonus:
            //     </div>

            //     {selectedScene.summary.bonusMission[this.props.locale]}
            //   </SummaryInfo>

            //   {selectedScene.summary.advancedBonusMission && (
            //     <SummaryInfo theme={theme}>
            //       <div
            //         style={{
            //           fontWeight: 'bold',
            //           paddingRight: '7px',
            //           width: '15%'
            //         }}
            //       >
            //         Advanced Bonus:
            //       </div>

            //       {
            //         selectedScene.summary
            //           .advancedBonusMission[this.props.locale]
            //       }
            //     </SummaryInfo>
            //   )}
            // </div>
            )}
          </div>
        </Summary>
      );

    };
    const renderSceneCards = (folderName: string) => {
      const { theme } = this.props;
      const { selectedSceneId, selectedCardIndex } = this.state;

      // const selectedScene =
      //   selectedCardIndex !== null
      //     ? folderScenes[folderName][selectedCardIndex - 1][1]
      //     : null;

      const selectedScene: Scene | null =
        selectedCardIndex !== null
          ? folderName === 'JBC Challenges' ? folderScenes[folderName][selectedCardIndex][1] : folderScenes[folderName][selectedCardIndex - 1][1] : null;
      return (
        <StyledScrollArea theme={theme}>
          <FolderTitle theme={theme}>{folderName}</FolderTitle>
          <ChallengeItemContainer theme={theme}>
            {folderScenes[folderName].map(([sceneId, scene], index) => {
              let cardIndex: number;
              const gridIndex = index + 1;
              if (folderName === 'JBC Challenges') {
                const match = /\d+/.exec(scene.name[this.props.locale]);
                cardIndex = match ? Number(match[0]) : index;
              } else {
                cardIndex = index + 1;
              }
              const selectedRow =
                selectedCardIndex !== null
                  ? folderName === 'JBC Challenges'
                    ? Math.floor(selectedCardIndex / 3) + 1
                    : Math.ceil(selectedCardIndex / 3)
                  : null;

              const currentRow =
                Math.floor(index / 3) + 1;

              const isEndOfRow =
                gridIndex % 3 === 0 ||
                gridIndex === folderScenes[folderName].length;
              return (
                <React.Fragment key={sceneId}>
                  <ChallengeCard
                    cardContent={{
                      title: scene.name,
                      description: scene.description
                    }}
                    backgroundImage={`url(../../../static/icons/bot_guy_numbers/${cardIndex}.svg)`}
                    theme={theme}
                    customheight="150px"
                    customwidth="150px"
                    selected={
                      selectedSceneId === sceneId
                    }
                    onClick={() =>
                      this.onSceneClick(
                        sceneId,
                        true,
                        folderScenes[folderName],
                        folderName === 'JBC Challenges' ? index : index + 1
                      )
                    }
                  />

                  {selectedCardIndex !== null &&
                    currentRow === selectedRow &&
                    isEndOfRow &&
                    selectedScene && (
                    renderSummary(selectedScene, folderName)
                  )}
                </React.Fragment>
              );
            })}
          </ChallengeItemContainer>
        </StyledScrollArea>);
    };
    const sceneColumn_ = (
      <div>
        {/* {this.createCreateYourOwnSceneName()} */}
        {
          sandbox_scenes.map(([sceneId, scene]) => this.createSceneName(sceneId, scene))
        }
        {Object.entries(folderScenes).map(([folderName, scenes]) => (
          <div key={scenes.map(s => s[0]).join('-')}>
            <SceneName onClick={() => this.handleFolderSelect(folderName)} key={folderName} theme={theme} selected={this.state.folderSelected === folderName}>
              <FontAwesome icon={this.state.folderSelected === folderName ? faFolderOpen : faFolderClosed} style={{ marginRight: '5px' }} />
              <strong>{folderName}</strong>

            </SceneName>

          </div>
        ))}
      </div>
    );

    const infoColumn_ = (

      <InfoContainer theme={theme}>
        {folderSelected ? renderSceneCards(folderSelected) : selectedSceneId === null
          ? this.createNoSceneInfo()
          : this.createSelectedSceneInfo(scenes)}

      </InfoContainer>
    );



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
      selectedSceneId: null,
      selectedCardIndex: null,
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

  private onSceneClick = (sceneId: string, challengeCard?: boolean, scenes?: [string, Scene][], index?: number) => {

    if (challengeCard) {
      this.setState(prevState => (
        {
          selectedSceneId: prevState.selectedSceneId === sceneId ? null : sceneId,
          selectedCardIndex: prevState.selectedCardIndex === index ? null : index,
          showCreateYourOwnInstructions: false,
        }));
    } else {
      this.setState({
        selectedSceneId: sceneId,
        showCreateYourOwnInstructions: false,
        folderSelected: null
      }, () => {
        this.props.continueTour?.();
      });
    }
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