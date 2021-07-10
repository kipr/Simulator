export namespace SimulatorState {
  export enum Type {
    Stopped,
    Compiling,
    Running,
  }

  export interface Stopped {
    type: Type.Stopped;
  }

  export const STOPPED: Stopped = { type: Type.Stopped };

  export interface Compiling {
    type: Type.Compiling;
  }

  export const COMPILING: Compiling = { type: Type.Compiling };

  export interface Running {
    type: Type.Running;
  }

  export const RUNNING: Running = { type: Type.Running };

  export const isStopped = (simulatorState: SimulatorState) => simulatorState.type === Type.Stopped;
  export const isCompiling = (simulatorState: SimulatorState) => simulatorState.type === Type.Compiling;
  export const isRunning = (simulatorState: SimulatorState) => simulatorState.type === Type.Running;
}

export type SimulatorState = (
  SimulatorState.Stopped |
  SimulatorState.Compiling |
  SimulatorState.Running
);