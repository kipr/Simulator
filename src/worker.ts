import Protocol from './WorkerProtocol';
import dynRequire from './require';
import SharedRegisters from './SharedRegisters';
import Registers from './RegisterState';
import python from './python';
import SharedRingBufferUtf32 from './SharedRingBufferUtf32';
import Instance, { DispatchContext, InstanceError } from 'itch/src/Instance';
import control from 'itch/src/module/control';
import data from 'itch/src/module/data';
import operator from 'itch/src/module/operator';

import { DOMParser } from 'xmldom';
import { toNumber } from 'itch/src/util';

const resolveNumber = (ctx: DispatchContext, name: string) => toNumber(ctx.resolveValue(name));

const motor = (rt: any) => ({
  motor: (ctx: DispatchContext) => {
    rt._motor(
      toNumber(ctx.resolveValue('MOTOR')),
      toNumber(ctx.resolveValue('PERCENT'))
    );
  },
  fd: (ctx: DispatchContext) => rt._fd(resolveNumber(ctx, 'MOTOR')),
  bk: (ctx: DispatchContext) => rt._bk(resolveNumber(ctx, 'MOTOR')),
  off: (ctx: DispatchContext) => rt._off(resolveNumber(ctx, 'MOTOR')),
  ao: (ctx: DispatchContext) => rt._ao(),
  alloff: (ctx: DispatchContext) => rt._alloff(),
  gmpc: (ctx: DispatchContext) => rt._gmpc(resolveNumber(ctx, 'MOTOR')),
  get_motor_position_counter: (ctx: DispatchContext) => rt._get_motor_position_counter(
    resolveNumber(ctx, 'MOTOR')
  ),
  freeze: (ctx: DispatchContext) => rt._freeze(resolveNumber(ctx, 'MOTOR')),
  cmpc: (ctx: DispatchContext) => rt._cmpc(
    resolveNumber(ctx, 'MOTOR')
  ),
  clear_motor_position_counter: (ctx: DispatchContext) => rt._clear_motor_position_counter(
    resolveNumber(ctx, 'MOTOR')
  ),
  mav: (ctx: DispatchContext) => rt._mav(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'VELOCITY')
  ),
  move_at_velocity: (ctx: DispatchContext) => rt._move_at_velocity(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'VELOCITY')
  ),
  mtp: (ctx: DispatchContext) => rt._mtp(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'SPEED'),
    resolveNumber(ctx, 'GOAL_POS')
  ),
  move_to_position: (ctx: DispatchContext) => rt._move_to_position(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'SPEED'),
    resolveNumber(ctx, 'GOAL_POS')
  ),
  mrp: (ctx: DispatchContext) => rt._mrp(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'SPEED'),
    resolveNumber(ctx, 'DELTA_POS')
  ),
  move_relative_position: (ctx: DispatchContext) => rt._move_relative_position(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'SPEED'),
    resolveNumber(ctx, 'DELTA_POS')
  ),
  get_motor_done: (ctx: DispatchContext) => rt._get_motor_done(
    resolveNumber(ctx, 'MOTOR')
  ),
  block_motor_done: (ctx: DispatchContext) => rt._block_motor_done(
    resolveNumber(ctx, 'MOTOR')
  ),
  bmd: (ctx: DispatchContext) => rt._bmd(
    resolveNumber(ctx, 'MOTOR')
  ),
  setpwm: (ctx: DispatchContext) => rt._setpwm(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'PERCENT')
  ),
  getpwm: (ctx: DispatchContext) => rt._getpwm(
    resolveNumber(ctx, 'MOTOR')
  ),
  baasbennaguui: (ctx: DispatchContext) => rt._baasbennaguui(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'PERCENT')
  ),
  motor_power: (ctx: DispatchContext) => rt._motor_power(
    resolveNumber(ctx, 'MOTOR'),
    resolveNumber(ctx, 'PERCENT')
  ),
});

const time = (rt: any) => ({
  msleep: (ctx: DispatchContext) => rt._msleep(
    resolveNumber(ctx, 'MSECS')
  ),
  systime: (ctx: DispatchContext) => rt._systime(),
  seconds: (ctx: DispatchContext) => rt._seconds(),
});

const wait_for = (rt: any) => ({
  wait_for_milliseconds: (ctx: DispatchContext) => rt._wait_for_milliseconds(
    resolveNumber(ctx, 'MSECS')
  ),
  wait_for_touch: (ctx: DispatchContext) => rt._wait_for_touch(
    resolveNumber(ctx, 'PORT')
  ),
});

const servo = (rt: any) => ({
  enable_servos: (ctx: DispatchContext) => rt._enable_servos(),
  disable_servos: (ctx: DispatchContext) => rt._disable_servos(),
  enable_servo: (ctx: DispatchContext) => rt._enable_servo(resolveNumber(ctx, 'PORT')),
  disable_servo: (ctx: DispatchContext) => rt._disable_servo(resolveNumber(ctx, 'PORT')),
  set_servo_position: (ctx: DispatchContext) => rt._set_servo_position(
    resolveNumber(ctx, 'PORT'),
    resolveNumber(ctx, 'POSITION')
  ),
  get_servo_position: (ctx: DispatchContext) => rt._get_servo_position(
    resolveNumber(ctx, 'PORT')
  ),
  get_servo_enabled: (ctx: DispatchContext) => rt._get_servo_enabled(
    resolveNumber(ctx, 'PORT')
  ),
  set_servo_enabled: (ctx: DispatchContext) => rt._set_servo_enabled(
    resolveNumber(ctx, 'PORT'),
    resolveNumber(ctx, 'ENABLED')
  ),
});

const analog = (rt: any) => ({
  analog: (ctx: DispatchContext) => rt._analog(resolveNumber(ctx, 'PORT')),
  analog8: (ctx: DispatchContext) => rt._analog8(resolveNumber(ctx, 'PORT')),
  analog10: (ctx: DispatchContext) => rt._analog10(resolveNumber(ctx, 'PORT')),
  analog12: (ctx: DispatchContext) => rt._analog12(resolveNumber(ctx, 'PORT')),
  analog_et: (ctx: DispatchContext) => rt._analog_et(resolveNumber(ctx, 'PORT')),
  set_analog_pullup: (ctx: DispatchContext) => rt._set_analog_pullup(
    resolveNumber(ctx, 'PORT'),
    resolveNumber(ctx, 'PULLUP')
  ),
  get_analog_pullup: (ctx: DispatchContext) => rt._get_analog_pullup(
    resolveNumber(ctx, 'PORT')
  ),
});

const digital = (rt: any) => ({
  digital: (ctx: DispatchContext) => rt._digital(resolveNumber(ctx, 'PORT')),
  set_digital_pullup: (ctx: DispatchContext) => rt._set_digital_pullup(
    resolveNumber(ctx, 'PORT'),
    resolveNumber(ctx, 'PULLUP')
  ),
  get_digital_pullup: (ctx: DispatchContext) => rt._get_digital_pullup(
    resolveNumber(ctx, 'PORT')
  ),
  set_digital_output: (ctx: DispatchContext) => rt._set_digital_output(
    resolveNumber(ctx, 'PORT'),
    resolveNumber(ctx, 'OUT')
  ),
  get_digital_output: (ctx: DispatchContext) => rt._get_digital_output(
    resolveNumber(ctx, 'PORT')
  ),
  set_digital_value: (ctx: DispatchContext) => rt._set_digital_value(
    resolveNumber(ctx, 'PORT'),
    resolveNumber(ctx, 'VALUE')
  ),
  get_digital_value: (ctx: DispatchContext) => rt._get_digital_value(
    resolveNumber(ctx, 'PORT')
  ),
});

// Proper typing of Worker is tricky due to conflicting DOM and WebWorker types
// See GitHub issue: https://github.com/microsoft/TypeScript/issues/20595
const ctx: Worker = self as unknown as Worker;

let sharedRegister_: SharedRegisters;
let sharedConsole_: SharedRingBufferUtf32;

const print = (stdout: string) => {
  sharedConsole_.pushStringBlocking(`${stdout}\n`);
};

const printErr = (stderror: string) => {
  sharedConsole_.pushStringBlocking(`${stderror}\n`);
};

interface ExitStatusError {
  name: string;
  message: string;
  status: number;
}

namespace ExitStatusError {
  export const isExitStatusError = (e: unknown): e is ExitStatusError => typeof e === 'object' && e['name'] === 'ExitStatus';
}

const startC = (message: Protocol.Worker.StartRequest) => {
  let stoppedSent = false;

  const sendStopped = () => {
    if (stoppedSent) return;

    ctx.postMessage({
      type: 'stopped',
    } as Protocol.Worker.StoppedRequest);
    stoppedSent = true;
  };

  const mod = dynRequire(message.code, {
    setRegister8b: (address: number, value: number) => sharedRegister_.setRegister8b(address, value),
    setRegister16b: (address: number, value: number) => sharedRegister_.setRegister16b(address, value),
    setRegister32b: (address: number, value: number) => sharedRegister_.setRegister32b(address, value),
    readRegister8b: (address: number) => sharedRegister_.getRegisterValue8b(address),
    readRegister16b: (address: number) => sharedRegister_.getRegisterValue16b(address),
    readRegister32b: (address: number) => sharedRegister_.getRegisterValue32b(address),
    onStop: sendStopped
  },
  print,
  printErr
  );

  mod.onRuntimeInitialized = () => {
    try {
      mod._main();
    } catch (e: unknown) {
      if (ExitStatusError.isExitStatusError(e)) {
        print(`Program exited with status code ${e.status}`);
      } else if (e instanceof Error) {
        printErr(e.message);
      } else {
        printErr(`Program exited with an unknown error`);
      }
    } finally {
      sendStopped();
    }
  };

  ctx.postMessage({
    type: 'start'
  });
};

const runEventLoop = (): Promise<void> => new Promise((resolve, reject) => setTimeout(resolve, 5));

const startPython = async (message: Protocol.Worker.StartRequest) => {
  ctx.postMessage({
    type: 'start'
  });

  await runEventLoop();

  await python({
    code: message.code,
    print,
    printErr,
    registers: sharedRegister_,
  });
};

let cachedRt: string;

const startScratch = async (message: Protocol.Worker.StartRequest) => {
  if (cachedRt === undefined) {
    const res = await fetch('/scratch/rt.js', {

    });
    cachedRt = await res.text();
  }

  let stoppedSent = false;

  const sendStopped = () => {
    if (stoppedSent) return;

    ctx.postMessage({
      type: 'stopped',
    } as Protocol.Worker.StoppedRequest);
    stoppedSent = true;
  };

  const mod = dynRequire(cachedRt, {
    setRegister8b: (address: number, value: number) => sharedRegister_.setRegister8b(address, value),
    setRegister16b: (address: number, value: number) => sharedRegister_.setRegister16b(address, value),
    setRegister32b: (address: number, value: number) => sharedRegister_.setRegister32b(address, value),
    readRegister8b: (address: number) => sharedRegister_.getRegisterValue8b(address),
    readRegister16b: (address: number) => sharedRegister_.getRegisterValue16b(address),
    readRegister32b: (address: number) => sharedRegister_.getRegisterValue32b(address),
    onStop: sendStopped
  },
  print,
  printErr
  );

  mod.onRuntimeInitialized = () => {
    ctx.postMessage({
      type: 'start'
    });
    
    try {
      mod._main();
    } catch (e: unknown) {
      if (ExitStatusError.isExitStatusError(e)) {
        print(`Program exited with status code ${e.status}`);
      } else if (e instanceof Error) {
        printErr(e.message);
      } else {
        printErr(`Program exited with an unknown error`);
      }
      return;
    }

    try {
      const instance = new Instance({
        source: new DOMParser().parseFromString(message.code, "text/xml"),
        modules: {
          control,
          data,
          operator,
          motor: motor(mod),
          time: time(mod),
          wait_for: wait_for(mod),
          servo: servo(mod),
          digital: digital(mod),
          analog: analog(mod),
        }
      });
  
      instance.run();
    } catch (e) {
      console.error(e);
      let last = e;
      while (InstanceError.is(e)) {
        e = e.original;
        last = e;
      }
  
      if (InstanceError.is(last)) {
        printErr(`${last.module}/${last.function}: ${e.name}: ${e.message}`);
      } else {
        printErr(e.message);
      }
    } finally {
      sendStopped();
    }
  };
};

const start = async (message: Protocol.Worker.StartRequest) => {
  switch (message.language) {
    case 'c':
    case 'cpp': {
      startC(message);
      break;
    }
    case 'python': {
      try {
        await startPython(message);
      } catch (e) {
        printErr(e);
      } finally {
        ctx.postMessage({
          type: 'stopped',
        } as Protocol.Worker.StoppedRequest);
      }
      break;
    }
    case 'scratch': {
      startScratch(message);
      break;
    }
  }
};

ctx.onmessage = (e: MessageEvent) => {
  const message = e.data as Protocol.Worker.Request;
  
  switch (message.type) {
    case 'start': {
      void start(message);
      break;
    }
    case 'set-shared-registers': {
      sharedRegister_ = new SharedRegisters(message.sharedArrayBuffer);
      break;
    }
    case 'set-shared-console': {
      sharedConsole_ = new SharedRingBufferUtf32(message.sharedArrayBuffer);
      break;
    }
  } 
};

// Notify main thread that worker is ready for messages
ctx.postMessage({
  type: 'worker-ready',
} as Protocol.Worker.WorkerReadyRequest);