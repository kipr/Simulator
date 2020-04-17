import * as React from 'react';
import { StyleProps } from './style';

export interface StaticProps extends StyleProps {}

type Props = StaticProps;

export class Static extends React.Component<Props> {
    render() {
        const { props } = this;
        const {
            className,
            style
        } = props;

        return (
            <svg width={1440} height={960}>
              <rect width="100%" height="100%" fill="LightBlue" className="foam-border"/>
              <rect width="1420" height="920" fill="LightGray" y="20" className="ground"/>
              <svg width="960" height="480" x="240" y="240" className="mat-surface">
                  <image width="100%" href="static/Surface-A.png"/>
              </svg>
            </svg>
        )
    }
}