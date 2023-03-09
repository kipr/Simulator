import * as React from 'react';
import * as ReactDom from 'react-dom';


import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import { Provider as ReduxProvider } from 'react-redux';
import store from '../../state';
import PluginPage from './PluginPage';
import { courseId, setCourseId, setGapiInitialized } from './globals';

const reactRoot = document.getElementById('reactRoot');

const engine = new Styletron({ prefix: 'style' });


const initializeGapiClient = async () => {
  await gapi.client.init({
    apiKey: 'AIzaSyCuSBzNumuFyeOzAhnSEslWIgdgVqKR7z0',
    scope: 'https://www.googleapis.com/auth/classroom.coursework.me',
    discoveryDocs: ['https://classroom.googleapis.com/$discovery/rest?version=v1'],
    clientId: '705985154569-oeqkm4u0hdhjsa1s3qi05l39eci594sp.apps.googleusercontent.com',
  });

  setGapiInitialized(true);
};

gapi.load('client', initializeGapiClient);

ReactDom.render(
  <StyletronProvider value={engine} debugAfterHydration>
    <ReduxProvider store={store}>
      <PluginPage />
    </ReduxProvider>
  </StyletronProvider>,
  reactRoot
);

window.onmessage = (e) => {
  try {
    if (e.data.type === 'set-course-id') {
      setCourseId(e.data.id);
      console.log('set course id', e.data.id);
    }
  } catch (err) {
    console.log(err);
  }
};