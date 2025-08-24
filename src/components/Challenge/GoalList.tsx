import * as React from 'react';
import { styled } from 'styletron-react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import LocalizedString from '../../util/LocalizedString';
import { StyleProps } from '../../util/style';
import PredicateCompletion from '../../state/State/ChallengeCompletion/PredicateCompletion';
import { Goal } from '../../state/State/Challenge';
import { FontAwesome } from '../FontAwesome';

const Container = styled('div', {});

const Item = styled('div', {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '0.5em'
});

const Label = styled('div', {});

export interface GoalListProps extends StyleProps {
  goals: Goal[];
  predicateCompletion?: PredicateCompletion;
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
  locale,
  type,
  style,
  className
}) => (
  <Container style={style} className={className}>
    {goals.map(goal => {
      const state = predicateCompletion ? predicateCompletion.exprStates[goal.exprId] : undefined;
      const color = type === 'success' ? 'green' : 'red';
      return (
        <Item key={goal.exprId}>
          {state === true && <FontAwesome icon={faCheck} style={{ color, marginRight: '0.5em' }} />}
          <Label style={state === true ? { color } : undefined}>
            {LocalizedString.lookup(goal.name, locale)}
          </Label>
        </Item>
      );
    })}
  </Container>
);

export default GoalList;