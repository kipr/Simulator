import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface ModalProps {
  children: React.ReactNode;
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
    MODAL_ROOT.style.backgroundColor = `rgba(0, 0, 0, 0.1)`;
    MODAL_ROOT.style.pointerEvents = 'auto';
    MODAL_ROOT.style.opacity = '1';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (MODAL_ROOT.style as any).backdropFilter = `blur(8px)`;
  }

  componentWillUnmount() {
    MODAL_ROOT.style.backgroundColor = `transparent`;
    MODAL_ROOT.style.pointerEvents = 'none';
    MODAL_ROOT.style.opacity = '0';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (MODAL_ROOT.style as any).backdropFilter = `none`;

  }

  static isVisible = () => {
    return MODAL_ROOT.childElementCount > 0;
  };

  render() {
    return ReactDom.createPortal(this.props.children, MODAL_ROOT);
  }
}