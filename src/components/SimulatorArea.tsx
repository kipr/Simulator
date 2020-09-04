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
    engine: Babylon.Engine;
    space: Sim.Space;
    
    constructor(props: SimulatorAreaProps) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.engine = new Babylon.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.space = new Sim.Space(this.engine, this.canvas, () => this.props.robotState, (robotState) => {
            this.props.onRobotStateChange(robotState);
        });
        
        this.space.createScene();
        this.space.loadMeshes();

        this.space.scene.registerAfterRender(() => {
            let m1 = this.props.robotState.motor0_speed  / 1500 * -2;
            let m2 = this.props.robotState.motor3_speed  / 1500 * -2;
            this.space.setMotors(m1, m2);
            // space.setMotors(m1,m2);

            // if(this.registers_[61] == 0){
            // 	s1 = WorkerInstance.readServoRegister(WorkerInstance.registers[78], WorkerInstance.registers[79]);
            // 	s3 = WorkerInstance.readServoRegister(WorkerInstance.registers[80], WorkerInstance.registers[81]);
            // }
        });

        this.engine.runRenderLoop(() => {
            this.space.scene.render();
        })

        // Resize Babylon engine when canvas is resized
        this.canvas.addEventListener('resize', () => {
            if (this.engine) {
                this.engine.resize();
            }
        });
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