import * as React from 'react';
import { Link } from 'react-router-dom';
import { ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import SignUp from './auth/SignUp';


export interface HomePageProps extends ThemeProps,StyleProps {}

interface HomePageState {}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '300px',
}));

type Props = HomePageProps;
type State = HomePageState;

class HomePage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private name = 'HomePage';

  render() {
    const { props, state } = this;
    const { className, style, theme } = props;
    return (
      <Container className={this.name} style={style} theme={theme}>
        <Link to='/sim'>Sim</Link>
        <SignUp style={style} theme={theme}/>
      </Container>
    );
  }
}

export default HomePage;