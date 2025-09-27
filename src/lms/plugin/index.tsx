import * as React from 'react';
import { createRoot } from 'react-dom/client';


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

gapi.load('client', void initializeGapiClient);

if (!reactRoot) {
  throw new Error('Missing #reactRoot element');
}

const root = createRoot(reactRoot);
root.render(
  <StyletronProvider value={engine} debugAfterHydration>
    <ReduxProvider store={store}>
      <PluginPage />
    </ReduxProvider>
  </StyletronProvider>
);

window.onmessage = (e: MessageEvent<{ type: string; id: string }>) => {
  try {
    if (e.data.type === 'set-course-id') {
      setCourseId(e.data.id);
      console.log('set course id', e.data.id);
    }
  } catch (err) {
    console.log(err);
  }
};