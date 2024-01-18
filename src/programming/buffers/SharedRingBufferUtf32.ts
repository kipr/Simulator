import SharedRingBuffer from './SharedRingBuffer';
import SharedRingBufferU32 from './SharedRingBufferU32';


class SharedRingBufferUtf32 implements SharedRingBuffer {
  private ringBufferU32_: SharedRingBufferU32;

  constructor(ringBufferOrSharedArrayBuffer: SharedRingBufferU32 | SharedArrayBuffer) {
    if (ringBufferOrSharedArrayBuffer instanceof SharedRingBufferU32) {
      this.ringBufferU32_ = ringBufferOrSharedArrayBuffer;
    } else {
      this.ringBufferU32_ = new SharedRingBufferU32(ringBufferOrSharedArrayBuffer);
    }
  }

  get sharedArrayBuffer() { return this.ringBufferU32_.sharedArrayBuffer; }

  static create(maxLength: number): SharedRingBufferUtf32 {
    return new SharedRingBufferUtf32(SharedRingBufferU32.create(maxLength));
  }

  get maxLength() {
    return this.ringBufferU32_.maxLength;
  }

  push(value: number): boolean {
    return this.ringBufferU32_.push(value);
  }

  // Push a string to the buffer. The number of characters written is returned.
  pushString(value: string): number {
    let i = 0;
    
    for (const codePoint of value) {
      if (!this.push(codePoint.codePointAt(0))) break;
      ++i;
    }

    return i;
  }

  pushStringBlocking(value: string) {
    let working = value;
    while (working.length > 0) {
      const written = this.pushString(working);
      if (written === 0) continue;
      working = working.slice(written);
    }
  }

  pop(): number {
    return this.ringBufferU32_.pop();
  }

  popAll(): number[] {
    return this.ringBufferU32_.popAll();
  }

  // Pop a string from the buffer. The read string is returned.
  popString(): string {
    return String.fromCodePoint(...this.popAll());
  }

}

export default SharedRingBufferUtf32;