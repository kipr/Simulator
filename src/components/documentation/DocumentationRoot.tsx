import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface ModalProps {
  children: React.ReactNode;
}

type Props = ModalProps;

const DOCUMENTATION_ROOT = document.getElementById('documentation-root');

class DocumentationRoot extends React.PureComponent<Props> {
  static get active() {
    return DOCUMENTATION_ROOT.children.length !== 0; 
  }

  constructor(props?: Props) {
    super(props);
  }

  componentDidMount() {
    DOCUMENTATION_ROOT.style.opacity = '1';
  }

  componentWillUnmount() {
    DOCUMENTATION_ROOT.style.opacity = '0';
  }

  static isVisible = () => {
    return DOCUMENTATION_ROOT.childElementCount > 0;
  };

  render() {
    return ReactDom.createPortal(this.props.children, DOCUMENTATION_ROOT);
  }
}

export default DocumentationRoot;