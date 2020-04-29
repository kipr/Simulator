import * as React from 'react'
import { App } from './App'
import { Visualizer } from './Visualizer'
import { Static } from './Static'
import WorkerInstance from './WorkerInstance'
import { RobotState } from './RobotState'

export interface ContainerProps{}
interface ContainerState{
    robot: RobotState
}
type Props = ContainerProps;
type State = ContainerState;

export class Container extends React.Component<Props, State> {
   constructor(props: Props, context?){
    super (props, context)
    this.state = {
        robot: WorkerInstance.state
    }
   } 
   private onStateChange = (state:RobotState) => {
    //console.log('state change'); 
    this.setState({
        robot: state
    });

   }
   
   componentWillMount() {
    WorkerInstance.onStateChange = this.onStateChange
   }

    private onRobotChange_ = (robot: RobotState) => {
        WorkerInstance.state = robot;
    };

   render(){
       const {
           props, state 
       }= this

       //console.log('qwe')

       return (
        <section id="container">
            <section id="app">
                <App robot= {state.robot} onRobotChange={this.onRobotChange_} />
            </section>
            <section id="simulator">
                <svg width={1300} height={900} viewBox="0 0 1440 960" id="simulator-area">
                    <Static/>
                    <Visualizer robot= {state.robot}/>
                </svg>
            </section>
        </section>
    )
   }
}

//All logic inside of index.tsx