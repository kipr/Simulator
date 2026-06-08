import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import { State as ReduxState } from '../../state';
import Async from '../../state/State/Async';
import Challenge from '../../state/State/Challenge';
import LocalizedString from '../../util/LocalizedString';
import Input from '../interface/Input';
import TextArea from '../interface/TextArea';
import Field from '../interface/Field';
import Section from '../interface/Section';
import ScrollArea from '../interface/ScrollArea';
import PredicateEditor from '../Challenge/PredicateEditor';
import tr from '@i18n';
import { ChallengeCompletionsAction, ChallengesAction, ScenesAction } from '../../state/reducer';
import { isManagedCustomChallengeEventId } from '../../util/customChallengeGoals';
import EventListEditor from './EventListEditor';
import ConditionGoalsEditor from './ConditionGoalsEditor';
import {
  buildFailureGoals,
  buildFailurePredicate,
  buildSuccessGoals,
  buildSuccessPredicate,
  conditionGoalsFromChallenge,
  ConditionGoalInput,
} from '../../util/customChallengePredicates';
import Author from '../../db/Author';
import { auth } from '../../firebase/firebase';
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';

export interface CustomChallengeEditorPublicProps extends ThemeProps {
  challengeId: string;
}

interface CustomChallengeEditorPrivateProps {
  locale: LocalizedString.Language;
  challenge: Challenge | null;
  challengeAsyncType: Async.Type | undefined;
}

type Props = CustomChallengeEditorPublicProps &
CustomChallengeEditorPrivateProps &
WithNavigateProps & {
  dispatch: (action: unknown) => void;
};

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  minHeight: 0,
  color: props.theme.color,
}));

const Actions = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const ActionButton = styled('button', (props: ThemeProps) => ({
  padding: '10px 16px',
  backgroundColor: '#2196f3',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

const PredicatePreview = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  marginTop: `${props.theme.itemPadding}px`,
}));

class CustomChallengeEditor extends React.PureComponent<Props> {
  private successGoals_: ConditionGoalInput[] = [];
  private failureGoals_: ConditionGoalInput[] = [];

  componentDidMount(): void {
    this.syncGoalsFromChallenge_();
    const { challengeId, dispatch } = this.props;
    dispatch(ChallengesAction.loadChallenge({ challengeId }));
    dispatch(ScenesAction.loadScene({ sceneId: challengeId }));
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.challenge !== this.props.challenge && this.props.challenge) {
      this.syncGoalsFromChallenge_();
    }
  }

  private syncGoalsFromChallenge_ = () => {
    const challenge = this.props.challenge;
    if (!challenge) return;
    this.successGoals_ = conditionGoalsFromChallenge(challenge.success, challenge.successGoals);
    this.failureGoals_ = conditionGoalsFromChallenge(challenge.failure, challenge.failureGoals);
    this.forceUpdate();
  };

  private applyConditions_ = () => {
    const { challenge, challengeId, dispatch } = this.props;
    const success = buildSuccessPredicate(this.successGoals_);
    const failure = buildFailurePredicate(this.failureGoals_);
    dispatch(
      ChallengesAction.applyChallengeConditions({
        challengeId,
        success,
        failure,
        successGoals: success ? buildSuccessGoals(this.successGoals_) : undefined,
        failureGoals: failure ? buildFailureGoals(this.failureGoals_) : undefined,
      })
    );

    if (!challenge) return;
    const referencedEventIds = new Set([
      ...this.successGoals_.map(goal => goal.eventId),
      ...this.failureGoals_.map(goal => goal.eventId),
    ]);
    for (const eventId of Object.keys(challenge.events)) {
      if (referencedEventIds.has(eventId) || !isManagedCustomChallengeEventId(eventId)) {
        continue;
      }
      dispatch(ChallengesAction.removeEvent({ challengeId, eventId }));
      dispatch(ChallengeCompletionsAction.removeEventState({ challengeId, eventId }));
    }
  };

  private syncEvents_ = (events: Challenge['events']) => {
    const challenge = this.props.challenge;
    if (!challenge) return;
    const challengeId = this.props.challengeId;
    for (const eventId of Object.keys(challenge.events)) {
      if (!(eventId in events)) {
        this.props.dispatch(ChallengesAction.removeEvent({ challengeId, eventId }));
      }
    }
    for (const [eventId, event] of Object.entries(events)) {
      this.props.dispatch(ChallengesAction.setEvent({ challengeId, eventId, event }));
    }
  };

  private onSave_ = () => {
    this.props.dispatch(ChallengesAction.saveChallenge({ challengeId: this.props.challengeId }));
    this.props.dispatch(ScenesAction.saveScene({ sceneId: this.props.challengeId }));
  };

  private onEditWorld_ = () => {
    this.onSave_();
    this.props.navigate(`/scene/${this.props.challengeId}`);
  };

  private onTest_ = () => {
    this.onSave_();
    window.location.href = `/challenge/${this.props.challengeId}`;
  };

  render() {
    const { theme, locale, challenge, challengeAsyncType } = this.props;

    if (!challenge) {
      return (
        <Container theme={theme}>
          <p style={{ padding: 24 }}>
            {challengeAsyncType === Async.Type.Loading
              ? LocalizedString.lookup(tr('Loading challenge...'), locale)
              : LocalizedString.lookup(tr('Challenge not found.'), locale)}
          </p>
        </Container>
      );
    }

    const uid = auth.currentUser?.uid;
    const isOwner =
      challenge.author.type === Author.Type.User && challenge.author.id === uid;

    return (
      <Container theme={theme}>
        <Actions theme={theme}>
          <ActionButton theme={theme} type="button" onClick={this.onSave_} disabled={!isOwner}>
            {LocalizedString.lookup(tr('Save'), locale)}
          </ActionButton>
          <ActionButton theme={theme} type="button" onClick={this.onEditWorld_}>
            {LocalizedString.lookup(tr('Edit world'), locale)}
          </ActionButton>
          <ActionButton theme={theme} type="button" onClick={this.onTest_}>
            {LocalizedString.lookup(tr('Test challenge'), locale)}
          </ActionButton>
        </Actions>
        <ScrollArea theme={theme} style={{ flex: '1 1' }}>
          <div style={{ padding: theme.itemPadding * 2 }}>
            <Section name={LocalizedString.lookup(tr('Details'), locale)} theme={theme}>
              <Field name={LocalizedString.lookup(tr('Name'), locale)} theme={theme} long>
                <Input
                  theme={theme}
                  value={LocalizedString.lookup(challenge.name, LocalizedString.EN_US)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    this.props.dispatch(
                      ChallengesAction.setName({
                        challengeId: this.props.challengeId,
                        name: {
                          ...challenge.name,
                          [LocalizedString.EN_US]: e.currentTarget.value,
                        },
                      })
                    )
                  }
                />
              </Field>
              <Field name={LocalizedString.lookup(tr('Description'), locale)} theme={theme} multiline>
                <TextArea
                  theme={theme}
                  value={LocalizedString.lookup(challenge.description, LocalizedString.EN_US)}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    this.props.dispatch(
                      ChallengesAction.setDescription({
                        challengeId: this.props.challengeId,
                        description: {
                          ...challenge.description,
                          [LocalizedString.EN_US]: e.currentTarget.value,
                        },
                      })
                    )
                  }
                />
              </Field>
            </Section>

            <Section name={LocalizedString.lookup(tr('Challenge events'), locale)} theme={theme}>
              <p style={{ opacity: 0.85 }}>
                {LocalizedString.lookup(
                  tr(
                    'Events are set to true in your world scripts using scene.setChallengeEventValue. Add every event id you reference in the scene.'
                  ),
                  locale
                )}
              </p>
              <EventListEditor
                theme={theme}
                locale={locale}
                events={challenge.events}
                onChange={events => this.syncEvents_(events)}
              />
            </Section>

            <Section name={LocalizedString.lookup(tr('Success conditions'), locale)} theme={theme}>
              <ConditionGoalsEditor
                theme={theme}
                locale={locale}
                title={LocalizedString.lookup(tr('All must be met'), locale)}
                helpText={LocalizedString.lookup(
                  tr('Every goal must be satisfied to win.'),
                  locale
                )}
                events={challenge.events}
                goals={this.successGoals_}
                onChange={goals => {
                  this.successGoals_ = goals;
                  this.applyConditions_();
                }}
              />
              {challenge.success && (
                <PredicatePreview theme={theme}>
                  <PredicateEditor
                    predicate={challenge.success}
                    events={challenge.events}
                    locale={locale}
                  />
                </PredicatePreview>
              )}
            </Section>

            <Section name={LocalizedString.lookup(tr('Failure conditions'), locale)} theme={theme}>
              <ConditionGoalsEditor
                theme={theme}
                locale={locale}
                title={LocalizedString.lookup(tr('Any triggers failure'), locale)}
                helpText={LocalizedString.lookup(
                  tr('Any one of these ends the run.'),
                  locale
                )}
                events={challenge.events}
                goals={this.failureGoals_}
                onChange={goals => {
                  this.failureGoals_ = goals;
                  this.applyConditions_();
                }}
              />
              {challenge.failure && (
                <PredicatePreview theme={theme}>
                  <PredicateEditor
                    predicate={challenge.failure}
                    events={challenge.events}
                    locale={locale}
                  />
                </PredicatePreview>
              )}
            </Section>
          </div>
        </ScrollArea>
      </Container>
    );
  }
}

const Connected = connect(
  (state: ReduxState, ownProps: CustomChallengeEditorPublicProps) => {
    const asyncChallenge = state.challenges[ownProps.challengeId];
    return {
      locale: state.i18n.locale,
      challenge: Async.latestValue(asyncChallenge),
      challengeAsyncType: asyncChallenge?.type,
    };
  },
  dispatch => ({ dispatch })
)(withNavigate(CustomChallengeEditor));

export default Connected as React.ComponentType<CustomChallengeEditorPublicProps>;
