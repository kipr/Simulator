import { Classroom, ClassroomAssignment, ClassroomAssignmentChallenge } from "../../state/State/Classroom";
import * as React from 'react';
import { styled } from 'styletron-react';
import Async from '../../state/State/Async';
import { Dialog } from './Dialog';
import DialogBar from './DialogBar';
import { ThemeProps, GREEN, RED } from '../constants/theme';
import { FontAwesome } from '../FontAwesome';
import tr from '@i18n';
import { useMemo, useState } from 'react';
import LocalizedString from '../../util/LocalizedString';
import { faAngleUp, faAngleDown, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { State as ReduxState, State } from '../../state';
import Dict from '../../util/objectOps/Dict';
import { sprintf } from 'sprintf-js';
import { StyleProps } from "../../util/style";
import Challenge from '../Challenge';
import ScrollArea from "../interface/ScrollArea";
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';
import ChallengeCompletion from "../../state/State/ChallengeCompletion";
import { Challenges } from "../../state/State";
import { completionVersusDueDate, completionDuePillStyle } from '../../util/challengeCompletionStatus';
import { defaultChallengePoints, getEffectiveChallengePoints } from '../../util/classroomGradeOverrides';
import { ChallengePointsOverrideField } from '../Classrooms/ChallengePointsOverrideField';

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  src?: string; '../'
  backgroundColor?: string;
}


interface ChallengeData {
  success?: {
    exprStates: {
      completion?: boolean;
    };
  };
  failure?: {
    exprStates: {
      failure?: boolean;
    };
  };
  completedAt?: string;
  bestCompletionTime?: string;
}
interface Score {
  name: string;
  sceneId: string;
  defaultPoints: number;
  points: number;
  completed: boolean;
  completedAt?: string;
}
interface UserGrade {
  studentId: string;
  assignedChallenges: Score[];
  finalScore?: number;
}
export interface AssignmentSubmissionDetailsPublicProps extends StyleProps, ThemeProps {
  onClose: () => void;
  assignment: ClassroomAssignment
  studentId: string;
  challengeProgressions: Dict<ChallengeCompletion> | null;
  /** When set (teacher view), points reflect overrides and can be edited. */
  classroom?: Classroom | null;
  onChallengePointsOverride?: (
    studentId: string,
    assignment: ClassroomAssignment,
    sceneId: string,
    overridePoints: number | null
  ) => void;
}

export interface AssignmentSubmissionDetailsPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  challenges: Challenges;

}


type Props = AssignmentSubmissionDetailsPublicProps & AssignmentSubmissionDetailsPrivateProps & WithNavigateProps;

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
  // opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const Icon = styled(FontAwesome, {
  paddingRight: "5px",
  height: "1.5em",
});


const AssignmentSubmissionDetails = ({
  onClose,
  theme,
  locale,
  assignment,
  studentId,
  navigate,
  challengeProgressions,
  challenges,
  classroom,
  onChallengePointsOverride,
}: Props) => {
  const [challengeCompletionVisible, setChallengeCompletionVisible] = React.useState<string | null>(null);

  const challengeCompletion = (challenge: ChallengeData) => (
    (challenge?.success?.exprStates?.completion ?? false) &&
    !(challenge?.failure?.exprStates?.failure ?? false)
  );

  const assignmentChallenges = Object.values(assignment.challenges);
  const userGrade = useMemo((): UserGrade | null => {
    if (!studentId) return null;
    const scores = assignmentChallenges.map(challengeInfo => {
      const progression = challengeProgressions
        ? (challengeProgressions[challengeInfo.challenge.sceneId] as ChallengeData | undefined)
        : undefined;

      const isCompleted = progression ? challengeCompletion(progression) : false;
      const completedAt =
        typeof progression?.completedAt === 'string'
          ? progression.completedAt
          : typeof progression?.bestCompletionTime === 'string'
            ? progression.bestCompletionTime
            : undefined;

      const basePts = defaultChallengePoints(challengeInfo.points);
      const points = classroom
        ? getEffectiveChallengePoints(
          classroom,
          studentId,
          assignment,
          challengeInfo.challenge.sceneId,
          challengeInfo.points
        )
        : basePts;

      return {
        name: challengeInfo.challenge.name,
        sceneId: challengeInfo.challenge.sceneId,
        defaultPoints: basePts,
        points,
        completed: isCompleted,
        completedAt,
      };
    });

    const finalScore = scores.reduce((total, score) => total + (score.completed ? score.points : 0), 0);
    return { studentId, assignedChallenges: scores, finalScore };
  }, [studentId, assignment, assignment.challenges, challengeProgressions, classroom]);

  function renderChallengeCompletion(challenge: ClassroomAssignmentChallenge) {
    const progression = challengeProgressions ? challengeProgressions[challenge.sceneId] : null;
    const asyncChallengeCompletion = Async.loaded({
      value: progression,
      brief: {}
    });
    const loadedChallenge = challenges[challenge.sceneId];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '20em' }}>
        <Challenge challenge={loadedChallenge} challengeCompletion={asyncChallengeCompletion} theme={theme} />
      </div>
      // <div></div>
    );
  }

  return (
    <Dialog onClose={onClose} theme={theme} name={LocalizedString.lookup(tr("Submission Details"), locale)} >
      <Container theme={theme}>
        <StyledScrollArea theme={theme}>
          <div>
            <h2>{LocalizedString.lookup(tr("Title"), locale)}: {assignment.title}</h2>
            {assignment.description && <p>{LocalizedString.lookup(tr("Description"), locale)}: {assignment.description}</p>}
            {userGrade && <p style={{ fontWeight: 'bold' }}>{LocalizedString.lookup(tr("Final Score"), locale)}: {userGrade.finalScore} / {assignment.points}</p>}
          </div>

          {Object.values(assignment.challenges).map(challengeInfo => (
            <div key={challengeInfo.challenge.sceneId}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0.5em 0', borderBottom: `1px solid ${theme.borderColor}` }}>
                <div style={{ display: 'flex', flexDirection: 'column', }}>
                  <div style={{ fontWeight: 'bold' }}>{challengeInfo.challenge.name}</div>
                  <div>{challengeInfo.challenge.description}</div>
                  <div style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                    <span>
                      {LocalizedString.lookup(tr('Points'), locale)}: {userGrade?.assignedChallenges.find(s => s.sceneId === challengeInfo.challenge.sceneId)?.points ?? (challengeInfo.points || LocalizedString.lookup(tr('Not Set'), locale))}
                      {classroom && userGrade && (
                        <span style={{ opacity: 0.75, marginLeft: 6 }}>
                          ({LocalizedString.lookup(tr('Default'), locale)}: {defaultChallengePoints(challengeInfo.points)})
                        </span>
                      )}
                    </span>
                    {classroom && onChallengePointsOverride && studentId ? (
                      <ChallengePointsOverrideField
                        theme={theme}
                        locale={locale}
                        studentId={studentId}
                        assignment={assignment}
                        sceneId={challengeInfo.challenge.sceneId}
                        defaultPoints={challengeInfo.points}
                        classroom={classroom}
                        onCommit={override =>
                          onChallengePointsOverride(studentId, assignment, challengeInfo.challenge.sceneId, override)
                        }
                      />
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5em' }}>
                  {userGrade && (() => {
                    const row = userGrade.assignedChallenges.find(s => s.sceneId === challengeInfo.challenge.sceneId);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {row?.completed ? (
                            <span style={{ color: 'green' }}>{LocalizedString.lookup(tr('Completed'), locale)}</span>
                          ) : (
                            <span style={{ color: 'red' }}>{LocalizedString.lookup(tr('Not Completed'), locale)}</span>
                          )}
                        </div>
                        {row?.completed && row.completedAt && (
                          <>
                            <div style={{ fontSize: '0.75em', opacity: 0.85, fontWeight: 'normal' }}>
                              {LocalizedString.lookup(tr('Completed at'), locale)}:{' '}
                              {new Date(row.completedAt).toLocaleString(locale)}
                            </div>
                            {(() => {
                              const versus = completionVersusDueDate(row.completedAt, assignment.dueDate);
                              if (versus === 'unknown') return null;
                              return (
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
                              );
                            })()}
                          </>
                        )}
                      </div>
                    );
                  })()}
                  <Icon icon={challengeCompletionVisible === challengeInfo.challenge.sceneId ? faAngleUp : faAngleDown} onClick={() => setChallengeCompletionVisible(challengeCompletionVisible === challengeInfo.challenge.sceneId ? null : challengeInfo.challenge.sceneId)} />
                </div>
              </div>
              {challengeCompletionVisible && challengeProgressions && challengeProgressions[challengeCompletionVisible] && challengeCompletionVisible === challengeInfo.challenge.sceneId && (
                <div style={{ margin: '1em', padding: '1em', border: `1px solid ${theme.borderColor}`, borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5em' }}>Challenge Progression</div>
                  {renderChallengeCompletion(challengeInfo.challenge)}
                </div>
              )}

              {challengeCompletionVisible === challengeInfo.challenge.sceneId &&
                !challengeProgressions?.[challengeInfo.challenge.sceneId] && (
                <div style={{ margin: '1em', padding: '1em', border: `1px solid ${theme.borderColor}`, borderRadius: '4px' }}>
                  <div style={{ fontStyle: 'italic' }}>Student has not started this challenge.</div>
                </div>
              )}
            </div>
          ))}





        </StyledScrollArea>
      </Container>
      <DialogBar theme={theme} onAccept={onClose}>{LocalizedString.lookup(tr("Close"), locale)}</DialogBar>
    </Dialog>
  );
};

export default connect((state: ReduxState) => {
  return {
    locale: state.i18n.locale,
    challenges: state.challenges,
  };
}, (dispatch, ownProps) => ({
}))(withNavigate(AssignmentSubmissionDetails));
