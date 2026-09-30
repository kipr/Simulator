import * as React from 'react';

import { styled, withStyleDeep } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { ThemeProps } from '../constants/theme';
import Field from '../interface/Field';
import ScrollArea from '../interface/ScrollArea';
import Section from '../interface/Section';

import { FontAwesome } from '../FontAwesome';
import { connect } from 'react-redux';

import { State as ReduxState } from '../../state';

import Async from '../../state/State/Async';
import Dict from '../../util/objectOps/Dict';
import LocalizedString from '../../util/LocalizedString';
import { AsyncChallenge } from '../../state/State/Challenge';
import { AsyncChallengeCompletion } from '../../state/State/ChallengeCompletion';
import PredicateCompletion from '../../state/State/ChallengeCompletion/PredicateCompletion';
import PredicateEditor from './PredicateEditor';
import GoalList from './GoalList';

import tr from '@i18n';
import Editor from '../Editor/Editor';
import { TabBar } from '../Layout/TabBar';
import ProgrammingLanguage from '../../programming/compiler/ProgrammingLanguage';
import { latest } from 'immer/dist/internal';
import { faExpand } from '@fortawesome/free-solid-svg-icons';

export interface ChallengePublicProps extends StyleProps, ThemeProps {
  challenge: AsyncChallenge;
  challengeCompletion: AsyncChallengeCompletion;
  /** Scene event flags updated synchronously from the sim loop (see ChallengeRoot). */
  liveEventStates?: Dict<boolean>;
  liveSuccessCompletion?: PredicateCompletion;
  liveFailureCompletion?: PredicateCompletion;
  gradeView?: boolean;

  onExpandCode?: (editor: React.JSX.Element) => void;
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
  index: number;
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

const SectionIcon = styled(FontAwesome, (props: ThemeProps) => ({
  marginLeft: `${props.theme.itemPadding}px`,
  paddingLeft: `${props.theme.itemPadding}px`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  opacity: 0.5,
  ':hover': {
    opacity: 1.0
  },
  transition: 'opacity 0.2s'
}));

const GradeViewContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: '1 1',
  color: props.theme.color,
  padding: `${props.theme.itemPadding * 2}px`,
}));

const GradeEditorContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  backgroundColor: 'pink',
  overflow: 'hidden',
  // maxHeight: '5em',
  // minHeight: '15em'
}));

const StyledTabBar = styled(TabBar, ({ theme }: ThemeProps) => ({
  flex: 1,
  borderTopLeftRadius: `${theme.itemPadding * 2}px`,
  borderTopRightRadius: `${theme.itemPadding * 2}px`,
  borderTop: `1px solid ${theme.borderColor}`,
  borderLeft: `1px solid ${theme.borderColor}`,
  borderRight: `1px solid ${theme.borderColor}`,
  backgroundColor: theme.backgroundColor,
  ':last-child': {
    marginRight: `${theme.itemPadding * 2}px`,
  },
  maxHeight: '2em'

}));

const Icon = styled(FontAwesome, {
  position: 'relative',
  left: '8.7em',
  bottom: '1.2em',
  zIndex: 10,
  transform: 'translateY(-50%)',
  paddingRight: "5px",
  height: "1.5em",
  ':hover': {
    cursor: 'pointer',
  },
});
class Challenge extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapsed: {},
      modal: UiState.NONE,
      index: 0
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

  private onIndexChange_ = (index: number) => {
    this.setState({ index });
  };
  render() {
    const { props, state } = this;
    const {
      style,
      className,
      theme,
      challenge,
      challengeCompletion,
      liveEventStates,
      liveSuccessCompletion,
      liveFailureCompletion,
      locale,
      gradeView
    } = props;
    const { collapsed, modal } = state;


    const latestChallenge = Async.latestValue(challenge);
    if (!latestChallenge) return null;

    const latestChallengeCompletion = Async.latestValue(challengeCompletion);

    const goalEventStates: Dict<boolean> = {
      ...(latestChallengeCompletion?.eventStates ?? {}),
      ...(liveEventStates ?? {}),
    };

    const successCompletion =
      liveSuccessCompletion ?? latestChallengeCompletion?.success;
    const failureCompletion =
      liveFailureCompletion ?? latestChallengeCompletion?.failure;

    const sectionComponent = (

      <Section name={LocalizedString.lookup(tr('Success'), locale)} theme={theme}
        style={{ ...style, maxWidth: '100%' }}>
        <GoalList
          goals={latestChallenge.successGoals}
          predicateCompletion={successCompletion}
          eventStates={goalEventStates}
          otherPredicateCompletion={failureCompletion}
          locale={locale}
          type="success"
        />
        {latestChallengeCompletion?.success?.exprStates?.completion &&
          latestChallengeCompletion.completedAt && (
          <div style={{ fontSize: '0.85em', padding: '0.35em 0 0 0.25em', opacity: 0.9 }}>
            {LocalizedString.lookup(tr('Completed at'), locale)}:{' '}
            {new Date(latestChallengeCompletion.completedAt).toLocaleString(locale)}
          </div>
        )}
      </Section>

    );
    const renderGradeView = () => {
      const languageTabs: TabBar.TabDescription[] = [
        {
          name: LocalizedString.lookup(tr('C'), locale),
          icon: 'code',
        },
        {
          name: LocalizedString.lookup(tr('C++'), locale),
          icon: 'code',
        },
        {
          name: LocalizedString.lookup(tr('Python'), locale),
          icon: 'code',
        },
        {
          name: LocalizedString.lookup(tr('Graphical'), locale),
          icon: 'code',
        }
      ];


      const names = ProgrammingLanguage.ProgammingNames;
      const language = Object.keys(names)[state.index] as ProgrammingLanguage;
      const ivygateEditor = (
        <Editor
          language={language}
          code={latestChallengeCompletion?.code[language] ?? ''}
          onCodeChange={null}
          autocomplete={false}
          editable={false}
          theme={theme} />
      );



      return (
        <GradeViewContainer theme={theme}>
          <div style={{ width: '50%' }}>
            {sectionComponent}
          </div>
          <div style={{ display: 'flex', minHeight: '15em', flexDirection: 'column', flex: '1 1', borderRadius: '4px', overflow: 'hidden' }}>
            <StyledTabBar
              theme={theme}
              tabs={languageTabs}
              index={this.state.index}
              onIndexChange={this.onIndexChange_}
              tourRegistry={undefined}>

            </StyledTabBar>
            <GradeEditorContainer theme={theme}>
              {ivygateEditor}

            </GradeEditorContainer>
            <Icon icon={faExpand} onClick={() => this.props.onExpandCode(ivygateEditor)} />
          </div>

        </GradeViewContainer>
      );
    };

    const renderDefaultView = () => {
      return (sectionComponent);
    };
    const content = gradeView ? renderGradeView() : renderDefaultView();
    return (
      <>
        <ScrollArea theme={theme} horizontalScroll={gradeView ? false : null} innerStyle={gradeView ? { maxWidth: '100%', position: 'relative' } : undefined} style={{ flex: '0 0 auto', maxWidth: '100%' }}>
          <Container theme={theme} style={style} className={className}>
            {latestChallenge.successGoals && latestChallenge.successGoals.length > 0 && (
              content
            )}
            {latestChallenge.failureGoals && latestChallenge.failureGoals.length > 0 && (
              <Section name={LocalizedString.lookup(tr('Failure'), locale)} theme={theme}>
                <GoalList
                  goals={latestChallenge.failureGoals}
                  predicateCompletion={failureCompletion}
                  eventStates={goalEventStates}
                  otherPredicateCompletion={successCompletion}
                  locale={locale}
                  type="failure"
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