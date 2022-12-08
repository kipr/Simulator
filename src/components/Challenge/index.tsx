import * as React from 'react';

import { styled, withStyleDeep } from 'styletron-react';
import { StyleProps } from '../../style';
import { Switch } from '../Switch';
import { Theme, ThemeProps } from '../theme';
import Field from '../Field';
import ScrollArea from '../ScrollArea';
import Section from '../Section';
import { Spacer } from '../common';
import { Angle, StyledText } from '../../util';
import { DropdownList, OptionDefinition } from '../DropdownList';

import EditableList from '../EditableList';
import { Fa } from '../Fa';
import NodeSettingsDialog, { NodeSettingsAcceptance } from './NodeSettingsDialog';
import { connect } from 'react-redux';

import { State as ReduxState } from '../../state';

import { ChallengesAction, ScenesAction } from '../../state/reducer';

import * as uuid from 'uuid';
import { ReferenceFrame, Rotation, Vector3 } from '../../unit-math';
import { Vector3 as RawVector3 } from '../../math';
import ComboBox from '../ComboBox';
import Node from '../../state/State/Scene/Node';
import Dict from '../../Dict';
import Geometry from '../../state/State/Scene/Geometry';

import { Button } from '../Button';
import { BarComponent } from '../Widget';
import { faGlobeAmericas, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import Scene, { AsyncScene } from '../../state/State/Scene';
import Async from '../../state/State/Async';
import LocalizedString from '../../util/LocalizedString';
import Event from '../../state/State/Challenge/Event';
import Expr from '../../state/State/Challenge/Expr';
import { AsyncChallenge } from '../../state/State/Challenge';

export interface ChallengePublicProps extends StyleProps, ThemeProps {
  challengeId: string;
}

interface ChallengePrivateProps {
  challenge: AsyncChallenge;

  onEventSet: (eventId: string, event: Event) => void;
  onEventRemove: (eventId: string) => void;
  onSuccessPredicateSet: (successPredicate?: Expr) => void;
  onFailurePredicateSet: (failurePredicate?: Expr) => void;
}

namespace UiState {
  export enum Type {
    None,
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };
}

type UiState = UiState.None;

interface WorldState {
  collapsed: { [section: string]: boolean };
  modal: UiState;
}

type Props = ChallengePublicProps & ChallengePrivateProps;
type State = WorldState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  color: props.theme.color,
}));

class Challenge_ extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapsed: {},
      modal: UiState.NONE
    };
  }

  render() {
    const { props, state } = this;
    const { style, className, theme, challenge } = props;
    const { collapsed, modal } = state;

    return (
      <>
        <ScrollArea theme={theme} style={{ flex: '1 1' }}>
          <Container theme={theme} style={style} className={className}>
            
          </Container>
        </ScrollArea>
      </>
    );
  }
}

export default connect<unknown, unknown, ChallengePublicProps, ReduxState>((state: ReduxState, { challengeId }) => {
  return {
    challenge: state.scenes[challengeId],
  };
}, (dispatch, { challengeId }: ChallengePublicProps) => ({
  onEventSet: (eventId: string, event: Event) => {
    dispatch(ChallengesAction.setEvent({ challengeId, eventId, event }));
  },
  onEventRemove: (eventId: string) => {
    dispatch(ChallengesAction.removeEvent({ challengeId, eventId }));
  },
  onSuccessPredicateSet: (successPredicate?: Expr) => {
    dispatch(ChallengesAction.setSuccessPredicate({ challengeId, successPredicate }));
  },
  onFailurePredicateSet: (failurePredicate?: Expr) => {
    dispatch(ChallengesAction.setFailurePredicate({ challengeId, failurePredicate }));
  },
}))(Challenge_) as React.ComponentType<Props>;