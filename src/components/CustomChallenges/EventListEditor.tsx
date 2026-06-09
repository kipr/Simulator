import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import Dict from '../../util/objectOps/Dict';
import Event from '../../state/State/Challenge/Event';
import LocalizedString from '../../util/LocalizedString';
import Input from '../interface/Input';
import TextArea from '../interface/TextArea';
import Field from '../interface/Field';
import { FontAwesome } from '../FontAwesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import tr from '@i18n';
import { sanitizeChallengeEventId } from '../../util/customChallengePredicates';

export interface EventListEditorProps extends ThemeProps {
  locale: LocalizedString.Language;
  events: Dict<Event>;
  onChange: (events: Dict<Event>) => void;
}

const Row = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const RowHeader = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const AddRow = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  alignItems: 'flex-end',
}));

const IconButton = styled('button', (props: ThemeProps) => ({
  background: 'transparent',
  border: 'none',
  color: props.theme.color,
  cursor: 'pointer',
  padding: `${props.theme.itemPadding}px`,
  ':hover': { opacity: 0.8 },
}));

const EventListEditor: React.FC<EventListEditorProps> = ({
  theme,
  locale,
  events,
  onChange,
}) => {
  const [newEventId, setNewEventId] = React.useState('');
  const [newEventName, setNewEventName] = React.useState('');

  const addEvent = () => {
    const id = sanitizeChallengeEventId(newEventId || newEventName);
    if (!id || events[id]) return;
    const label = newEventName.trim() || id;
    onChange({
      ...events,
      [id]: {
        name: { [LocalizedString.EN_US]: label },
        description: { [LocalizedString.EN_US]: label },
      },
    });
    setNewEventId('');
    setNewEventName('');
  };

  const updateEvent = (eventId: string, patch: Partial<Event>) => {
    onChange({
      ...events,
      [eventId]: { ...events[eventId], ...patch },
    });
  };

  const removeEvent = (eventId: string) => {
    const next = { ...events };
    delete next[eventId];
    onChange(next);
  };

  const entries = Object.entries(events);

  return (
    <div>
      {entries.length === 0 && (
        <p style={{ padding: theme.itemPadding * 2 }}>
          {LocalizedString.lookup(
            tr('Events your scene scripts can set with scene.setChallengeEventValue.'),
            locale
          )}
        </p>
      )}
      {entries.map(([eventId, event]) => (
        <Row key={eventId} theme={theme}>
          <RowHeader>
            <strong>{eventId}</strong>
            <IconButton theme={theme} type="button" onClick={() => removeEvent(eventId)}>
              <FontAwesome icon={faTrash} />
            </IconButton>
          </RowHeader>
          <Field name={LocalizedString.lookup(tr('Name'), locale)} theme={theme} long>
            <Input
              theme={theme}
              value={LocalizedString.lookup(event.name, LocalizedString.EN_US)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateEvent(eventId, {
                  name: { ...event.name, [LocalizedString.EN_US]: e.currentTarget.value },
                })
              }
            />
          </Field>
          <Field name={LocalizedString.lookup(tr('Description'), locale)} theme={theme} multiline>
            <TextArea
              theme={theme}
              value={LocalizedString.lookup(event.description, LocalizedString.EN_US)}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateEvent(eventId, {
                  description: {
                    ...event.description,
                    [LocalizedString.EN_US]: e.currentTarget.value,
                  },
                })
              }
            />
          </Field>
        </Row>
      ))}
      <AddRow theme={theme}>
        <Field name={LocalizedString.lookup(tr('Event id'), locale)} theme={theme}>
          <Input
            theme={theme}
            value={newEventId}
            placeholder="goalReached"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEventId(e.currentTarget.value)}
          />
        </Field>
        <Field name={LocalizedString.lookup(tr('Display name'), locale)} theme={theme} long>
          <Input
            theme={theme}
            value={newEventName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEventName(e.currentTarget.value)}
          />
        </Field>
        <IconButton theme={theme} type="button" onClick={addEvent}>
          <FontAwesome icon={faPlus} /> {LocalizedString.lookup(tr('Add event'), locale)}
        </IconButton>
      </AddRow>
    </div>
  );
};

export default EventListEditor;
