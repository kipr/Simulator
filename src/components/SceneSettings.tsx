import * as React from 'react';
import { styled } from 'styletron-react';

import Scene from '../state/State/Scene';
import { StyleProps } from '../style';
import LocalizedString from '../util/LocalizedString';
import Field from './Field';
import Input from './Input';
import { ThemeProps } from './theme';

export interface SceneSettingsProps extends StyleProps, ThemeProps {
  scene: Scene;
  onSceneChange: (scene: Scene) => void;
}

type Props = SceneSettingsProps;

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

class SceneSettings extends React.Component<Props> {
  private onNameChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { props } = this;
    const { scene, onSceneChange } = props;

    onSceneChange({
      ...scene,
      name: { [LocalizedString.EN_US]: event.currentTarget.value }
    });
  };
  
  private onDescriptionChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { props } = this;
    const { scene, onSceneChange } = props;

    onSceneChange({
      ...scene,
      description: { [LocalizedString.EN_US]: event.currentTarget.value }
    });
  };

  render() {
    const { props } = this;

    const { scene, style, className, theme } = props;

    return (
      <Container className={className} style={style}>
        <Field name='Name' theme={theme}>
          <Input
            theme={theme}
            value={scene.name[LocalizedString.EN_US]}
            onChange={this.onNameChange_}
          />
        </Field>
        <Field name='Description' theme={theme}>
          <Input
            theme={theme}
            value={scene.description[LocalizedString.EN_US]}
            onChange={this.onDescriptionChange_}
          />
        </Field>
      </Container>
    );
  }
}

export default SceneSettings;