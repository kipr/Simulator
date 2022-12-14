import * as React from 'react';
import Event from '../../state/State/Challenge/Event';
import { Dialog } from '../Dialog';
import { ThemeProps } from '../theme';
import EventSettings from './EventSettings';

export interface EventSettingsDialogProps extends ThemeProps {
  event: Event;

  onChange: (event: Event) => void;
  onClose: () => void;
}

const EventSettingsDialog: React.FC<EventSettingsDialogProps> = ({ theme, onChange, onClose, event }) => {
  return (
    <Dialog name='Event Settings' theme={theme} onClose={onClose}>
      <EventSettings theme={theme} event={event} onEventChange={onChange} />
    </Dialog>
  );
};

export default EventSettingsDialog;