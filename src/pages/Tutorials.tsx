import * as React from 'react';
import { DARK, ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { Card } from '../components/Card';
import MainMenu from '../components/MainMenu';
import { Vector2 } from '../math';
import resizeListener, { ResizeListener } from '../components/ResizeListener';
import IFrame from '../components/IFrame';


export interface TutorialsProps extends StyleProps, ThemeProps {}

interface TutorialsState {
  selected: string;
  videoWidth: number;
  videoHeight: number;
}

type Props = TutorialsProps;
type State = TutorialsState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
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
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: (window.innerWidth < window.innerHeight * 0.89) ? '80vw' : '89vh',
  height: (window.innerWidth < window.innerHeight * 0.89) ? '45vw' : '50vh',
  padding: '20px',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const CardContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'center',
  paddingLeft: `${cardContainerPadding()}px`,
  paddingRight: `${cardContainerPadding()}px`,
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  height: '100vh',
}));

class Tutorials extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: '',
      videoWidth: 0,
      videoHeight: 0,
    };
  }

  render() {
    const { props, state } = this;
    const { style } = props;
    const theme = DARK;

    return (
      <Container style={style} theme={theme}>
        <MainMenu theme={theme}/>
        <VideoContainer theme={theme}>
          <IFrame theme={theme} src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"/>
        </VideoContainer>
        <CardContainer style={style} theme={theme}>
          <Card
            theme={theme}
            title={'Getting Started'}
            description={'Learn how to get started with the simulator'}
            backgroundImage={'url(../../static/Simulator-Robot-Closeup.png)'}
          />
          <Card 
            theme={theme}
            title={'Botball Academy'}
            description={'How to use the Botball Academy.'}
            backgroundColor={'#6c6ca1'}
            backgroundImage={'url(../../static/Laptop_Icon_Sunscreen.png)'}
          />
        </CardContainer>
      </Container>
    );
  }
}

export default Tutorials;