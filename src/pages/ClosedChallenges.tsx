import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { DARK, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { ChallengeCard } from '../components/LimitedChallenge';

import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import Async from '../state/State/Async';

import { State as ReduxState } from '../state';
import { LimitedChallenges as LimitedChallengesState, LimitedChallengeCompletions } from '../state/State';
import { LimitedChallengeBrief, LimitedChallengeStatus, AsyncLimitedChallenge } from '../state/State/LimitedChallenge';
import { LimitedChallengeCompletionBrief, AsyncLimitedChallengeCompletion } from '../state/State/LimitedChallengeCompletion';
import { LimitedChallengeCompletionsAction } from '../state/reducer/limitedChallengeCompletions';

import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import tr from '@i18n';

export interface ClosedChallengesPublicProps extends StyleProps, ThemeProps {
}

interface ClosedChallengesPrivateProps {
  locale: LocalizedString.Language;
  limitedChallenges: LimitedChallengesState;
  limitedChallengeCompletions: LimitedChallengeCompletions;
  loadCompletion: (challengeId: string) => void;
}

type Props = ClosedChallengesPublicProps & ClosedChallengesPrivateProps & WithNavigateProps;

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

const BackButton = styled('button', (props: ThemeProps) => ({
  backgroundColor: 'transparent',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  color: props.theme.color,
  padding: '8px 16px',
  fontSize: '0.9em',
  cursor: 'pointer',
  marginBottom: '16px',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: props.theme.borderColor,
  },
}));

class ClosedChallenges extends React.Component<Props> {
  componentDidMount() {
    // Load completions for all closed challenges
    const { limitedChallenges, loadCompletion } = this.props;
    Object.keys(limitedChallenges).forEach(challengeId => {
      const challenge = limitedChallenges[challengeId];
      const brief = Async.brief(challenge);
      if (brief && LimitedChallengeStatus.fromBrief(brief) === 'closed') {
        loadCompletion(challengeId);
      }
    });
  }

  private handleBackClick = () => {
    this.props.navigate('/limited-challenges');
  };

  private handleChallengeClick = (challengeId: string) => {
    // Navigate to the leaderboard page for this challenge
    this.props.navigate(`/limited-challenge/${challengeId}/leaderboard`);
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

    // Filter to only show closed challenges
    const challengeIds = Object.keys(limitedChallenges).filter(challengeId => {
      const challenge = limitedChallenges[challengeId];
      const brief = Async.brief(challenge);
      if (!brief) return false;
      return LimitedChallengeStatus.fromBrief(brief) === 'closed';
    });

    return (
      <Container style={style} theme={theme}>
        <MainMenu theme={theme} />
        <ContentContainer theme={theme}>
          <BackButton theme={theme} onClick={this.handleBackClick}>
            {LocalizedString.lookup(tr('Back to Limited Challenges'), locale)}
          </BackButton>
          <PageTitle theme={theme}>
            {LocalizedString.lookup(tr('Closed Challenges'), locale)}
          </PageTitle>
          <PageDescription theme={theme}>
            {LocalizedString.lookup(tr('View past limited challenges and their leaderboards.'), locale)}
          </PageDescription>

          {challengeIds.length === 0 ? (
            <EmptyState theme={theme}>
              {LocalizedString.lookup(tr('No closed challenges yet.'), locale)}
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
)(withNavigate(ClosedChallenges)) as React.ComponentType<ClosedChallengesPublicProps>;
