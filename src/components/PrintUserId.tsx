import * as React from 'react';

import { connect } from 'react-redux';

import { State as ReduxState } from '../state';
import { UserAction } from 'state/reducer';

export interface PrintUserIdProps {
  userId: string;
  setUserId: (userId?: string) => void;
}

const PrintUserId = (props: PrintUserIdProps) => (
  <div>
    {props.userId}
    <button onClick={() => props.setUserId("1")}>Make the User ID "1"</button>
  </div>
);

// connect(GETS: state => props, SETS: dispatch => props)

export default connect((state: ReduxState) => ({
  userId: state.user.userId,
}), dispatch => ({
  setUserId: (userId?: string) => dispatch(UserAction.setUserId(userId)),
}))(PrintUserId);