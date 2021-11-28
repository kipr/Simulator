import * as React from 'react';
import { DARK, ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { Card } from '../components/Card';
import MainMenu from '../components/MainMenu';


export interface DashboardProps extends ThemeProps,StyleProps {}

interface DashboardState {}

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

const cardContainerMargin = () => {
  const windowWidth = window.innerWidth;

  const maxMargin = (windowWidth - (windowWidth * 0.8)) / 2;
  const minMargin = 40;

  return `${maxMargin > minMargin ? maxMargin : minMargin}px`;
};

const CardContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'center',
  paddingLeft: cardContainerMargin(),
  paddingRight: cardContainerMargin(),
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  height: '100vh',
}));

type Props = DashboardProps;
type State = DashboardState;

class Dashboard extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private name = 'Dashboard';

  render() {
    const { props, state } = this;
    const { style } = props;
    const theme = DARK;

    return (
      <Container style={style} theme={theme}>
        <MainMenu theme={theme}/>
        <CardContainer style={style} theme={theme}>
          <Card
            theme={theme}
            title={'Tutorials'}
            description={'Learn how to get started with the simulator'}
            link={'/tutorials'}
            backgroundColor={'#6c6ca1'}
            backgroundImage={'url(../../static/Laptop_Icon_Sunscreen.png)'}
          />
          <Card 
            theme={theme}
            title={'3D Simulator'}
            description={'A simulator for the Botball demobot.'}
            link={'/sim'}
            backgroundImage={'url(../../static/Simulator-Robot-Closeup.png)'}
            backgroundPosition={'center top'}
          />
          <Card
            theme={theme}
            title={'About'}
            description={'KIPR is a 501(c) 3 organization started to make the long-term educational benefits of robotics accessible to students.'}
            link={'https://www.kipr.org/kipr/about-kipr'}
            backgroundImage={'linear-gradient(#3b3c3c, transparent), url(../../static/Botguy-Picture-Small.png)'}
            backgroundColor={'#3b3c3c'}
            backgroundSize={'80%'}
            hoverBackgroundSize={'95%'}
          />
        </CardContainer>
      </Container>
    );
  }
}

export default Dashboard;