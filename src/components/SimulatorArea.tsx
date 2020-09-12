import React = require("react");
import * as Babylon from 'babylonjs';

import * as Sim from '../Sim';
import { RobotState } from "../RobotState";

interface SimulatorAreaProps {
    robotState: RobotState;
    canEnabled: boolean[];

    onRobotStateChange: (robotState: RobotState) => void;
}

interface SimulatorAreaState { }

export class SimulatorArea extends React.Component<SimulatorAreaProps, SimulatorAreaState> {
    canvas: HTMLCanvasElement;
    space: Sim.Space;
    
    constructor(props: SimulatorAreaProps) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.space = new Sim.Space(this.canvas, () => this.props.robotState, (robotState) => {
            this.props.onRobotStateChange(robotState);
        });

        // Resize Babylon engine when canvas is resized
        this.canvas.addEventListener('resize', () => {
            this.space.handleResize();
        });
        
        this.space.createScene();
        this.space.loadMeshes();
        this.space.startRenderLoop();
    }

    componentDidUpdate(prevProps: SimulatorAreaProps) {
        // Check if any cans were toggled
        this.props.canEnabled.forEach((enabled, i) => {
            if (enabled !== prevProps.canEnabled[i]) {
                this.setCanEnabled(i, enabled);
            }
        });
    }

    setCanvasRef = (c: HTMLCanvasElement) => {
        if (c !== null) {
            this.canvas = c;
        }
    }

    setCanEnabled(canNumber: number, isEnabled: boolean) {
        isEnabled
            ? this.space.generateCans(canNumber + 1)
            : this.space.destroyCan(canNumber + 1);
    }

    render() {
        return (
            <canvas ref={this.setCanvasRef} id="simview" />
        );
    }
}