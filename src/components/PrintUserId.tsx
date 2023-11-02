import * as React from 'react';

import { connect } from 'react-redux';

import { State as ReduxState } from '../state';
import { UserAction } from '../state/reducer/user';
import { auth } from '../firebase/firebase';
export interface PrintUserIdProps {
  userId: string;
  setUserId: (userId?: string) => void;
  getUserId: () => void;
}



const PrintUserId = (props: PrintUserIdProps) => (
  <div>
    
    <button onClick={() => props.setUserId("1")}>Make the User ID "1"</button>
    <button onClick={() => props.setUserId(auth.currentUser.uid)}>Make the User ID from</button>
    <button onClick={() => props.getUserId()}>Get User ID</button>
    {props.userId}
  </div>
);

// connect(GETS: state => props, SETS: dispatch => props)

export default connect((state: ReduxState) => ({
  userId: state.user.userId,
}), dispatch => ({
  setUserId: (userId?: string) => dispatch(UserAction.setUserId(userId)),
  getUserId: () => dispatch(UserAction.getUserId()),
}))(PrintUserId);