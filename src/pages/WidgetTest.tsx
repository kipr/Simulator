import * as React from 'react';
import PredicateEditor from '../components/Challenge/PredicateEditor';
import HTree, { HTreeNode } from '../components/HTree';
import Dict from '../Dict';
import Event from '../state/State/Challenge/Event';
import Expr from '../state/State/Challenge/Expr';
import Predicate from '../state/State/Challenge/Predicate';
import PredicateCompletion from '../state/State/ChallengeCompletion/PredicateCompletion';
import LocalizedString from '../util/LocalizedString';

export interface WidgetTestProps {

}

const WidgetTest: React.FC<WidgetTestProps> = props => {

  const parent: HTreeNode = {
    component: () => <div>Parent</div>,
    props: {},
  };

  const predicate: Predicate = {
    exprs: {
      '1': {
        type: Expr.Type.And,
        argIds: ['2', '3'],
      },
      '2': {
        type: Expr.Type.Or,
        argIds: ['4', '5'],
      },
      '3': {
        type: Expr.Type.Xor,
        argIds: ['6', '7'],
      },
      '4': {
        type: Expr.Type.Event,
        eventId: '8',
      },
      '5': {
        type: Expr.Type.Event,
        eventId: '9',
      },
      '6': {
        type: Expr.Type.Event,
        eventId: '10',
      },
      '7': {
        type: Expr.Type.Event,
        eventId: '11',
      },
    },
    rootId: '1',
  };

  const events: Dict<Event> = {
    '8': {
      name: { [LocalizedString.EN_US]: 'Event 8' },
      description: { [LocalizedString.EN_US]: 'Event 8 description' },
    },
    '9': {
      name: { [LocalizedString.EN_US]: 'Event 9' },
      description: { [LocalizedString.EN_US]: 'Event 9 description' },
    },
    '10': {
      name: { [LocalizedString.EN_US]: 'Event 10' },
      description: { [LocalizedString.EN_US]: 'Event 10 description' },
    },
    '11': {
      name: { [LocalizedString.EN_US]: 'Event 11' },
      description: { [LocalizedString.EN_US]: 'Event 11 description' },
    },
  };

  const predicateCompletion: PredicateCompletion = {
    exprStates: {
      '6': true,
      '7': false,
    },
  };

  return (
    <PredicateEditor
      predicate={predicate}
      predicateCompletion={predicateCompletion}
      events={events}
    />
  );
};

export default WidgetTest;

