import * as React from 'react';

interface CollapsibleProps {
    title: string;
}

interface CollapsibleState {
    open: boolean;
}

export default class Collapsible extends React.Component<CollapsibleProps, CollapsibleState> {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
		};
		this.togglePanel = this.togglePanel.bind(this);
	}

	togglePanel(e) {
        this.setState(prevState => ({
            open: !prevState.open,
        }));
	}

	componentDidUpdate() {

	}

	render() {
		return (
            <div>
                <div onClick={this.togglePanel} className='header'>{this.props.title}</div>
                {this.state.open ? (
                    <div className='content'>
                        {this.props.children}
                    </div>
                ) : null}
            </div>
        );
	}
}