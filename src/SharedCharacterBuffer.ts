
/// A SharedCharacterBuffer is a spinlock protected shared ring buffer of UTF-32 characters.
/// It allocates a header at the beginning of the buffer, followed by the characters.
/// The header is as follows:
///   - lock: i32 - A spin lock for mutual exclusion (1 = locked, 0 = unlocked)
///   - nonce: u32 - A nonce that is incremented every time the buffer is written to
///   - start: u32 - The start of the character data, where 0 is the first non-header u32
///   - end: u32 - The end of the character data, where 0 is the first non-header u32.

class SharedCharacterBuffer {
  private static readonly HEADER_SIZE = 16;

  private sab_: SharedArrayBuffer;

  get sab() { return this.sab_; }

  private u32_: Uint32Array;
  private i32_: Int32Array;

  constructor(sab: SharedArrayBuffer) {
    if (sab.byteLength <= SharedCharacterBuffer.HEADER_SIZE) {
      throw new Error('SharedCharacterBuffer: SharedArrayBuffer is too small');
    }
    
    this.sab_ = sab;
    this.u32_ = new Uint32Array(sab);
    this.i32_ = new Int32Array(sab);
  }

  static create(length: number) {
    const sab = new SharedArrayBuffer(SharedCharacterBuffer.HEADER_SIZE + length * 4);
    const buffer = new SharedCharacterBuffer(sab);
    buffer.u32_[0] = 0;
    buffer.u32_[1] = 0;
    buffer.u32_[2] = 0;
    buffer.u32_[3] = 0;
    return buffer;
  }

  get maxLength() {
    return (this.sab_.byteLength - SharedCharacterBuffer.HEADER_SIZE) / 4;
  }

  get header() {
    this.lock_();
    const header = this.unsafeHeader;
    this.unlock_();
    return header;
  }

  private get unsafeHeader() {
    return {
      nonce: this.u32_[1],
      start: this.u32_[2],
      end: this.u32_[3],
    };
  }

  private incrementNonce_ = () => {
    Atomics.add(this.i32_, 1, 1);
  }

  private set unsafeStart(start: number) {
    this.u32_[2] = start;
  }

  private set unsafeEnd(end: number) {
    this.u32_[3] = end;
  }

  append(text: string) {
    this.lock_();
    const header = this.unsafeHeader;
    let nextStart = header.start;
    let nextEnd = header.end;

    const length = this.maxLength;

    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt#looping_with_codepointat
    // For more information.
    for (const codePoint of text) {
      // Overwrite the start if we've reached the end of the buffer.
      if (nextEnd === nextStart) {
        nextStart = (nextStart + 1) % length;
      }

      this.u32_[nextEnd + SharedCharacterBuffer.HEADER_SIZE / 4] = codePoint.charCodeAt(0);

      nextEnd = (nextEnd + 1) % length;
    }

    this.unsafeStart = nextStart;
    this.unsafeEnd = nextEnd;
    this.incrementNonce_();

    this.unlock_();
  }

  private previousText_ = '';
  private previousNonce_ = -1;
  get text() {
    this.lock_();
    const header = this.unsafeHeader;

    if (header.nonce === this.previousNonce_) {
      this.unlock_();
      return this.previousText_;
    }

    const length = this.maxLength;

    let text = '';
    let start = header.start;
    let end = header.end;

    while (start !== end) {
      text += String.fromCodePoint(this.u32_[start + SharedCharacterBuffer.HEADER_SIZE / 4]);
      start = (start + 1) % length;
    }

    this.unlock_();
    
    this.previousText_ = text;
    this.previousNonce_ = header.nonce;
    
    return text;
  }

  private tryLock_ = () => {
    return Atomics.compareExchange(this.u32_, 0, 0, 1) === 0;
  };

  private lock_ = () => {
    while (!this.tryLock_());
  };

  private unlock_ = () => {
    Atomics.store(this.u32_, 0, 0);
  };
}

namespace SharedCharacterBuffer {
  export interface Header {
    nonce: number;
    start: number;
    end: number;
  }
}