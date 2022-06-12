import { RobotState } from "../../RobotState";

export namespace RobotStateAction {
  export interface SetRobotState {
    type: 'set-robot-state';
    robotState: RobotState;
  }

  export type SetRobotStateParams = Omit<SetRobotState, 'type'>;

  export const setRobotState = (params: SetRobotStateParams): SetRobotState => ({
    type: 'set-robot-state',
    ...params,
  });
}

export type RobotStateAction = (
  RobotStateAction.SetRobotState
);

export const reduceRobotState = (state: RobotState = RobotState.empty, action: RobotStateAction): RobotState => {
  switch (action.type) {
    case 'set-robot-state':
      return action.robotState;
    default:
      return state;
  }
};