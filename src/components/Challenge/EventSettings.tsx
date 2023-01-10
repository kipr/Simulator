import * as React from "react";
import { styled } from "styletron-react";

import Field from "../Field";
import { ThemeProps } from "../theme";
import ValueEdit from "../ValueEdit";
import Event from '../../state/State/Challenge/Event';
import LocalizedString from '../../util/LocalizedString';
import Input from '../Input';
import TextArea from '../TextArea';

export interface EventSettingsProps extends ThemeProps {
  onEventChange: (event: Event) => void;
  event: Event;
}

const StyledField = styled(Field, (props: ThemeProps) => ({
  width: '100%',
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const StyledValueEdit = styled(ValueEdit, (props: ThemeProps) => ({
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
}));

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  paddingTop: `${props.theme.itemPadding * 2}px`,
  
}));

const EventSettings: React.FC<EventSettingsProps> = ({ event, onEventChange, theme }) => {
  const onNameChange = (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    onEventChange({
      ...event,
      name: { ...event.name, [LocalizedString.EN_US]: inputEvent.currentTarget.value }
    });
  };
  
  const onDescriptionChange = (inputEvent: React.ChangeEvent<HTMLTextAreaElement>) => {
    onEventChange({
      ...event,
      description: { ...event.description, [LocalizedString.EN_US]: inputEvent.currentTarget.value }
    });
  };

  return (
    <Container theme={theme}>
      <StyledField name='Name' theme={theme} long>
        <Input
          theme={theme}
          type='text'
          value={LocalizedString.lookup(event.name, LocalizedString.EN_US)}
          onChange={onNameChange}
        />
      </StyledField>
      <StyledField name='Description' theme={theme} multiline>
        <TextArea
          theme={theme}
          value={LocalizedString.lookup(event.description, LocalizedString.EN_US)}
          onChange={onDescriptionChange}
        />
      </StyledField>
    </Container>
  );
};

export default EventSettings;