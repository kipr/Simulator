import SharedRingBufferU32 from './SharedRingBufferU32';

interface SerialU32 {
  tx: SharedRingBufferU32;
  rx: SharedRingBufferU32;
}

namespace SerialU32 {
  export const create = (maxLength: number): SerialU32 => ({
    tx: SharedRingBufferU32.create(maxLength),
    rx: SharedRingBufferU32.create(maxLength)
  });

  export const createPair = (maxLength: number): [SerialU32, SerialU32] => {
    const left = create(maxLength);
    return [left, flip(left)];
  };

  export const flip = ({ rx: tx, tx: rx }: SerialU32): SerialU32 => ({ tx, rx });
}

export default SerialU32;