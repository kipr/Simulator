import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface ModalProps {
  children: React.ReactNode;
}

type Props = ModalProps;

const GRAPHICAL_VARIABLES_ROOT = document.getElementById('graphical-variables-root');

class GraphicalVariablesRoot extends React.PureComponent<Props> {
  static get active() {
    return GRAPHICAL_VARIABLES_ROOT.children.length !== 0; 
  }

  constructor(props?: Props) {
    super(props);
  }

  componentDidMount() {
    GRAPHICAL_VARIABLES_ROOT.style.opacity = '1';
  }

  componentWillUnmount() {
    GRAPHICAL_VARIABLES_ROOT.style.opacity = '0';
  }

  static isVisible = () => {
    return GRAPHICAL_VARIABLES_ROOT.childElementCount > 0;
  };

  render() {
    return ReactDom.createPortal(this.props.children, GRAPHICAL_VARIABLES_ROOT);
  }
}

export default GraphicalVariablesRoot;
