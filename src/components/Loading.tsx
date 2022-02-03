import * as React from 'react';
import ReactLoading, { LoadingType } from 'react-loading';
import { styled } from 'styletron-react';

export interface LoadingProps {
  message?: string
  color?: string
  width?: number
  type?: LoadingType
}

const LoadingPage = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  paddingTop: '35vh',
});

const LoadingText = styled('div', {
  fontSize: '32px',
});

const Loading: React.FunctionComponent<LoadingProps> = (props) => {
  return (
    <LoadingPage>
      <LoadingText>
        {props.message ? props.message : 'Loading...'}
      </LoadingText>
      <ReactLoading 
        type={props.type ? props.type : 'balls'}
        width={props.width ? props.width : 150}
        color={props.color ? props.color : '#4b64ad'}
      />
    </LoadingPage>
  );
};

export default Loading;