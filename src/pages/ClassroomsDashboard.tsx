import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { DARK, ThemeProps } from '../components/constants/theme';
import { Card } from '../components/interface/Card';
import MainMenu from '../components/MainMenu';
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import tr from '@i18n';
import { WithNavigateProps, withNavigate } from '../util/withNavigate';
import db from '../db';


export interface ClassroomsDashboardPublicProps extends ThemeProps, StyleProps {
}

interface ClassroomsDashboardPrivateProps {
  locale: LocalizedString.Language;
}

interface ClassroomsDashboardState {
  i18n: any;
  userId: string;
}

type Props = ClassroomsDashboardPublicProps & ClassroomsDashboardPrivateProps & WithNavigateProps;
type State = ClassroomsDashboardState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100vh',
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
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: '7em',
  paddingLeft: cardContainerMargin(),
  paddingRight: cardContainerMargin(),
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  minHeight: 'calc(100vh - 210px)',
  marginTop: '10em',
}));


class ClassroomsDashboard extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      userId: '',
      i18n: null,
    };
  }

  async componentDidMount() {
    await this.getCurrentUser();
  }
  private getCurrentUser = () => {
    let currentUser: {};
    const tokenManager = db.tokenManager;
    if (tokenManager) {
      const auth_ = tokenManager.auth();
      const currentUserAuth_ = auth_.currentUser;
      currentUser = { id: currentUserAuth_.uid };

      this.setState({ userId: currentUser['id'] });

    }

    return currentUser || null;
  };

  render() {
    const { props } = this;
    const { userId } = this.state;
    const { className, style, locale } = props;
    const theme = DARK;
    return (
      <Container className={className} style={style} theme={theme}>
        <MainMenu theme={theme} />
        <CardContainer theme={theme}>
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('Student View'), locale)}
            description={LocalizedString.lookup(tr('See the classroom you are in.'), locale)}
            backgroundColor={'#6c6ca1'}
            backgroundImage={'url(../../static/icons/Laptop_Icon_Sunscreen.png)'}
            onClick={() => this.props.navigate(`/classrooms/${userId}/studentView`)}

          />
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('Teacher View'), locale)}
            description={LocalizedString.lookup(tr('See and manage all the classrooms you own.'), locale)}
            backgroundImage={'url(../../static/example_images/Simulator-Robot-Closeup.png)'}
            backgroundPosition={'center top'}
            onClick={() => this.props.navigate(`/classrooms/${userId}/teacherView`)}
          />
        </CardContainer>
      </Container>
    );
  }
}

const Connected = connect((state: State) => ({
  locale: state.i18n.locale,
}))(withNavigate(ClassroomsDashboard));

export default Connected as React.ComponentType<ClassroomsDashboardPublicProps>;
