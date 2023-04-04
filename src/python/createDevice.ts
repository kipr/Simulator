import SharedRingBufferU32 from 'SharedRingBufferU32';
import FsDevice from './FsDevice';
import SerialU32 from '../SerialU32';

interface CreateDeviceParams {
  serial: SerialU32;
}

export default (params: CreateDeviceParams): FsDevice => {
  return {
    write: (stream, buffer, offset, length, position) => {
      const uBuffer = new Uint8Array(buffer);
      for (let i = 0; i < length; ++i) {
        params.serial.tx.push(uBuffer[offset + i]);
      }
      return length;
    },
    read: (stream, buffer, offset, length, position) => {
      const uBuffer = new Uint8Array(buffer);
      for (let i = 0; i < length; ++i) {
        const next = params.serial.rx.pop();
        if (next === undefined) return i;
        uBuffer[offset + i] = next;
      }
      return length;
    }
  };
};