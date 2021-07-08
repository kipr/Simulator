import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface ModalProps {
  children: any;
}

type Props = ModalProps;

const MODAL_ROOT = document.getElementById('modal-root');

export class Modal extends React.PureComponent<Props> {
  static get active() {
    return MODAL_ROOT.children.length !== 0; 
  }

  constructor(props?: Props) {
    super(props);
  }

  componentDidMount() {
    MODAL_ROOT.style.display = 'flex';
    MODAL_ROOT.style.backgroundColor = `rgba(0, 0, 0, 0.5)`;
  }

  componentWillUnmount() {
    MODAL_ROOT.style.display = 'none';
    MODAL_ROOT.style.backgroundColor = `transparent`;
  }

  static isVisible = () => {
    return MODAL_ROOT.childElementCount > 0;
  };

  render() {
    return ReactDom.createPortal(this.props.children, MODAL_ROOT);
  }
}