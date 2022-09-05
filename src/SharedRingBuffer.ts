interface SharedRingBuffer {
  get sharedArrayBuffer(): SharedArrayBuffer;
  push(value: number): boolean;
  pop(): number;
  popAll(): number[];
}

export default SharedRingBuffer;