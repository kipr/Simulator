import construct from '../../util/redux/construct';
import SharedRingBufferU32 from './SharedRingBufferU32';

interface SerialU32 {
  tx: SharedRingBufferU32;
  rx: SharedRingBufferU32;
}

namespace SerialU32 {
  export const create = (maxLength: number): SerialU32 => {
    return {
      tx: SharedRingBufferU32.create(maxLength, "serialtx"),
      rx: SharedRingBufferU32.create(maxLength, "serialrx")
    };
  };

  export const createPair = (maxLength: number): [SerialU32, SerialU32] => {
    const left = create(maxLength);
    return [left, flip(left)];
  };

  export const flip = ({ rx: tx, tx: rx }: SerialU32): SerialU32 => ({ tx, rx });

  export const popAll = ({ tx, rx }: SerialU32): void => {
    tx.popAll();
    rx.popAll();
  };

  export const write = <T, U extends { serialize: (data: T) => number[] }>(u: U) => (serial: SerialU32, data: T) => {
    serial.tx.pushAll(u.serialize(data));
  };

  export const writeConstruct = <T extends { type: unknown }, U extends { serialize: (data: T) => number[] }>(u: U, ty: T['type']) => (serial: SerialU32, data: Omit<T, 'type'>) => {
    serial.tx.pushAll(u.serialize(construct<T>(ty)(data)));
  };
}

export default SerialU32;