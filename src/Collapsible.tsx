import * as React from 'react';

export default class Collapsible extends React.Component {
	private open;
	private title;
	constructor(props) {
		super(props);
		this.state = {
			open: this.open
		}
		this.togglePanel = this.togglePanel.bind(this);
	}

	togglePanel(e) {
		this.setState({open: !this.open});
		this.open = !this.open;
	}

	componentDidUpdate() {

	}

	render() {
		return (<div>
			<div onClick={(e) => this.togglePanel(e)} className='header'>Cans</div>
			{this.open ? (
				<div className='content'>
					{this.props.children}
				</div>
			) : null}
		</div>);
	}
}