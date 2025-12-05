import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../util/style';
import { FontAwesome } from './FontAwesome';
import { ThemeProps } from './constants/theme';
import { faUsersRectangle, faPersonWalkingDashedLineArrowRight, faPersonChalkboard } from '@fortawesome/free-solid-svg-icons';
import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../state';
import LocalizedString from '../util/LocalizedString';
import { AsyncClassroom } from '../state/State/Classroom';
import Async from 'state/State/Async';

export interface ClassroomExtraMenuPublicProps extends StyleProps, ThemeProps {
  onLeaveClass?: (event: React.MouseEvent) => void;
}

interface ClassroomExtraMenuPrivateProps {
  locale: LocalizedString.Language;
  currentStudentClassroom: AsyncClassroom | null;
}

interface ClassroomExtraMenuState {

}

type Props = ClassroomExtraMenuPublicProps & ClassroomExtraMenuPrivateProps;
type State = ClassroomExtraMenuState;

const Container = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  top: '100%',
  right: `0px`,
  minWidth: 'fit-content',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,

  display: 'flex',
  flexDirection: 'column',
  borderBottomLeftRadius: `${props.theme.borderRadius}px`,
  borderBottomRightRadius: `${props.theme.borderRadius}px`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  borderBottom: `1px solid ${props.theme.borderColor}`
}));

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

const Item = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': !props.disabled && props.onClick ? {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : {
    cursor: 'auto',
  },
  whiteSpace: 'nowrap',

  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const ItemLabel = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  width: 'auto',
  whiteSpace: 'nowrap',

  padding: '10px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  fontWeight: 400,
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));



const ItemIcon = styled(FontAwesome, {
  width: '20px',
  minWidth: '20px',
  maxWidth: '20px',
  textAlign: 'center',
  marginRight: '10px'
});

class ClassroomExtraMenu extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const {
      className,
      style,
      theme,
      locale,
      onLeaveClass
    } = props;

    const latestClassroom = Async.latestValue(props.currentStudentClassroom);
    return (
      <Container theme={theme} style={style} className={className}>
        <ItemLabel theme={theme}><ItemIcon icon={faUsersRectangle} /> {LocalizedString.lookup(tr(`Current Classroom: ${latestClassroom?.classroomId || 'None'}`), locale)}</ItemLabel>
        <ItemLabel theme={theme}><ItemIcon icon={faPersonChalkboard} /> {LocalizedString.lookup(tr(`Classroom Teacher: ${latestClassroom?.teacherDisplayName || 'None'}`), locale)}</ItemLabel>
        {latestClassroom ? (<Item theme={theme} onClick={onLeaveClass}><ItemIcon icon={faPersonWalkingDashedLineArrowRight} /> {LocalizedString.lookup(tr(`Leave Classroom`), locale)}</Item>) : null}
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
  currentStudentClassroom: state.classrooms.currentStudentClassroom,
}))(ClassroomExtraMenu) as React.ComponentType<ClassroomExtraMenuPublicProps>;