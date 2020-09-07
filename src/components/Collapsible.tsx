import * as React from 'react';

interface CollapsibleProps {
	title: string;
}

interface CollapsibleState {
	open: boolean;
}

type Props = CollapsibleProps;
type State = CollapsibleState;

export default class Collapsible extends React.Component<Props, State> {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
		};
		this.togglePanel = this.togglePanel.bind(this);
	}

	togglePanel() {
		this.setState(prevState => ({
			open: !prevState.open,
		}));
	}

	render() {
		return (
			<>
				<div onClick={this.togglePanel} className='header'>{this.props.title}</div>
				{this.state.open ? (
					<div className='content'>
						{this.props.children}
					</div>
				) : null}
			</>
		);
	}
}