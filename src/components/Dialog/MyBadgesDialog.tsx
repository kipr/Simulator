import * as React from 'react';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { State as ReduxState } from '../../state';
import { I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { InterfaceMode } from 'ivygate/dist/src/types/interface';
import { default as IvygateClassroomType } from 'ivygate/dist/src/types/classroomTypes';
import { Challenges } from '../../state/State';
import { AsyncChallenge } from '../../state/State/Challenge';
import Async from 'state/State/Async';
import ScrollArea from '../../components/interface/ScrollArea';
import { CHALLENGE_BADGES, DOTTED_CHALLENGE_BADGES } from '../../components/constants/challenge-badges';

interface Score {
  name: LocalizedString; // Challenge name
  completed: boolean;
  score?: number;
  completionTime?: number;
}

export interface MyBadgesDialogPublicProps extends ThemeProps, StyleProps {
  locale: LocalizedString.Language;
  onClose: () => void;
  currentStudentDisplayName?: string;
  currentUserScores: Score[];
}

interface MyBadgesDialogPrivateProps {

}
interface ChallengeProps {
  challenges: Challenges;
}

interface MyBadgesDialogState {
  userName: string;
  errorMessage: string;
  showRepeatUserDialog: boolean;
  interfaceMode: InterfaceMode;
  IvygateClassroomType?: IvygateClassroomType | null;
}

type Props = MyBadgesDialogPublicProps & MyBadgesDialogPrivateProps & ChallengeProps;
type State = MyBadgesDialogState;


const BadgeIcon = styled('img', (props: ThemeProps) => ({
  height: '100%',
  width: '100%',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const BadgeIconGrey = styled('img', (props: ThemeProps) => ({
  height: '100%',
  width: '100%',
  position: 'absolute',
  filter: 'grayscale(100%) opacity(50%)',
  left: '50%',
  transform: 'translateX(-50%)',
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const Container = styled('div', (props: ThemeProps) => ({
  display: 'grid',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  alignContent: 'center',
  justifyItems: 'center',
  minWidth: '200px',
  minHeight: '60vh',
  rowGap: '15px',
  gridTemplateColumns: "repeat(3, 1fr)",
}));

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '500px',
  flex: '1 1',
}));

const BadgeContainer = styled('div', (props: ThemeProps) => ({
  width: '12em',
  aspectRatio: '1 / 1',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));


export class MyBadgesDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      userName: '',
      showRepeatUserDialog: false,
      errorMessage: '',
      interfaceMode: InterfaceMode.SIMPLE,

    }
  }



  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale, challenges, currentUserScores } = props;
    console.log("Rendering MyBadgesDialog with challenges:", challenges);
    return (
      <div>
        <Dialog
          theme={theme}
          name={LocalizedString.lookup(tr('My Badges'), locale)}
          onClose={onClose}
        >
          <StyledScrollArea theme={theme}>
            <Container theme={theme} style={style} className={className}>
              {Object.values(challenges).map((challenge: AsyncChallenge, index) => {
                const currentChallenge = Async.latestValue(challenge);
                return (
                  <BadgeContainer theme={theme} key={LocalizedString.lookup(currentChallenge.name, locale)}>
                    {currentUserScores.find(score => LocalizedString.lookup(score.name, locale) === currentChallenge.sceneId)?.completed ?
                      <BadgeIcon src={CHALLENGE_BADGES[index] as string} theme={theme} /> : currentUserScores.find(score => LocalizedString.lookup(score.name, locale) === currentChallenge.sceneId) ? <BadgeIconGrey src={CHALLENGE_BADGES[index] as string} theme={theme} /> : <BadgeIcon src={DOTTED_CHALLENGE_BADGES[index] as string} theme={theme} />}
                    {/* <BadgeIcon src={CHALLENGE_BADGES[index] as string} theme={theme} /> */}
                  </BadgeContainer>
                );
              })}
            </Container>

          </StyledScrollArea>

        </Dialog>

      </div>

    );
  }
}

export default connect(
  (state: ReduxState) => ({
    challenges: state.challenges,
  }),
  {
    onLocaleChange: (locale: LocalizedString.Language) =>
      I18nAction.setLocale({ locale })
  }
)(MyBadgesDialog);

