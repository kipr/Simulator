import * as React from 'react';
import { styled } from 'styletron-react';

import Scene from '../state/State/Scene';
import { StyleProps } from '../style';
import LocalizedString from '../util/LocalizedString';
import Field from './Field';
import Input from './Input';
import { ThemeProps } from './theme';

import tr from '@i18n';

import { connect } from 'react-redux';

import { State as ReduxState } from '../state';

export interface SceneSettingsPublicProps extends StyleProps, ThemeProps {
  scene: Scene;
  onSceneChange: (scene: Scene) => void;
}

interface SceneSettingsPrivateProps {
  locale: LocalizedString.Language;
}

type Props = SceneSettingsPublicProps & SceneSettingsPrivateProps;

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

class SceneSettings extends React.Component<Props> {
  private onNameChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { props } = this;
    const { scene, onSceneChange, locale } = props;

    onSceneChange({
      ...scene,
      name: {
        ...(scene.name || {}),
        [locale]: event.currentTarget.value
      }
    });
  };
  
  private onDescriptionChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { props } = this;
    const { scene, onSceneChange, locale } = props;

    onSceneChange({
      ...scene,
      description: {
        ...(scene.description || {}),
        [locale]: event.currentTarget.value
      }
    });
  };

  render() {
    const { props } = this;

    const { scene, style, className, theme, locale } = props;

    return (
      <Container className={className} style={style}>
        <Field name={LocalizedString.lookup(tr('Name'), locale)} theme={theme}>
          <Input
            theme={theme}
            value={LocalizedString.lookup(scene.name, locale)}
            onChange={this.onNameChange_}
          />
        </Field>
        <Field name={LocalizedString.lookup(tr('Description'), locale)} theme={theme}>
          <Input
            theme={theme}
            value={LocalizedString.lookup(scene.description, locale)}
            onChange={this.onDescriptionChange_}
          />
        </Field>
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(SceneSettings) as React.ComponentType<SceneSettingsPublicProps>;