
import { ClassroomAssignment } from "../../state/State/Classroom";
import * as React from 'react';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import DialogBar from './DialogBar';
import { ThemeProps } from '../constants/theme';
import { FontAwesome } from '../FontAwesome';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { State } from '../../state';
import { Challenges } from '../../state/State';
import Async from '../../state/State/Async';
import Dict from '../../util/objectOps/Dict';
import { StyleProps } from "../../util/style";
import ScrollArea from "../interface/ScrollArea";
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';
import { isChallengeCompletionSuccessful, completionVersusDueDate, completionDuePillStyle } from '../../util/challengeCompletionStatus';
import TourTarget from '../Tours/TourTarget';
import { TourRegistry } from '../../tours/TourRegistry';


export interface AssignmentDetailsDialogPublicProps extends StyleProps, ThemeProps {
  onClose: () => void;
  assignment: ClassroomAssignment;
  config?: 'Student' | 'Teacher';
  /** When set (e.g. from gradebook for the signed-in student), student view shows completion per challenge. */
  challengeProgressions?: Dict<unknown> | null;
  tourRegistry?: TourRegistry;
}

export interface AssignmentDetailsDialogPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  challenges: Challenges;
}

type Props = AssignmentDetailsDialogPublicProps & AssignmentDetailsDialogPrivateProps & WithNavigateProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: '30em',
  margin: '1em',
  zIndex: 100,
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const Button = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  marginRight: '2.5em',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const StatusBadge = styled('span', (props: ThemeProps & { $tone: 'done' | 'todo' | 'pending' }) => ({
  fontWeight: 600,
  fontSize: '0.9em',
  minWidth: '7em',
  textAlign: 'right',
  color:
    props.$tone === 'done'
      ? '#4caf50'
      : props.$tone === 'pending'
        ? 'rgba(255, 255, 255, 0.55)'
        : '#e57373',
}));


const AssignmentDetailsDialog = ({
  onClose,
  theme,
  locale,
  assignment,
  config,
  challengeProgressions,
  navigate,
  tourRegistry,
  challenges,
}: Props) => {
  const assignmentChallenges = assignment.challenges ? Object.values(assignment.challenges) : [];
  const showProgress = config === 'Student' && challengeProgressions;

  const resolveChallengeField = (sceneId: string, snapshot: string, field: 'name' | 'description'): string => {
    const asyncC = challenges[sceneId];
    if (asyncC?.type === Async.Type.Loaded) {
      return LocalizedString.lookup(asyncC.value[field], locale);
    }
    return snapshot;
  };

  function statusForChallenge(sceneId: string): { tone: 'done' | 'todo' | 'pending'; label: LocalizedString } {
    const raw = challengeProgressions?.[sceneId];
    if (!raw) {
      return { tone: 'pending', label: tr('Not started') };
    }
    if (isChallengeCompletionSuccessful(raw)) {
      return { tone: 'done', label: tr('Completed') };
    }
    return { tone: 'todo', label: tr('Not completed') };
  }

  const titleBlock = (
    <div>
      <h2>{assignment.title}</h2>
      <p>{assignment.description}</p>
    </div>
  );

  const challengeRows = assignmentChallenges.length > 0 ? (
    assignmentChallenges.map((challengeInfo, rowIndex) => {
      const { sceneId } = challengeInfo.challenge;
      const status = showProgress ? statusForChallenge(sceneId) : null;
      const rowInner = (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0.5em 0', borderBottom: `1px solid ${theme.borderColor}`, gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 'bold' }}>{resolveChallengeField(sceneId, challengeInfo.challenge.name, 'name')}</div>
            <div>{resolveChallengeField(sceneId, challengeInfo.challenge.description, 'description')}</div>
            <div style={{ fontStyle: 'italic' }}>{LocalizedString.lookup(tr('Points'), locale)}: {challengeInfo.points || LocalizedString.lookup(tr('Not Set'), locale)}</div>
          </div>

          {status && (() => {
            const raw = challengeProgressions?.[sceneId] as
              | { completedAt?: string; bestCompletionTime?: string }
              | undefined;
            const stamp =
              status.tone === 'done' && raw
                ? typeof raw.completedAt === 'string'
                  ? raw.completedAt
                  : typeof raw.bestCompletionTime === 'string'
                    ? raw.bestCompletionTime
                    : undefined
                : undefined;
            const versus = stamp ? completionVersusDueDate(stamp, assignment.dueDate) : 'unknown';
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '8em' }}>
                <StatusBadge theme={theme} $tone={status.tone}>
                  {LocalizedString.lookup(status.label, locale)}
                </StatusBadge>
                {stamp && (
                  <span style={{ fontSize: '0.72em', color: theme.color, opacity: 0.85, textAlign: 'right', maxWidth: '16em' }}>
                    {LocalizedString.lookup(tr('Completed at'), locale)}:{' '}
                    {new Date(stamp).toLocaleString(locale)}
                  </span>
                )}
                {versus !== 'unknown' && (
                  <span style={completionDuePillStyle[versus]}>
                    {LocalizedString.lookup(
                      versus === 'on-time'
                        ? tr('On time')
                        : versus === 'late'
                          ? tr('Late')
                          : tr('No deadline'),
                      locale
                    )}
                  </span>
                )}
              </div>
            );
          })()}

          {tourRegistry && rowIndex === 0 ? (
            <TourTarget registry={tourRegistry} targetKey="assignment-details-go-challenge-first">
              <Button theme={theme} onClick={() => { navigate(`/challenge/${sceneId}`); }}>
                <FontAwesome icon={faArrowRightToBracket} style={{ marginRight: '8px' }} />
                {LocalizedString.lookup(tr('Go to Challenge'), locale)}
              </Button>
            </TourTarget>
          ) : (
            <Button theme={theme} onClick={() => { navigate(`/challenge/${sceneId}`); }}>
              <FontAwesome icon={faArrowRightToBracket} style={{ marginRight: '8px' }} />
              {LocalizedString.lookup(tr('Go to Challenge'), locale)}
            </Button>
          )}
        </div>
      );

      if (tourRegistry && rowIndex === 0) {
        return (
          <TourTarget key={sceneId} registry={tourRegistry} targetKey="assignment-details-first-challenge-row">
            {rowInner}
          </TourTarget>
        );
      }
      return <React.Fragment key={sceneId}>{rowInner}</React.Fragment>;
    })
  ) : (
    tourRegistry ? (
      <TourTarget registry={tourRegistry} targetKey="assignment-details-first-challenge-row">
        <div style={{ fontStyle: 'italic' }}>{LocalizedString.lookup(tr("No challenges added to this assignment."), locale)}</div>
      </TourTarget>
    ) : (
      <div style={{ fontStyle: 'italic' }}>{LocalizedString.lookup(tr("No challenges added to this assignment."), locale)}</div>
    )
  );

  const scrollBody = (
    <StyledScrollArea theme={theme}>
      {tourRegistry ? (
        <TourTarget registry={tourRegistry} targetKey="assignment-details-title-block">
          {titleBlock}
        </TourTarget>
      ) : (
        titleBlock
      )}
      {challengeRows}
    </StyledScrollArea>
  );

  const mainBody = tourRegistry ? (
    <TourTarget registry={tourRegistry} targetKey="assignment-details-dialog-root">
      <Container theme={theme}>
        {scrollBody}
      </Container>
    </TourTarget>
  ) : (
    <Container theme={theme}>
      {scrollBody}
    </Container>
  );

  const dialogBar = tourRegistry ? (
    <TourTarget registry={tourRegistry} targetKey="assignment-details-close-bar">
      <DialogBar theme={theme} onAccept={onClose}>{LocalizedString.lookup(tr("Close"), locale)}</DialogBar>
    </TourTarget>
  ) : (
    <DialogBar theme={theme} onAccept={onClose}>{LocalizedString.lookup(tr("Close"), locale)}</DialogBar>
  );

  return (
    <Dialog onClose={onClose} theme={theme} name={LocalizedString.lookup(tr("Assignment Details"), locale)} >
      {mainBody}
      {dialogBar}
    </Dialog>
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    challenges: state.challenges,
  };
}, () => ({}))(withNavigate(AssignmentDetailsDialog)) as React.ComponentType<AssignmentDetailsDialogPublicProps>;
