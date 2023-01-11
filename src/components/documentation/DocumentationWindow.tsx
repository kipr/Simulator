import * as React from 'react';
import { Vector2 } from '../../math';
import { ThemeProps } from '../theme';
import Widget, { Mode } from '../Widget';
import { DocumentationRoot } from './DocumentationRoot';

export interface DocumentationWindowProps extends ThemeProps {
}

interface DocumentationWindowState {
  position: Vector2;
}

type Props = DocumentationWindowProps;
type State = DocumentationWindowState;

export class DocumentationWindow extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  
    this.state = {
      position: Vector2.create(0, 0)
    };
  }

  private onWindowMouseMove_ = (e: MouseEvent) => {
  };

  private onWindowMouseUp_ = (e: MouseEvent) => {
  };

  private onChromeMouseDown_ = (e: React.MouseEvent) => {
    const { props, state } = this;
    const { position } = state;
    const { clientX, clientY } = e;
    const { top, left } = e.currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    
    this.setState({
      position: Vector2.create(x, y)
    });
    
    window.addEventListener('mousemove', this.onWindowMouseMove_);
    window.addEventListener('mouseup', this.onWindowMouseUp_);
  };

  render() {
    const { props, state } = this;
    const { theme } = props;
    const { position } = state;
    return (
      <DocumentationRoot>
        <Widget
          name='Documentation'
          theme={theme}
          mode={Mode.Floating}
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          onChromeMouseDown={}
        >
          Test
        </Widget>
      </DocumentationRoot>
    );
  }

}