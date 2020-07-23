export interface Sensor {
	update(): void;
	getValue(): number;
}

export interface VisibleSensor extends Sensor {
	isVisible: boolean;
	updateVisual(): void;
}