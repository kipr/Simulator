
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';


export interface DashboardProps extends ThemeProps,StyleProps {}

interface DashboardState {}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '300px',
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
    const { className, style, theme } = props;
    return (
      <Container className={this.name} style={style} theme={theme}>
        <h1>Dashboard</h1>
        <h2>By Tim Corbly</h2>
        <Link to='/sim'>Sim</Link>
      </Container>
    );
  }
}

export default Dashboard;