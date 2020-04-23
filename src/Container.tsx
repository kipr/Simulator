import * as React from 'react'
import { App } from './App'
import { Visualizer } from './Visualizer'
import { Static } from './Static'
import WorkerInstance from './WorkerInstance'
import { RobotState } from './RobotState'

export interface ContainerProps{}
interface ContainerState{
    state:RobotState
}
type Props = ContainerProps;
type State = ContainerState;

export class Container extends React.Component<Props, State> {
   constructor(props: Props, context?){
    super (props, context)
    this.state = {
        state: undefined
    }
   } 
   private onStateChange = (state:RobotState) => {
    this.setState({
        state: {
            ...state
        }
    })
   }
   onComponentWillMount(){
    WorkerInstance.onStateChange = this.onStateChange
   }
   render(){
       const {
           props, state 
       }= this

       return (
        <section id="container">
            <section id="app">
                <App state= {state.state}/>
            </section>
            <section id="simulator">
                <svg width={1300} height={900} viewBox="0 0 1440 960" id="simulator-area">
                    <Static/>
                    <Visualizer robot= {state.state}/>
                </svg>
            </section>
        </section>
    )
   }
}

//All logic inside of index.tsx