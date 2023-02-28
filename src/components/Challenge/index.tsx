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
import { connect } from 'react-redux';

import { State as ReduxState } from '../../state';

import { ScenesAction } from '../../state/reducer';

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
import Script from '../../state/State/Scene/Script';
import { AsyncChallenge } from '../../state/State/Challenge';
import { AsyncChallengeCompletion } from '../../state/State/ChallengeCompletion';
import PredicateEditor from './PredicateEditor';

import tr from '@i18n';

export interface ChallengePublicProps extends StyleProps, ThemeProps {
  challenge: AsyncChallenge;
  challengeCompletion: AsyncChallengeCompletion;
}

interface ChallengePrivateProps {
  locale: LocalizedString.Language;
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

type UiState = (
  UiState.None
);

interface ChallengeState {
  collapsed: { [section: string]: boolean };
  modal: UiState;
}

type Props = ChallengePublicProps & ChallengePrivateProps;
type State = ChallengeState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  color: props.theme.color,
}));

const StyledSection = styled(Section, {
});

const StyledListSection = withStyleDeep(StyledSection, {
  padding: 0,
  overflow: 'hidden'
});

const StyledField = styled(Field, (props: ThemeProps) => ({

}));

const SectionIcon = styled(Fa, (props: ThemeProps) => ({
  marginLeft: `${props.theme.itemPadding}px`,
  paddingLeft: `${props.theme.itemPadding}px`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  opacity: 0.5,
  ':hover': {
    opacity: 1.0
  },
  transition: 'opacity 0.2s'
}));

class Challenge extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapsed: {},
      modal: UiState.NONE
    };
  }

  private onCollapsedChange_ = (section: string) => (collapsed: boolean) => {
    this.setState({
      collapsed: {
        ...this.state.collapsed,
        [section]: collapsed
      }
    });
  };

  private onModalClose_ = () => this.setState({ modal: UiState.NONE });

  render() {
    const { props, state } = this;
    const { style, className, theme, challenge, challengeCompletion, locale } = props;
    const { collapsed, modal } = state;


    const latestChallenge = Async.latestValue(challenge);
    if (!latestChallenge) return null;

    const latestChallengeCompletion = Async.latestValue(challengeCompletion);


    return (
      <>
        <ScrollArea theme={theme} style={{ flex: '1 1' }}>
          <Container theme={theme} style={style} className={className}>
            {latestChallenge.success && (
              <Section name={LocalizedString.lookup(tr('Success'), locale)} theme={theme}>
                <PredicateEditor
                  events={latestChallenge.events}
                  predicate={latestChallenge.success}
                  predicateCompletion={latestChallengeCompletion ? latestChallengeCompletion.success : undefined}
                  locale={locale}
                />
              </Section>
            )}
            {latestChallenge.failure && (
              <Section name={LocalizedString.lookup(tr('Failure'), locale)} theme={theme}>
                <PredicateEditor
                  events={latestChallenge.events}
                  predicate={latestChallenge.failure}
                  predicateCompletion={latestChallengeCompletion ? latestChallengeCompletion.failure : undefined}
                  locale={locale}
                />
              </Section>
            )}
          </Container>
        </ScrollArea>
      </>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(Challenge) as React.ComponentType<ChallengePublicProps>;