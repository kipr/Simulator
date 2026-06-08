import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import Dict from '../../util/objectOps/Dict';
import Event from '../../state/State/Challenge/Event';
import LocalizedString from '../../util/LocalizedString';
import Input from '../interface/Input';
import Field from '../interface/Field';
import { FontAwesome } from '../FontAwesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import tr from '@i18n';
import { ConditionGoalInput } from '../../util/customChallengePredicates';

export interface ConditionGoalsEditorProps extends ThemeProps {
  locale: LocalizedString.Language;
  title: string;
  helpText: string;
  events: Dict<Event>;
  goals: ConditionGoalInput[];
  onChange: (goals: ConditionGoalInput[]) => void;
}

const Row = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: `${props.theme.itemPadding}px`,
  alignItems: 'flex-end',
  padding: `${props.theme.itemPadding}px 0`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const IconButton = styled('button', (props: ThemeProps) => ({
  background: 'transparent',
  border: 'none',
  color: props.theme.color,
  cursor: 'pointer',
  padding: `${props.theme.itemPadding}px`,
}));

const ConditionGoalsEditor: React.FC<ConditionGoalsEditorProps> = ({
  theme,
  locale,
  title,
  helpText,
  events,
  goals,
  onChange,
}) => {
  const eventIds = Object.keys(events);

  const addGoal = () => {
    const eventId = eventIds[0];
    if (!eventId) return;
    const event = events[eventId];
    onChange([
      ...goals,
      {
        eventId,
        label: LocalizedString.lookup(event.name, LocalizedString.EN_US),
        latchOnce: true,
      },
    ]);
  };

  const updateGoal = (index: number, patch: Partial<ConditionGoalInput>) => {
    const next = [...goals];
    next[index] = { ...next[index], ...patch };
    if (patch.eventId && events[patch.eventId]) {
      const current = next[index];
      if (!current.label || goals[index].eventId !== patch.eventId) {
        current.label = LocalizedString.lookup(
          events[patch.eventId].name,
          LocalizedString.EN_US
        );
      }
    }
    onChange(next);
  };

  const removeGoal = (index: number) => {
    onChange(goals.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>{title}</h3>
      <p style={{ opacity: 0.85, marginBottom: theme.itemPadding * 2 }}>{helpText}</p>
      {goals.map((goal, index) => (
        <Row key={`${goal.eventId}-${index}`} theme={theme}>
          <Field name={LocalizedString.lookup(tr('Event'), locale)} theme={theme}>
            <select
              value={goal.eventId}
              onChange={e => updateGoal(index, { eventId: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            >
              {eventIds.map(id => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </Field>
          <Field name={LocalizedString.lookup(tr('Goal label'), locale)} theme={theme} long>
            <Input
              theme={theme}
              value={goal.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateGoal(index, { label: e.currentTarget.value })
              }
            />
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={goal.latchOnce !== false}
              onChange={e => updateGoal(index, { latchOnce: e.target.checked })}
            />
            {LocalizedString.lookup(tr('Latch (Once)'), locale)}
          </label>
          <IconButton theme={theme} type="button" onClick={() => removeGoal(index)}>
            <FontAwesome icon={faTrash} />
          </IconButton>
        </Row>
      ))}
      <IconButton
        theme={theme}
        type="button"
        onClick={addGoal}
        disabled={eventIds.length === 0}
        style={{ marginTop: theme.itemPadding * 2, opacity: eventIds.length === 0 ? 0.5 : 1 }}
      >
        <FontAwesome icon={faPlus} /> {LocalizedString.lookup(tr('Add condition'), locale)}
      </IconButton>
    </div>
  );
};

export default ConditionGoalsEditor;
