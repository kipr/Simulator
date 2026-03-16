import React from "react";
import { TourRegistry } from "../../tours/TourRegistry";

type Props = {
  registry: TourRegistry;
  targetKey: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export class TourTarget extends React.PureComponent<Props> {
  private wrapperEl: HTMLDivElement | null = null;

  private setRef = (node: HTMLDivElement | null) => {
    this.wrapperEl = node;
  };

  private getMeasuredElement(): HTMLElement | null {
    if (!this.wrapperEl) return null;

    const firstChild = this.wrapperEl.firstElementChild;
    if (firstChild instanceof HTMLElement) {
      return firstChild;
    }

    return this.wrapperEl;
  }

  componentDidMount() {
    this.props.registry.register(this.props.targetKey, this.getMeasuredElement());
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.targetKey !== this.props.targetKey) {
      this.props.registry.register(prevProps.targetKey, null);
    }
    this.props.registry.register(this.props.targetKey, this.getMeasuredElement());
  }

  componentWillUnmount() {
    this.props.registry.register(this.props.targetKey, null);
  }

  render() {
    return (
      <div
        ref={this.setRef}
        className={this.props.className}
        style={this.props.style}
      >
        {this.props.children}
      </div>
    );
  }
}