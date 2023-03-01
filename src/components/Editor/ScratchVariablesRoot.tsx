import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface ModalProps {
  children: React.ReactNode;
}

type Props = ModalProps;

const SCRATCH_VARIABLES_ROOT = document.getElementById('scratch-variables-root');

class ScratchVariablesRoot extends React.PureComponent<Props> {
  static get active() {
    return SCRATCH_VARIABLES_ROOT.children.length !== 0; 
  }

  constructor(props?: Props) {
    super(props);
  }

  componentDidMount() {
    SCRATCH_VARIABLES_ROOT.style.opacity = '1';
  }

  componentWillUnmount() {
    SCRATCH_VARIABLES_ROOT.style.opacity = '0';
  }

  static isVisible = () => {
    return SCRATCH_VARIABLES_ROOT.childElementCount > 0;
  };

  render() {
    return ReactDom.createPortal(this.props.children, SCRATCH_VARIABLES_ROOT);
  }
}

export default ScratchVariablesRoot;
