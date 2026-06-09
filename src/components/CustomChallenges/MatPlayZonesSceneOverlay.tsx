import * as React from 'react';
import { ThemeProps } from '../constants/theme';
import Scene from '../../state/State/Scene';
import LocalizedString from '../../util/LocalizedString';
import { MatPlayAreaShape, matPlayZonesFromScene } from '../../util/jbcMatPlayArea';
import MatZoneEditOverlay from './MatZoneEditOverlay';

const readOnlyZoneShapeChange = (_zoneId: string, _shape: MatPlayAreaShape): void => {
  void _zoneId;
  void _shape;
};

export interface MatPlayZonesSceneOverlayProps extends ThemeProps {
  locale: LocalizedString.Language;
  scene: Scene | undefined;
}

/** Read-only play-area outlines for a saved custom-challenge scene (scene or challenge view). */
const MatPlayZonesSceneOverlay: React.FC<MatPlayZonesSceneOverlayProps> = ({
  theme,
  locale,
  scene,
}) => {
  const zones = React.useMemo(
    () => (scene ? matPlayZonesFromScene(scene) : []),
    [scene]
  );

  if (zones.length === 0) {
    return null;
  }

  return (
    <MatZoneEditOverlay
      theme={theme}
      locale={locale}
      active
      interactive={false}
      zones={zones}
      activeZoneId={zones[0]?.id ?? ''}
      onZoneShapeChange={readOnlyZoneShapeChange}
    />
  );
};

export default MatPlayZonesSceneOverlay;
