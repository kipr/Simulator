import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { DARK, ThemeProps } from '../constants/theme';
import { ChallengeCard } from '../LimitedChallenge';

import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import Async from 'state/State/Async';

import { State as ReduxState } from '../../state';
import { LimitedChallenges as ClassroomLimitedChallengesState, LimitedChallengeCompletions } from '../../state/State';
import { LimitedChallengeBrief, LimitedChallengeStatus, AsyncLimitedChallenge } from '../../state/State/LimitedChallenge';
import { LimitedChallengeCompletionBrief, AsyncLimitedChallengeCompletion } from '../../state/State/LimitedChallengeCompletion';
import { LimitedChallengeCompletionsAction } from '../../state/reducer/limitedChallengeCompletions';

import { withNavigate, WithNavigateProps } from '../../util/withNavigate';
import tr from '@i18n';
import ClassroomLimitedChallengeLeaderboard from './ClassroomLimitedChallengeLeaderboard';

export interface ClassroomLimitedChallengesPublicProps extends StyleProps, ThemeProps {
}

interface ClassroomLimitedChallengesPrivateProps {
  locale: LocalizedString.Language;
  limitedChallenges: ClassroomLimitedChallengesState;
  limitedChallengeCompletions: LimitedChallengeCompletions;
  loadCompletion: (challengeId: string) => void;
}

interface ClassroomChallengesState {
  limitedChallenge: string;
}

type Props = ClassroomLimitedChallengesPublicProps & ClassroomLimitedChallengesPrivateProps & WithNavigateProps;

type State = ClassroomChallengesState;
const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  minHeight: '100vh',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const ContentContainer = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  overflow: 'auto',
}));

const PageTitle = styled('h1', (props: ThemeProps) => ({
  fontSize: '2em',
  fontWeight: 'bold',
  color: props.theme.color,
  marginBottom: '8px',
  textAlign: 'center',
}));

const PageDescription = styled('p', (props: ThemeProps) => ({
  fontSize: '1em',
  color: props.theme.color,
  opacity: 0.8,
  marginBottom: '24px',
  textAlign: 'center',
  maxWidth: '600px',
}));

const ChallengeGrid = styled('div', () => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '1200px',
}));

const EmptyState = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  color: props.theme.color,
  opacity: 0.6,
}));

const ClosedChallengesButton = styled('button', (props: ThemeProps) => ({
  backgroundColor: props.theme.borderColor,
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  color: props.theme.color,
  padding: '12px 24px',
  fontSize: '1em',
  cursor: 'pointer',
  marginTop: '32px',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: props.theme.color,
    color: props.theme.backgroundColor,
  },
}));

class ClassroomLimitedChallenges extends React.Component<Props, State> {


  constructor(props: Props) {
    super(props);
    this.state = {
      limitedChallenge: ''
    }
  }
  componentDidMount() {
    // Load completions for challenges within one week of opening
    const { limitedChallenges, loadCompletion } = this.props;
    Object.keys(limitedChallenges).forEach(challengeId => {
      const challenge = limitedChallenges[challengeId];
      const brief = Async.brief(challenge);
      if (brief && this.isWithinOneWeek(brief.openDate)) {
        loadCompletion(challengeId);
      }
    });
  }

  private isWithinOneWeek = (openDate: string): boolean => {
    const oneWeekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const openTime = new Date(openDate).getTime();
    return openTime <= oneWeekFromNow;
  };

  private handleChallengeClick = (challengeId: string) => {
    // Navigate to the leaderboard page for this challenge
    this.setState({
      limitedChallenge: challengeId
    })
  };

  private handleClosedChallengesClick = () => {
    this.props.navigate('/closed-challenges');
  };

  private onBackToChallenges_ = () => {
    this.setState({
      limitedChallenge: ''
    })
  };
  private getChallengeBrief = (challenge: AsyncLimitedChallenge): LimitedChallengeBrief | undefined => {
    return Async.brief(challenge);
  };

  private getCompletionBrief = (completion: AsyncLimitedChallengeCompletion | undefined): LimitedChallengeCompletionBrief | undefined => {
    if (!completion) return undefined;
    return Async.brief(completion);
  };

  render() {
    const { props, state } = this;
    const { limitedChallenge } = state;
    const { style, locale, limitedChallenges, limitedChallengeCompletions } = props;
    const theme = DARK;

    // Filter out challenges that are more than a week in the future and exclude closed challenges
    const challengeIds = Object.keys(limitedChallenges).filter(challengeId => {
      const challenge = limitedChallenges[challengeId];
      const brief = Async.brief(challenge);
      if (!brief) return false;
      const status = LimitedChallengeStatus.fromBrief(brief);
      // Only show upcoming and open challenges, not closed ones
      return this.isWithinOneWeek(brief.openDate) && status !== 'closed';
    });

    return (
      <Container style={style} theme={theme}>
        <ContentContainer theme={theme}>
          {!limitedChallenge &&
            <>
              <PageTitle theme={theme}>
                {LocalizedString.lookup(tr('Limited Challenges'), locale)}
              </PageTitle>
              <PageDescription theme={theme}>
                {LocalizedString.lookup(tr('Complete these time-limited challenges as fast as possible! Your best time will be recorded.'), locale)}
              </PageDescription>

              {challengeIds.length === 0 ? (
                <EmptyState theme={theme}>
                  {LocalizedString.lookup(tr('No limited challenges available at this time.'), locale)}
                </EmptyState>
              ) : (
                <ChallengeGrid>
                  {challengeIds.map(challengeId => {
                    const challenge = limitedChallenges[challengeId];
                    const challengeBrief = this.getChallengeBrief(challenge);
                    const completionBrief = this.getCompletionBrief(limitedChallengeCompletions[challengeId]);

                    if (!challengeBrief) return null;

                    return (
                      <ChallengeCard
                        key={challengeId}
                        challengeId={challengeId}
                        challenge={challengeBrief}
                        completion={completionBrief}
                        theme={theme}
                        locale={locale}
                        onClick={this.handleChallengeClick}
                      />
                    );
                  })}
                </ChallengeGrid>
              )}

              <ClosedChallengesButton theme={theme} onClick={this.handleClosedChallengesClick}>
                {LocalizedString.lookup(tr('View Closed Challenges'), locale)}
              </ClosedChallengesButton>
            </>

          }

          {limitedChallenge && <ClassroomLimitedChallengeLeaderboard
            theme={DARK} challengeId={limitedChallenge} onBackToChallenges={this.onBackToChallenges_} />}
        </ContentContainer>
      </Container>
    );
  }
}

export default connect(
  (state: ReduxState) => ({
    locale: state.i18n.locale,
    limitedChallenges: state.limitedChallenges,
    limitedChallengeCompletions: state.limitedChallengeCompletions,
  }),
  (dispatch) => ({
    loadCompletion: (challengeId: string) => {
      dispatch(LimitedChallengeCompletionsAction.loadLimitedChallengeCompletion({ challengeId }));
    },
  })
)(withNavigate(ClassroomLimitedChallenges)) as React.ComponentType<ClassroomLimitedChallengesPublicProps>;
