import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { DARK, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { ChallengeCard } from '../components/LimitedChallenge';

import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import Dict from '../util/objectOps/Dict';
import Async from '../state/State/Async';

import { State as ReduxState } from '../state';
import { LimitedChallenges as LimitedChallengesState, LimitedChallengeCompletions } from '../state/State';
import { LimitedChallengeBrief, AsyncLimitedChallenge } from '../state/State/LimitedChallenge';
import { LimitedChallengeCompletionBrief, AsyncLimitedChallengeCompletion } from '../state/State/LimitedChallengeCompletion';
import { LimitedChallengeCompletionsAction } from '../state/reducer/limitedChallengeCompletions';

import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import tr from '@i18n';

export interface LimitedChallengesPublicProps extends StyleProps, ThemeProps {
}

interface LimitedChallengesPrivateProps {
  locale: LocalizedString.Language;
  limitedChallenges: LimitedChallengesState;
  limitedChallengeCompletions: LimitedChallengeCompletions;
  loadCompletion: (challengeId: string) => void;
}

type Props = LimitedChallengesPublicProps & LimitedChallengesPrivateProps & WithNavigateProps;

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

class LimitedChallenges extends React.Component<Props> {
  componentDidMount() {
    // Load completions for all challenges
    const { limitedChallenges, loadCompletion } = this.props;
    Object.keys(limitedChallenges).forEach(challengeId => {
      loadCompletion(challengeId);
    });
  }

  private handleChallengeClick = (challengeId: string) => {
    // Navigate to the leaderboard page for this challenge
    window.location.href = `/limited-challenge/${challengeId}/leaderboard`;
  };

  private getChallengeBrief = (challenge: AsyncLimitedChallenge): LimitedChallengeBrief | undefined => {
    return Async.brief(challenge);
  };

  private getCompletionBrief = (completion: AsyncLimitedChallengeCompletion | undefined): LimitedChallengeCompletionBrief | undefined => {
    if (!completion) return undefined;
    return Async.brief(completion);
  };

  render() {
    const { props } = this;
    const { style, locale, limitedChallenges, limitedChallengeCompletions } = props;
    const theme = DARK;

    const challengeIds = Object.keys(limitedChallenges);

    return (
      <Container style={style} theme={theme}>
        <MainMenu theme={theme} />
        <ContentContainer theme={theme}>
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
)(withNavigate(LimitedChallenges)) as React.ComponentType<LimitedChallengesPublicProps>;
