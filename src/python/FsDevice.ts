interface FsDevice {
  open?: (stream: unknown) => void;
  write?: (stream: unknown, buffer: Int8Array, offset: number, length: number, position: number) => number;
  read?: (stream: unknown, buffer: Int8Array, offset: number, length: number, position: number) => number;
}

export default FsDevice;