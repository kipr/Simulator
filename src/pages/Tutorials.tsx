import * as React from 'react';
import { DARK, ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { Card } from '../components/Card';
import MainMenu from '../components/MainMenu';
import { Vector2 } from '../math';
import resizeListener, { ResizeListener } from '../components/ResizeListener';
import IFrame from '../components/IFrame';
import { tutorialList } from './tutorialList';


export interface TutorialsProps extends StyleProps, ThemeProps {}

interface TutorialsState {
  selected: string;
  videoWidth: number;
  videoHeight: number;
}

type Props = TutorialsProps;
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
  height: (window.innerWidth < window.innerHeight * 0.89) ? '45vw' : '50vh',
  maxHeight: (window.innerWidth < window.innerHeight * 0.89) ? '50vh' : '45vw',
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
      videoWidth: 0,
      videoHeight: 0,
    };
  }

  private onSelect_ = (index: number) => {
    this.setState({
      selected: tutorialList[index].src,
    });
    console.log(this.state.selected);
  };

  render() {
    const { props, state } = this;
    const { style } = props;
    const theme = DARK;

    return (
      <Container style={style} theme={theme}>
        <MainMenu theme={theme}/>
        <TutorialsContainer style={style} theme={theme}>
          {
            (this.state.selected !== '') 
              ? (
                <VideoContainer theme={theme}>
                  <IFrame theme={theme} src={this.state.selected}/>
                </VideoContainer>
              ) : <></>
          }
          <CardContainer style={style} theme={theme}>
            {
              tutorialList.map((tutorial, index) => {
                return (
                  <Card
                    theme={theme}
                    title={tutorial.title}
                    description={tutorial.description}
                    src={tutorial.src}
                    backgroundImage={tutorial.backgroundImage}
                    backgroundColor={tutorial.backgroundColor}
                    backgroundPosition={tutorial.backgroundPosition}
                    backgroundSize={tutorial.backgroundSize}
                    hoverBackgroundSize={tutorial.hoverBackgroundSize}
                    onSelect={this.onSelect_}
                    index={index}
                    key={index}
                  />
                );
              })
            }
          </CardContainer>
        </TutorialsContainer>
        <div/>
      </Container>
    );
  }
}

export default Tutorials;