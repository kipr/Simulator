import * as React from 'react';
import { styled } from 'styletron-react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import LocalizedString from '../../util/LocalizedString';
import Dict from '../../util/objectOps/Dict';
import { StyleProps } from '../../util/style';
import PredicateCompletion from '../../state/State/ChallengeCompletion/PredicateCompletion';
import { Goal } from '../../state/State/Challenge';
import { FontAwesome } from '../FontAwesome';
import {
  oppositePlayAreaEventId,
  parsePlayAreaEventId,
} from '../../util/playAreaSuccessGoals';
import { isCustomCanPoseChallengeEventId } from '../../util/customChallengeGoals';

const Container = styled('div', {});

const Item = styled('div', {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '0.5em'
});

const Label = styled('div', {});

/** Base challenge event id from a goal row (strips optional Once latch suffix). */
function eventIdFromGoal_(goal: Goal): string {
  return goal.exprId.replace(/Once$/, '');
}

function exprStateTrue_(
  exprId: string,
  predicateCompletion: PredicateCompletion | undefined,
  type: 'success' | 'failure'
): boolean {
  if (!predicateCompletion) return false;
  if (predicateCompletion.exprStates[exprId] === true) return true;
  if (type === 'failure' && !exprId.endsWith('Once')) {
    return predicateCompletion.exprStates[`${exprId}Once`] === true;
  }
  return false;
}

function goalEventStateTrue_(goal: Goal, eventStates: Dict<boolean> | undefined): boolean {
  if (!eventStates) return false;
  const baseId = eventIdFromGoal_(goal);
  if (eventStates[baseId] === true) return true;
  if (eventStates[goal.exprId] === true) return true;
  return false;
}

function goalHighlighted_(
  goal: Goal,
  predicateCompletion: PredicateCompletion | undefined,
  eventStates: Dict<boolean> | undefined,
  type: 'success' | 'failure'
): boolean {
  const baseEventId = eventIdFromGoal_(goal);
  if (isCustomCanPoseChallengeEventId(baseEventId) && eventStates) {
    if (goalEventStateTrue_(goal, eventStates)) return true;
    if (exprStateTrue_(goal.exprId, predicateCompletion, type)) return true;
    return false;
  }

  const playAreaOnce =
    !!parsePlayAreaEventId(baseEventId) && goal.exprId.endsWith('Once');
  if (playAreaOnce) {
    if (exprStateTrue_(goal.exprId, predicateCompletion, type)) return true;
    if (type === 'success' && goalEventStateTrue_(goal, eventStates)) return true;
    return false;
  }
  if (exprStateTrue_(goal.exprId, predicateCompletion, type)) return true;
  if (type === 'success' && goalEventStateTrue_(goal, eventStates)) return true;
  if (type === 'failure' && goalEventStateTrue_(goal, eventStates)) return true;
  return false;
}

function oppositePlayAreaExprId_(goal: Goal): string | null {
  const eventId = goal.exprId.replace(/Once$/, '');
  const oppositeEventId = oppositePlayAreaEventId(eventId);
  if (!oppositeEventId) return null;
  return goal.exprId.endsWith('Once') ? `${oppositeEventId}Once` : oppositeEventId;
}

/** Play-area enter/leave (and item in/out) pairs share one zone — show at most one highlight. */
function playAreaGoalHighlighted_(
  goal: Goal,
  predicateCompletion: PredicateCompletion | undefined,
  eventStates: Dict<boolean> | undefined,
  otherPredicateCompletion: PredicateCompletion | undefined,
  type: 'success' | 'failure'
): boolean {
  if (!goalHighlighted_(goal, predicateCompletion, eventStates, type)) return false;
  if (!parsePlayAreaEventId(goal.exprId)) return true;

  const oppositeExprId = oppositePlayAreaExprId_(goal);
  if (!oppositeExprId) return true;

  const otherType = type === 'success' ? 'failure' : 'success';
  const baseEventId = eventIdFromGoal_(goal);
  if (type === 'success' && eventStates?.[baseEventId] === true) {
    return true;
  }
  if (type === 'success' && exprStateTrue_(oppositeExprId, otherPredicateCompletion, otherType)) {
    return false;
  }
  return true;
}

export interface GoalListProps extends StyleProps {
  goals: Goal[];
  predicateCompletion?: PredicateCompletion;
  /** Live challenge event flags (used when predicate exprStates lag scene scripts). */
  eventStates?: Dict<boolean>;
  /** Opposite predicate completion (success ↔ failure) for play-area mutual exclusion. */
  otherPredicateCompletion?: PredicateCompletion;
  locale: LocalizedString.Language;
  /**
   * success goals are highlighted green when true;
   * failure goals are highlighted red when true.
   */
  type: 'success' | 'failure';
}

const GoalList: React.FC<GoalListProps> = ({
  goals,
  predicateCompletion,
  eventStates,
  otherPredicateCompletion,
  locale,
  type,
  style,
  className
}) => (
  <Container style={style} className={className}>
    {goals.map(goal => {
      const highlighted = playAreaGoalHighlighted_(
        goal,
        predicateCompletion,
        eventStates,
        otherPredicateCompletion,
        type
      );
      const color = type === 'success' ? 'green' : 'red';
      return (
        <Item key={goal.exprId}>
          {highlighted && <FontAwesome icon={faCheck} style={{ color, marginRight: '0.5em' }} />}
          <Label style={highlighted ? { color } : undefined}>
            {LocalizedString.lookup(goal.name, locale)}
          </Label>
        </Item>
      );
    })}
  </Container>
);

export default GoalList;