import Sensor from './Sensor';
import SensorParameters from './SensorParameters';

abstract class SensorObject<T, O> implements Sensor<O> {
  private parameters_: SensorParameters<T>;
  get parameters() { return this.parameters_; }

  private realistic_ = false;
  get realistic() { return this.realistic_; }
  set realistic(realistic: boolean) { this.realistic_ = realistic; }

  private visible_ = false;
  get visible() { return this.visible_; }
  set visible(visible: boolean) { this.visible_ = visible; }

  private noisy_ = false;
  get noisy() { return this.noisy_; }
  set noisy(noisy: boolean) { this.noisy_ = noisy; }

  constructor(parameters: SensorParameters<T>) {
    this.parameters_ = parameters;
  }

  abstract getValue(): Promise<O>;

  abstract dispose(): void;
}

export default SensorObject;