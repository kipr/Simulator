interface Sensor<T> {
  getValue(): Promise<T>;
  dispose(): void;
  
  realistic: boolean;
  noisy: boolean;
  visible: boolean;
}
  
export default Sensor;