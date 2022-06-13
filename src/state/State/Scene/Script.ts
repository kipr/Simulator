namespace Script {
  interface Base {
    code: string;
  }

  export interface Timer extends Base {
    type: 'timer';
    frequency: number;
  }

  export type TimerParams = Omit<Timer, 'type'>;

  export const timer = (params: TimerParams): Timer => ({
    type: 'timer',
    ...params,
  });

  export interface Event extends Base {
    type: 'event';
    kind: Event.Kind;
  }

  export type EventParams = Omit<Event, 'type'>;

  export const event = (params: EventParams): Event => ({
    type: 'event',
    ...params,
  });

  export namespace Event {
    export type Kind = 'tick';
  }
}

type Script = Script.Timer | Script.Event;

export default Script;