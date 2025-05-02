import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { DARK, ThemeProps } from '../components/constants/theme';
import { Card } from '../components/interface/Card';
import MainMenu from '../components/MainMenu';

import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { GetBrowserLang } from '../util/GetLang';

import { State as ReduxState } from '../state';
import tr from '@i18n';

interface Tutorial {
  title?: LocalizedString;
  description?: LocalizedString;
  src?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  hoverBackgroundSize?: string;
  index?: number;
}

const tutorialList: Tutorial[] = [
  {
    title: tr('Quick Start'),
    description: tr('Learn how to get started with the simulator'),
    backgroundColor: '#6c6ca1',
    backgroundImage: 'url(../../static/icons/Laptop_Icon_Sunscreen.png)',
    src: 'https://www.youtube.com/embed/oMK00txANhE',
  },
  {
    title: tr('Navigating in 3D'),
    description: tr('Learn the controls for navigating in 3D in the simulator'),
    backgroundImage: 'linear-gradient(#3b3c3c, transparent), url(../../static/example_images/Simulator_Full_View.png)',
    src: 'https://www.youtube.com/embed/yqNbwaZz8J0',
  },
  {
    title: tr('Robot Section'),
    description: tr('How to use the robot section'),
    backgroundImage: 'url(../../static/example_images/Simulator-Robot-Closeup.png)',
    src: 'https://www.youtube.com/embed/B464dO7G9w4',
  },
  {
    title: tr('World Section'),
    description: tr('Learn how to create and manipulate items and scene in the simulator'),
    backgroundImage: 'linear-gradient(#3b3c3c, transparent), url(../../static/example_images/Can_Ream.png)',
    src: 'https://www.youtube.com/embed/50hXUwy74fQ',
  },
  {
    title: tr('The Challenge System'),
    description: tr('Learn how to use the challenge system'),
    backgroundImage: 'url(../../static/example_images/Gold_Medal_Robot.png)',
    src: 'https://www.youtube.com/embed/HNKFXhdKPBY',
  }
];

export interface TutorialsPublicProps extends StyleProps, ThemeProps {
}

interface TutorialsPrivateProps {
  locale: LocalizedString.Language;
}

interface TutorialsState {
  selected: string;
}

type Props = TutorialsPublicProps & TutorialsPrivateProps;
type State = TutorialsState;

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100%',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const cardContainerPadding = () => {
  const windowWidth = window.innerWidth;

  const maxMargin = (windowWidth - (windowWidth * 0.9)) / 2;
  const minMargin = 40;

  return maxMargin > minMargin ? maxMargin : minMargin;
};

const VideoContainer = styled('div', (props: ThemeProps) => ({
  className: 'video-container',
  display: 'flex',
  flexGrow: 0,
  flexShrink: 0,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: (window.innerWidth < window.innerHeight * 0.89) ? '80vw' : '89vh',
  maxWidth: (window.innerWidth < window.innerHeight * 0.89) ? '89vh' : '80vw',
  minWidth: '426px',
  height: (window.innerWidth < window.innerHeight * 0.89) ? '45vw' : '50vh',
  maxHeight: (window.innerWidth < window.innerHeight * 0.89) ? '50vh' : '45vw',
  minHeight: '240px',
  padding: '20px',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const TutorialsContainer = styled("div", (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  width: '100vw',
  height: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
}));

const CardContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'center',
  alignContent: 'flex-start',
  paddingLeft: `${cardContainerPadding()}px`,
  paddingRight: `${cardContainerPadding()}px`,
  height: '100%',
  width: '100%',
  rowGap: '20px',
  flexGrow: 1,
  flexShrink: 1,
}));

class Tutorials extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: '',
    };
  }

  private onSelect_ = (index: number) => () => {
    // this.setState({
    //   selected: tutorialList[index].src,
    // });
    window.location.href = tutorialList[index].src;
  };

  render() {
    const { props, state } = this;
    const { style, locale } = props;
    const { selected } = state;
    const theme = DARK;

    return (
      <Container style={style} theme={theme}>
        <MainMenu theme={theme} />
        <TutorialsContainer style={style} theme={theme}>
          <CardContainer style={style} theme={theme}>
            {tutorialList.map((tutorial, index) => (
              <Card
                theme={theme}
                title={LocalizedString.lookup(tutorial.title, locale)}
                description={LocalizedString.lookup(tutorial.description, locale)}
                backgroundImage={tutorial.backgroundImage}
                backgroundColor={tutorial.backgroundColor}
                backgroundPosition={tutorial.backgroundPosition}
                backgroundSize={tutorial.backgroundSize}
                hoverBackgroundSize={tutorial.hoverBackgroundSize}
                onClick={this.onSelect_(index)}
                key={index}
              />
            ))}
          </CardContainer>
        </TutorialsContainer>
      </Container>
    );
  }
}

export default connect(() => ({
  locale: GetBrowserLang(),
}))(Tutorials) as React.ComponentType<TutorialsPublicProps>;
