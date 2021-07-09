import * as React from 'react';
import * as ReactDom from 'react-dom';
import { StyleProps } from '../style';

export namespace Portal {

  export interface SinkProps extends StyleProps {
  }

  export class Sink extends React.PureComponent<SinkProps> {    
    constructor(props: SinkProps) {
      super(props);
    }

    private ref_: HTMLDivElement;
    private bindRef_ = (ref: HTMLDivElement) => {
      this.ref_ = ref;
    };

    get ref() {
      return this.ref_; 
    }
    
    render() {
      const { props } = this;
      const { style, className } = props;
      return <div style={style} className={className} ref={this.bindRef_} />;
    }
  }

  export interface SourceProps {
    sink: Portal.Sink;
    children: React.ReactNode;
  }
  
  export class Source extends React.PureComponent<SourceProps> {
    render() {
      const { props } = this;
      const { sink, children } = props;
      return ReactDom.createPortal(children, sink ? sink.ref : document.getElementById('swap'));
    }
  }
}