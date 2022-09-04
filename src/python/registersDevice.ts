import Protocol from '../WorkerProtocol';
import FsDevice from './FsDevice';
import SharedRegisters from '../SharedRegisters';

interface RegistersDeviceParams {
  registers: SharedRegisters;
}

export default (params: RegistersDeviceParams): FsDevice => {

  const { registers } = params;

  const outBuffer: number[] = [];
  return {
    write: (stream, buffer, offset, length, position) => {
      const uBuffer = new Uint8Array(buffer);

      for (let i = 0; i < length;) {
        const requestType = uBuffer[offset + i + 0];
        const address = uBuffer[offset + i + 1];
        const size = uBuffer[offset + i + 2];
        i += 3;

        switch (requestType) {
          // REQUEST_READ
          case 0: {
            switch (size) {
              case 1: {
                outBuffer.push(registers.getRegisterValue8b(address));
                break;
              }
              case 2: {
                const value = registers.getRegisterValue16b(address);
                outBuffer.push((value & 0xFF00) >> 8);
                outBuffer.push((value & 0x00FF) >> 0);
                break;
              }
              case 4: {
                const value = registers.getRegisterValue32b(address);
                outBuffer.push((value & 0xFF000000) >> 24);
                outBuffer.push((value & 0x00FF0000) >> 16);
                outBuffer.push((value & 0x0000FF00) >> 8);
                outBuffer.push((value & 0x000000FF) >> 0);
                break;
              }
            }
            break;
          }
          // REQUEST_WRITE
          case 1: {
            switch (size) {
              case 1: {
                registers.setRegister8b(address, uBuffer[offset + i]);
                ++i;
                break;
              }
              case 2: {
                registers.setRegister16b(address, (
                  (uBuffer[offset + i + 0] << 8) |
                  (uBuffer[offset + i + 1] << 0)
                ));
                i += 2;
                break;
              }
              case 4: {
                registers.setRegister32b(address, (
                  (uBuffer[offset + i + 0] << 24) |
                  (uBuffer[offset + i + 1] << 16) |
                  (uBuffer[offset + i + 2] << 8) |
                  (uBuffer[offset + i + 3] << 0)
                ));
                i += 4;
                break;
              }
            }
            break;
          }
          // REQUEST_READ_MASK
          case 2: {
            switch (size) {
              case 1: {
                outBuffer.push(registers.getRegisterValue8b(address) & uBuffer[offset + i + 0]);
                i += 1;
                break;
              }
              case 2: {
                const value = registers.getRegisterValue16b(address);
                outBuffer.push(((value & 0xFF00) >> 8) & uBuffer[offset + i + 0]);
                outBuffer.push(((value & 0x00FF) >> 0) & uBuffer[offset + i + 1]);
                i += 2;
                break;
              }
              case 4: {
                const value = registers.getRegisterValue32b(address);
                outBuffer.push(((value & 0xFF000000) >> 24) & uBuffer[offset + i + 0]);
                outBuffer.push(((value & 0x00FF0000) >> 16) & uBuffer[offset + i + 1]);
                outBuffer.push(((value & 0x0000FF00) >> 8) & uBuffer[offset + i + 2]);
                outBuffer.push(((value & 0x000000FF) >> 0) & uBuffer[offset + i + 3]);
                i += 4;
                break;
              }
            }
            break;
          }
          // REQUEST_WRITE_MASK
          case 3: {
            switch (size) {
              case 1: {
                const mask = uBuffer[offset + i + 1];
                
                let value = registers.getRegisterValue8b(address) & ~mask;
                value |= uBuffer[offset + i + 0] & mask;
                
                registers.setRegister8b(address, value);
                i += 2;
                break;
              }
              case 2: {
                const mask = (
                  (uBuffer[offset + i + 2] << 8) |
                  (uBuffer[offset + i + 3] << 0)
                );

                let value = registers.getRegisterValue16b(address) & ~mask;
                value |= (
                  (uBuffer[offset + i + 0] << 8) |
                  (uBuffer[offset + i + 1] << 0)
                ) & mask;
                
                registers.setRegister16b(address, value);

                i += 4;
                break;
              }
              case 4: {
                const mask = (
                  (uBuffer[offset + i + 4] << 24) |
                  (uBuffer[offset + i + 5] << 16) |
                  (uBuffer[offset + i + 6] << 8) |
                  (uBuffer[offset + i + 7] << 0)
                );

                let value = registers.getRegisterValue32b(address) & ~mask;
                value |= (
                  (uBuffer[offset + i + 0] << 24) |
                  (uBuffer[offset + i + 1] << 16) |
                  (uBuffer[offset + i + 2] << 8) |
                  (uBuffer[offset + i + 3] << 0)
                ) & mask;

                registers.setRegister32b(address, value);
                i += 8;
                break;
              }
            }
            break;
          }
          default: {
            throw new Error(`Unknown request type: ${requestType}`);
          }
        }
      }

      return length;
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