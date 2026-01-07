/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */



import Protocol from './Protocol';
import dynRequire from '../compiler/require';
import SharedRegisters from '../registers/SharedRegisters';
import python from '../python';
import SharedRingBufferUtf32 from '../buffers/SharedRingBufferUtf32';
import SerialU32 from '../buffers/SerialU32';
import SharedRingBufferU32 from '../buffers/SharedRingBufferU32';
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

// Global context for the worker thread.
const ctx: Worker = self as unknown as Worker;

// Shared registers and console buffer.
let sharedRegister_: SharedRegisters;
let createSerial_: SerialU32;
let sharedConsole_: SharedRingBufferUtf32;
let sharedVariables_: SharedRingBufferUtf32;

/**
 * Prints a string to the shared console buffer, followed by a newline.
 * @param stdout - The string to be printed.
 */
const print = (stdout: string) => {
  sharedConsole_.pushStringBlocking(`${stdout}\n`);
};

/**
 * Prints an error string to the shared console buffer, followed by a newline.
 * @param stderror - The error string to be printed.
 */
const printErr = (stderror: string) => {
  sharedConsole_.pushStringBlocking(`${stderror}\n`);
};

// Define an error structure for exit status reporting.
interface ExitStatusError {
  name: string;
  message: string;
  status: number;
}

namespace ExitStatusError {
  export const isExitStatusError = (e: unknown): e is ExitStatusError => typeof e === 'object' && e['name'] === 'ExitStatus';
}

/**
 * Starts the execution of C/C++ code.
 * @param message - Message containing the code and other relevant details.
 */
const startC = (message: Protocol.Worker.StartRequest) => {
  // message.code contains the user's code compiled to javascript
  let stoppedSent = false;

  const sendStopped = () => {
    if (stoppedSent) return;

    ctx.postMessage({
      type: 'stopped',
    } as Protocol.Worker.StoppedRequest);
    stoppedSent = true;
  };

  // dynRequire is a function that takes a string of javascript code and returns a module (a function that is executed when called)
  const mod = dynRequire(message.code, {
    setRegister8b: (address: number, value: number) => {
      sharedRegister_.setRegister8b(address, value);
    },
    setRegister16b: (address: number, value: number) => {
      sharedRegister_.setRegister16b(address, value);
    },
    setRegister32b: (address: number, value: number) => {
      sharedRegister_.setRegister32b(address, value);
    },
    readRegister8b: (address: number) => sharedRegister_.getRegisterValue8b(address),
    readRegister16b: (address: number) => sharedRegister_.getRegisterValue16b(address),
    readRegister32b: (address: number) => sharedRegister_.getRegisterValue32b(address),
    createWrite: (value: number) => {
      createSerial_.tx.push(value);
    },
    createRead: () => {
      const value = createSerial_.rx.pop();
      if (value === undefined) return -1;
      return value;
    },
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

/**
 * Runs the event loop for a set duration.
 * @returns Promise that resolves after a timeout.
 */
const runEventLoop = (): Promise<void> => new Promise((resolve, reject) => setTimeout(resolve, 5));

/**
 * Starts the execution of Python code.
 * @param message - Message containing the code and other relevant details.
 */
const startPython = async (message: Protocol.Worker.StartRequest) => {
  // Note: The 'start' message is sent inside the python() function after
  // the Python files are downloaded, so the UI shows a "compiling/loading"
  // state during the download.
  await python({
    code: message.code,
    print,
    printErr,
    registers: sharedRegister_,
    createSerial: createSerial_,
    onStart: () => {
      ctx.postMessage({
        type: 'start'
      });
    },
  });
  
};

let cachedRt: string;

const startGraphical = async (message: Protocol.Worker.StartRequest) => {
  if (cachedRt === undefined) {
    const res = await fetch('/graphical/rt.js', {

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

    const watchedVariables: Set<string> = new Set();

    let lastTick = Date.now();
    try {
      const instance = new Instance({
        source: new DOMParser().parseFromString(message.code, "text/xml"),
        show: (ctx, name) => {
          watchedVariables.add(name);
          print(`Variable ${name} = ${ctx.heap.get(name)}`);
        },
        hide: (ctx, name) => {
          watchedVariables.delete(name);
        },
        tick: (ctx) => {
          const now = Date.now();
          // ~10 Hz
          if (now - lastTick < 100) return;
          lastTick = now;
          for (const name of watchedVariables) {
            print(`Variable ${name} = ${ctx.heap.get(name)}`);
          }
        },
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
        // eslint-disable-next-line no-ex-assign
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

/**
 * Initiates the execution of code based on the specified language.
 * @param message - Message containing the code, language, and other details.
 */
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
    case 'graphical': {
      void startGraphical(message);
      break;
    }
  }
};

// Message event handler for the worker.
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
    case 'set-create-serial': {
      createSerial_ = {
        tx: new SharedRingBufferU32(message.tx),
        rx: new SharedRingBufferU32(message.rx)
      };
      break;
    }
    case 'set-shared-variables': {
      sharedVariables_ = new SharedRingBufferUtf32(message.sharedArrayBuffer);
      break;
    }
  } 
};

// Notify main thread that worker is ready for messages
ctx.postMessage({
  type: 'worker-ready',
} as Protocol.Worker.WorkerReadyRequest);