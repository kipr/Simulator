
import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TabBar } from '../Layout/TabBar';
import tr from '@i18n';
import { faPlus, faUser, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import { AsyncClassroom } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { useState } from 'react';

export interface AssignmentsViewPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  onAssignmentAction: (currentSelectedClassroom: AsyncClassroom, action: 'edit' | 'delete') => void;

}

export interface AssignmentsViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = AssignmentsViewPublicProps & AssignmentsViewPrivateProps;


const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: $theme.color,
  backgroundColor: $theme.backgroundColor,
  //minHeight: '100vh',
}));

const Button = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  //opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const AssignmentsListContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderColor: props.theme.borderColor,
  borderWidth: '4px',
  borderStyle: 'solid',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: '8px',
  margin: '8px',
  backgroundColor: 'lightpurple'
}));


const AssignmentsView = ({
  theme,
  locale,
  currentSelectedClassroom,
  onAssignmentAction,
}: Props) => {
  const [createAssignmentVisible, setCreateAssignmentVisible] = useState(false);
  return (
    <Container $theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', margin: '8px' }}>
        <Button theme={theme} onClick={() => onAssignmentAction(currentSelectedClassroom, 'edit')}>
          <FontAwesome icon={faPlus} style={{ marginRight: '8px' }} />
          {LocalizedString.lookup(tr('Create Assignment'), locale)}
        </Button>
      </div>

      <AssignmentsListContainer theme={theme} />

    </Container>
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
  }
}, (dispatch, ownProps) => ({

}))(AssignmentsView) as React.ComponentType<AssignmentsViewPublicProps>; 