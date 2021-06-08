import * as React from 'react';
import { SurfaceState, SurfaceStatePresets } from "../SurfaceState";

interface SurfaceConfigProps {
  surfaceState: SurfaceState;

  updateSurfaceAndReset: (surfaceState: SurfaceState) => void;
}

interface SurfaceConfigState{
  selectionValue: string;
}

type Props = SurfaceConfigProps;
type State = SurfaceConfigState;

export class SurfaceConfig extends React.Component<Props, State> {
  constructor(props: SurfaceConfigProps) {
    super(props);
    this.state = {
      selectionValue: SurfaceStatePresets.jbcA.surfaceName,
    };
  }

  private updateSurfaceAndReset = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === this.props.surfaceState.surfaceName) return;
    this.setState({ selectionValue: event.target.value });
    switch (event.target.value) {
      case SurfaceStatePresets.jbcB.surfaceName:
        this.props.updateSurfaceAndReset(SurfaceStatePresets.jbcB);
        break;
      case SurfaceStatePresets.jbcA.surfaceName:
      default:
        this.props.updateSurfaceAndReset(SurfaceStatePresets.jbcA);
        break;
    }
  };

  render(): React.ReactNode {
    return (
      <section>
        <h3>Surface Options</h3>
        <select value={this.state.selectionValue} onChange={this.updateSurfaceAndReset}>
          <option value={SurfaceStatePresets.jbcA.surfaceName} >JBC Surface A</option>
          <option value={SurfaceStatePresets.jbcB.surfaceName} >JBC Surface B</option>
        </select>
      </section>
    );
  }
}