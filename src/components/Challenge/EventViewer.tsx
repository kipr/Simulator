import { faCheck, faCross } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { styled } from 'styletron-react';
import Event from '../../state/State/Challenge/Event';
import { StyleProps } from '../../style';
import LocalizedString from '../../util/LocalizedString';
import { Spacer } from '../common';

const Container = styled('div', {
});

const NameContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const Name = styled('div', {
});

const Description = styled('div', {
  fontSize: '0.8em',
});

interface EventViewerProps extends StyleProps {
  event: Event;
  eventState?: boolean;
  locale: LocalizedString.Language;
}

const EventViewer: React.FC<EventViewerProps> = ({ event: { name, description }, eventState, style, className, locale }) => {
  return (
    <Container style={style} className={className}>
      <NameContainer>
        <Name>{LocalizedString.lookup(name, locale)}</Name>
        <Spacer />
        {eventState !== undefined && <FontAwesomeIcon icon={eventState ? faCheck : faCross} />}
      </NameContainer>
      {description && <Description>{LocalizedString.lookup(description, locale)}</Description>}
    </Container>
  );
};

export default EventViewer;