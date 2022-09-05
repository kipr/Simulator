import SharedRingBuffer from './SharedRingBuffer';


class SharedRingBufferU32 implements SharedRingBuffer {
  private static readonly HEADER_SIZE = 8;

  private static readonly BEGIN_INDEX = 0;
  private static readonly END_INDEX = 1;

  private sab_: SharedArrayBuffer;

  get sharedArrayBuffer() { return this.sab_; }

  private u32_: Uint32Array;

  constructor(sab: SharedArrayBuffer) {
    if (sab.byteLength <= SharedRingBufferU32.HEADER_SIZE + 4) {
      throw new Error('SharedRingBufferU32: SharedArrayBuffer is too small');
    }

    if (sab.byteLength % 4 !== 0) {
      throw new Error('SharedRingBufferU32: SharedArrayBuffer byteLength is not a multiple of 4');
    }

    this.sab_ = sab;
    this.u32_ = new Uint32Array(sab);
  }

  get maxLength() {
    return this.u32_.length - SharedRingBufferU32.HEADER_SIZE / 4;
  }

  static create(maxLength: number): SharedRingBufferU32 {
    const sab = new SharedArrayBuffer(SharedRingBufferU32.HEADER_SIZE + maxLength * 4);
    
    const u32 = new Uint32Array(sab);
    u32[SharedRingBufferU32.BEGIN_INDEX] = 0;
    u32[SharedRingBufferU32.END_INDEX] = 0;
    
    return new SharedRingBufferU32(sab);
  }

  private get begin_(): number {
    return Atomics.load(this.u32_, SharedRingBufferU32.BEGIN_INDEX);
  }

  private set begin_(begin: number) {
    Atomics.store(this.u32_, SharedRingBufferU32.BEGIN_INDEX, begin % this.maxLength);
  }

  private get end_(): number {
    return Atomics.load(this.u32_, SharedRingBufferU32.END_INDEX);
  }

  private set end_(end: number) {
    Atomics.store(this.u32_, SharedRingBufferU32.END_INDEX, end % this.maxLength);
  }

  private at_(index: number): number {
    return this.u32_[SharedRingBufferU32.HEADER_SIZE / 4 + index];
  }

  private setAt_(index: number, value: number) {
    this.u32_[SharedRingBufferU32.HEADER_SIZE / 4 + index] = value;
  }

  push(value: number): boolean {
    const begin = this.begin_;
    const end = this.end_;

    // If the buffer is full, return false.
    if (begin === (end + 1) % this.maxLength) return false;
  
    // Write the value to the buffer.
    this.setAt_(end, value);
    ++this.end_;
    
    return true;
  }

  pop(): number {
    const begin = this.begin_;
    const end = this.end_;

    // If the buffer is empty, return undefined.
    if (begin === end) return undefined;

    // Read the value from the buffer.
    const value = this.at_(begin);
    ++this.begin_;

    return value;
  }

  popAll(): number[] {
    const begin = this.begin_;
    const end = this.end_;

    // If the buffer is empty, return empty array.
    if (begin === end) return [];

    // Read the values from the buffer. End might be less than begin if the buffer has wrapped.
    // 10 - 8 + 2 
    const length = end > begin
      ? end - begin
      : this.maxLength - begin + end;
    const values = new Array<number>(length);

    if (end > begin) {
      for (let i = begin; i < end; ++i) values[i - begin] = this.at_(i);
    } else {
      for (let i = begin; i < this.maxLength; ++i) values[i - begin] = this.at_(i);
      for (let i = 0; i < end; ++i) values[this.maxLength - begin + i] = this.at_(i);
    }

    this.begin_ = end;

    return values;
  }
}

export default SharedRingBufferU32;