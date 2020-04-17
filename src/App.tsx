
import * as React from 'react';
import { StyleProps } from "./style";

import compile from './compile';

import WorkerInstance from './WorkerInstance';

export interface AppProps extends StyleProps {

}

interface AppState {
  code: string;
}

type Props = AppProps;
type State = AppState;

export class App extends React.Component<Props, State> {
  constructor(props: Props, context?: any) {
    super(props, context);

    this.state = {
      code: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main() {\n  printf("Hello, World! %lf\\n", seconds());\n  return 0;\n}\n'
    };
  }

  private onButtonClick_ = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const compiled = await compile(this.state.code);

      WorkerInstance.start(compiled);  
    } catch (e) {
      console.log(e);
    }
  };

  private onCodeChange_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      code: event.currentTarget.value
    });
  };

  render() {
    const { props, state } = this;
    const { code } = state;
    //console.log(this.props.children);
    return (

      <>
        <header>
          <h1>KISS IDE Simulator</h1>
          <p>KISS Institute for Practical Robotics</p>
        </header>
        <p><button onClick={this.onButtonClick_}>Compile</button></p>
        <textarea rows={10} cols={50} onChange={this.onCodeChange_} value={code} />
      </>
    )
  }
}
