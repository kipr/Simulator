import Registers from "./RegisterState";

/**
 * Represents the register data that is shared between the main thread and the worker thread.
 * The data is stored in a SharedArrayBuffer and accessed using typed arrays and the appropriate
 * atomic operations from Atomics.
 * 
 * The SharedArrayBuffer indexes and register address are not the same because the multi-byte
 * array views must be aligned properly. For example, 4 byte values must start at address 0, 4, 8, etc.
 * So there are some padding bytes throughout the register space to ensure alignment.
 * 
 * Additionally, the typed arrays use the platform's endianness (typically little-endian) while
 * the multi-byte registers are stored in big-endian order. As a result, the indexes are also different
 * within a multi-byte value, so the individual bytes in multi-byte values shouldn't be accessed separately.
 */
export default class SharedRegisters {
  private readonly registerSharedArrayBuffer_: SharedArrayBuffer;

  // Use typed arrays of various sizes to ensure atomic operations
  private readonly registerArrayViewU8b_: Uint8Array;
  private readonly registerArrayView8b_: Int8Array;
  private readonly registerArrayViewU16b_: Uint16Array;
  private readonly registerArrayView16b_: Int16Array;
  private readonly registerArrayViewU32b_: Uint32Array;
  private readonly registerArrayView32b_: Int32Array;

  constructor(registerSharedArrayBuffer?: SharedArrayBuffer) {
    // Add 3 bytes to account for padding. See RegisterState for which bytes are padded
    this.registerSharedArrayBuffer_ = registerSharedArrayBuffer ?? new SharedArrayBuffer(Registers.REG_ALL_COUNT + 3);

    this.registerArrayViewU8b_ = new Uint8Array(this.registerSharedArrayBuffer_);
    this.registerArrayView8b_ = new Int8Array(this.registerSharedArrayBuffer_);
    this.registerArrayViewU16b_ = new Uint16Array(this.registerSharedArrayBuffer_);
    this.registerArrayView16b_ = new Int16Array(this.registerSharedArrayBuffer_);
    this.registerArrayViewU32b_ = new Uint32Array(this.registerSharedArrayBuffer_);
    this.registerArrayView32b_ = new Int32Array(this.registerSharedArrayBuffer_);
  }

  public getSharedArrayBuffer(): SharedArrayBuffer {
    return this.registerSharedArrayBuffer_;
  }

  public clone(): SharedRegisters {
    const newRegisterSharedArrayBuffer = new SharedArrayBuffer(this.registerSharedArrayBuffer_.byteLength);
    new Uint8Array(newRegisterSharedArrayBuffer).set(this.registerArrayViewU8b_);
    return new SharedRegisters(newRegisterSharedArrayBuffer);
  }

  public setRegister8b(registerAddress: number, value: number) {
    Atomics.store(this.registerArrayView8b_, SharedRegisters.getBufferIndexForRegisterAddress(registerAddress), value);
  }

  public setRegister16b(registerAddress: number, value: number) {
    Atomics.store(this.registerArrayView16b_, SharedRegisters.getBufferIndexForRegisterAddress(registerAddress) / 2, value);
  }

  public setRegister32b(registerAddress: number, value: number) {
    Atomics.store(this.registerArrayView32b_, SharedRegisters.getBufferIndexForRegisterAddress(registerAddress) / 4, value);
  }

  public incrementRegister32b(registerAddress: number, value: number) {
    Atomics.add(this.registerArrayView32b_, SharedRegisters.getBufferIndexForRegisterAddress(registerAddress) / 4, value);
  }

  public getRegisterValue8b = (registerAddress: number, signed = false): number => {
    const array = signed ? this.registerArrayView8b_ : this.registerArrayViewU8b_;
    return Atomics.load(array, SharedRegisters.getBufferIndexForRegisterAddress(registerAddress));
  };

  public getRegisterValue16b = (registerAddress: number, signed = false): number => {
    const array = signed ? this.registerArrayView16b_ : this.registerArrayViewU16b_;
    return Atomics.load(array, SharedRegisters.getBufferIndexForRegisterAddress(registerAddress) / 2);
  };

  public getRegisterValue32b = (registerAddress: number, signed = false): number => {
    const array = signed ? this.registerArrayView32b_ : this.registerArrayViewU32b_;
    return Atomics.load(array, SharedRegisters.getBufferIndexForRegisterAddress(registerAddress) / 4);
  };

  /**
   * Get the index in the SharedArrayBuffer that corresponds to the given address.
   * Accounts for the padding bytes.
   * @param address The address of the register.
   * @returns The index in the SharedArrayBuffer that corresponds to the given address.
   */
  private static getBufferIndexForRegisterAddress = (address: number) => {
    if (address <= Registers.REG_R_START) return address;
    if (address <= Registers.REG_RW_ADC_PE) return address + 1;
    if (address <= Registers.REG_RW_BUTTONS) return address + 2;
    return address + 3;
  };
}