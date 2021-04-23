export interface Sensor {
  update(): void;
  dispose(): void;
  getValue(): number;
}

export interface VisibleSensor extends Sensor {
  isVisible: boolean;
  updateVisual(): void;
}