import * as React from 'react';

import { connect } from 'react-redux';

import { State as ReduxState } from '../state';

export interface PrintUserIdProps {
  userId: string;
}

const PrintUserId = (props: PrintUserIdProps) => (
  <div>
    {props.userId}
  </div>
);

export default connect((state: ReduxState) => ({
  userId: state.user.userId,
}))(PrintUserId);