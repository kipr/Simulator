import { RobotState } from "../../RobotState";
import WorkerInstance from "../../WorkerInstance";

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
  export interface SetRobotSensorValues {
    type: 'set-robot-sensor-values';
    analogValues: RobotState.AnalogValues;
    digitalValues: RobotState.DigitalValues;
  }

  export type SetRobotSensorValuesParams = Omit<SetRobotSensorValues, 'type'>;

  export const setRobotSensorValues = (params: SetRobotSensorValuesParams): SetRobotSensorValues => ({
    type: 'set-robot-sensor-values',
    ...params,
  });

  export interface IncrementRobotMotorPositions {
    type: 'increment-robot-motor-positions';
    motorPositions: [number, number, number, number];
  }

  export type IncrementRobotMotorPositionsParams = Omit<IncrementRobotMotorPositions, 'type'>;

  export const incrementRobotMotorPositions = (params: IncrementRobotMotorPositionsParams): IncrementRobotMotorPositions => ({
    type: 'increment-robot-motor-positions',
    ...params,
  });
}

export type RobotStateAction = (
  RobotStateAction.SetRobotState |
  RobotStateAction.SetRobotSensorValues |
  RobotStateAction.IncrementRobotMotorPositions
);

export const reduceRobotState = (state: RobotState = RobotState.NIL, action: RobotStateAction): RobotState => {
  switch (action.type) {
    case 'set-robot-state':
      return action.robotState;
    case 'set-robot-sensor-values':
      // Update registers to keep them in sync with state changes
      WorkerInstance.setSensorValues(action.analogValues, action.digitalValues);
      return {
        ...state,
        analogValues: action.analogValues,
        digitalValues: action.digitalValues,
      };
    case 'increment-robot-motor-positions': {
      // Update registers to keep them in sync with state changes
      WorkerInstance.incrementMotorPositions(action.motorPositions);
      return {
        ...state,
        motorPositions: [
          state.motorPositions[0] + action.motorPositions[0],
          state.motorPositions[1] + action.motorPositions[1],
          state.motorPositions[2] + action.motorPositions[2],
          state.motorPositions[3] + action.motorPositions[3],
        ],
      };
    }
    default:
      return state;
  }
};