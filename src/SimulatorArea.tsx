import React = require("react");
import * as Babylon from 'babylonjs';

import * as Sim from './Sim';
import WorkerInstance from "./WorkerInstance";

interface SimulatorAreaProps {
    canEnabled: boolean[];
}

interface SimulatorAreaState { }

export class SimulatorArea extends React.Component<SimulatorAreaProps, SimulatorAreaState> {
    canvas: HTMLCanvasElement;
    engine: Babylon.Engine;
    // scene: Babylon.Scene;
    space: Sim.Space;
    
    constructor(props: SimulatorAreaProps) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.engine = new Babylon.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
        // this.scene = new Babylon.Scene(this.engine);

        this.space = new Sim.Space(this.engine, this.canvas);

        let m1: number;
        let m2: number;
        
        this.space.createScene();
        this.space.loadMeshes(this.space);

        this.space.scene.registerAfterRender(() => {
            m1 = WorkerInstance.DirectionalValues(WorkerInstance.registers[62], WorkerInstance.registers[63]) / 1500 * -2;
            m2 = WorkerInstance.DirectionalValues(WorkerInstance.registers[68], WorkerInstance.registers[69]) / 1500 * -2;
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
                enabled
                    ? this.createCan(`Can${i+1}`, i+1)
                    : this.destroyCan(`Can${i+1}`);
            }
        });
    }

    setCanvasRef = (c: HTMLCanvasElement) => {
        if (c !== null) {
            this.canvas = c;
        }
    }

    createCan(canName, canItem) {
        this.space.generateCans(canName, canItem);
    }

    destroyCan(canName) {
        this.space.scene.getMeshByName(canName).dispose();
    }

    render() {
        return (
            <canvas ref={this.setCanvasRef} id="simview" />
        );
    }
}