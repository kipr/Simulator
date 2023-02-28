import * as React from 'react';
import ReactLoading, { LoadingType } from 'react-loading';
import { styled } from 'styletron-react';

import tr from '@i18n';
import LocalizedString from '../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../state';

export interface LoadingPublicProps {
  message?: string
  errorMessage?: string
  color?: string
  width?: number | string // number of pixels in width, or string width. Default 150
  height?: number // number of pixels in height. Default 50
  type?: LoadingType
}

interface LoadingPrivateProps {
  locale: LocalizedString.Language;
}

type Props = LoadingPublicProps & LoadingPrivateProps;

const LoadingPage = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  paddingTop: '30vh',
});

const LoadingText = styled('div', {
  fontSize: '32px',
});

const LoadingErrorText = styled('div', (props: Props) => ({
  paddingTop: props.height ? 2 * props.height : '100px',
  fontSize: '20px',
  whiteSpace: 'pre-wrap'
}));

const Loading: React.FunctionComponent<Props> = (props) => {
  return (
    <LoadingPage>
      <LoadingText>
        {props.message ? props.message : LocalizedString.lookup(tr('Loading...'), props.locale)}
      </LoadingText>
      <ReactLoading 
        type={props.type ? props.type : 'balls'}
        width={props.width ? props.width : 150}
        height={props.height ? props.height : 50}
        color={props.color ? props.color : '#4b64ad'}
      />
      <LoadingErrorText height={props.height} locale={props.locale}>
        {props.errorMessage ? props.errorMessage : null}
      </LoadingErrorText>
    </LoadingPage>
  );
};

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(Loading) as React.ComponentType<LoadingPublicProps>;