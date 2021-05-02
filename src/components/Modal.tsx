import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface ModalProps {
  children: any;
}

type Props = ModalProps;

const modalRoot = document.getElementById('modal-root');

export class Modal extends React.PureComponent<Props> {
  static get active() { return modalRoot.children.length !== 0; }

  private element_: HTMLDivElement;

  constructor(props?: Props) {
    super(props);

    this.element_ = document.createElement('div');
  }

  componentDidMount() {
    modalRoot.style.display = 'block';
    modalRoot.appendChild(this.element_);
  }

  componentWillUnmount() {
    modalRoot.style.display = 'none';
    modalRoot.removeChild(this.element_);
  }

  static isVisible = () => {
    return modalRoot.childElementCount > 0;
  };

  render() {
    return ReactDom.createPortal(this.props.children, this.element_);
  }
}