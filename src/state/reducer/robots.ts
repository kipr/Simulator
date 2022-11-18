import Robot from "../State/Robot";
import Async from "../State/Async";
import * as ROBOTS from '../../robots';
import { Robots } from '../State';

export namespace RobotsAction {
  export interface AddRobot {
    type: 'add-robot';
    id: string;
    robot: Robot;
  }

  export type AddRobotParams = Omit<AddRobot, 'type'>;

  export const addRobot = (params: AddRobotParams): AddRobot => ({
    type: 'add-robot',
    ...params
  });

  export interface RemoveRobot {
    type: 'remove-robot';
    id: string;
  }

  export type RemoveRobotParams = Omit<RemoveRobot, 'type'>;

  export const removeRobot = (params: RemoveRobotParams): RemoveRobot => ({
    type: 'remove-robot',
    ...params
  });

  export interface SetRobot {
    type: 'set-robot';
    id: string;
    robot: Robot;
  }

  export type SetRobotParams = Omit<SetRobot, 'type'>;

  export const setRobot = (params: SetRobotParams): SetRobot => ({
    type: 'set-robot',
    ...params
  });

  export interface SetRobotBatch {
    type: 'set-robot-batch';
    robotIds: {
      id: string;
      robot: Robot;
    }[];
  }

  export type SetRobotBatchParams = Omit<SetRobotBatch, 'type'>;

  export const setRobotBatch = (params: SetRobotBatchParams): SetRobotBatch => ({
    type: 'set-robot-batch',
    ...params
  });

  export interface LoadRobot {
    type: 'load-robot';
    id: string;
  }

  export type LoadRobotParams = Omit<LoadRobot, 'type'>;

  export const loadRobot = (params: LoadRobotParams): LoadRobot => ({
    type: 'load-robot',
    ...params
  });
}

export type RobotsAction = (
  RobotsAction.AddRobot |
  RobotsAction.RemoveRobot |
  RobotsAction.SetRobot |
  RobotsAction.SetRobotBatch |
  RobotsAction.LoadRobot
);

const DEFAULT_ROBOTS: Robots = {
  robots: {
    'demobot': Async.loaded({ value: ROBOTS.DEMOBOT }),
  },
};

export const reduceRobots = (state: Robots = DEFAULT_ROBOTS, action: RobotsAction): Robots => {
  switch (action.type) {
    case 'add-robot':
      return {
        ...state,
        robots: {
          ...state.robots,
          [action.id]: Async.loaded({ value: action.robot })
        }
      };
    case 'remove-robot': {
      const nextState: Robots = {
        ...state,
        robots: {
          ...state.robots,
        },
      };

      delete nextState.robots[action.id];

      return nextState;
    }
    case 'set-robot':
      return {
        ...state,
        robots: {
          ...state.robots,
          [action.id]: Async.loaded({ value: action.robot }),
        },
      };
    case 'set-robot-batch': {
      const nextState: Robots = {
        ...state,
        robots: {
          ...state.robots,
        },
      };

      for (const { id, robot } of action.robotIds) {
        nextState.robots[id] = Async.loaded({ value: robot });
      }

      return nextState;
    }
    case 'load-robot':
      return {
        ...state,
        robots: {
          ...state.robots,
          [action.id]: Async.loading({
            brief: Async.brief(state.robots[action.id])
          }),
        },
      };
    default:
      return state;
  }
};