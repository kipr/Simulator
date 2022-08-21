import Protocol from '../WorkerProtocol';
import FsDevice from './FsDevice';

interface RegistersDeviceParams {
  onRegistersChange: (registers: Protocol.Worker.Register[]) => void;
  registers: number[];
}

export default (params: RegistersDeviceParams): FsDevice => {

  const outBuffer: number[] = [];
  return {
    write: (stream, buffer, offset, length, position) => {
      const uBuffer = new Uint8Array(buffer);

      const requestType = uBuffer[offset];
      const address = uBuffer[offset + 1];
      const count = uBuffer[offset + 2];

      switch (requestType) {
        // REQUEST_READ
        case 0: {
          for (let i = 0; i < count; i++) {
            outBuffer.push(params.registers[address + i]);
          }
          return length;
        }
        // REQUEST_WRITE
        case 1: {
          const registers: Protocol.Worker.Register[] = [];
          for (let i = 0; i < count; i++) {
            registers.push({
              address: address + i,
              value: uBuffer[offset + 3 + i]
            });
            params.registers[address + i] = uBuffer[offset + 3 + i];
          }
          params.onRegistersChange(registers);
          return length;
        }
        default: {
          throw new Error(`Unknown request type: ${requestType}`);
        }
      }
    },
    read: (stream, buffer, offset, length, position) => {
      if (outBuffer.length < length) {
        throw new Error('Too much data requested');
      }

      for (let i = 0; i < length; i++) {
        buffer[offset + i] = outBuffer.shift();
      }

      return length;
    }
  };
};