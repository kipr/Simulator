import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import {
  matLocalToWorldCm,
  MatPlayAreaShape,
  matPlayAreaOutlinePathD,
  matPlayAreaPointList,
  MatPlayZone,
  pickMatLocalFromClient,
  projectWorldCmToSimulatorOverlay,
  detachSimulatorControls,
  restoreSimulatorControls,
  subscribeSimulatorOverlayRepaint,
  updateMatPlayAreaPoint,
  ZONE_DISPLAY_COLORS,
} from '../../util/jbcMatPlayArea';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';

const SIMULATOR_AREA_ID = 'simulator-area-root';
const BODY_OVERLAY_ROOT_ID = 'mat-play-zone-overlay-root';

export interface JbcMatPlayZonesOverlayProps extends ThemeProps {
  locale: LocalizedString.Language;
  active: boolean;
  zones: MatPlayZone[];
  activeZoneId: string | null;
  onZoneShapeChange: (zoneId: string, shape: MatPlayAreaShape) => void;
}

interface SimulatorBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OverlayRoot = styled('div', {
  position: 'fixed',
  pointerEvents: 'none',
});

const SvgLayer = styled('svg', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'visible',
  pointerEvents: 'none',
});

const Handle = styled('div', (props: ThemeProps & { $stroke: string }) => ({
  position: 'absolute',
  width: '24px',
  height: '24px',
  marginLeft: '-12px',
  marginTop: '-12px',
  borderRadius: '50%',
  border: `2px solid ${props.theme.color}`,
  backgroundColor: props.$stroke,
  cursor: 'grab',
  pointerEvents: 'auto',
  touchAction: 'none',
  zIndex: 2,
  boxShadow: '0 0 8px rgba(0,0,0,0.55)',
  ':active': {
    cursor: 'grabbing',
  },
}));

function screenPointsEqual(
  a: ({ x: number; y: number } | null)[],
  b: ({ x: number; y: number } | null)[]
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i];
    if (p === null && q === null) continue;
    if (p === null || q === null) return false;
    if (Math.abs(p.x - q.x) > 0.5 || Math.abs(p.y - q.y) > 0.5) return false;
  }
  return true;
}

const JbcMatPlayZonesOverlay: React.FC<JbcMatPlayZonesOverlayProps> = ({
  theme,
  locale,
  active,
  zones,
  activeZoneId,
  onZoneShapeChange,
}) => {
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);
  const [bounds, setBounds] = React.useState<SimulatorBounds | null>(null);
  const [screenByZone, setScreenByZone] = React.useState<
  Record<string, ({ x: number; y: number } | null)[]>
  >({});
  const [edgeModeByZone, setEdgeModeByZone] = React.useState<
  Record<string, MatPlayAreaShape['edgeMode']>
  >({});
  const dragRef = React.useRef<{ zoneId: string; index: number } | null>(null);
  const zonesRef = React.useRef(zones);
  const onZoneShapeChangeRef = React.useRef(onZoneShapeChange);
  const screenByZoneRef = React.useRef(screenByZone);

  zonesRef.current = zones;
  onZoneShapeChangeRef.current = onZoneShapeChange;
  screenByZoneRef.current = screenByZone;

  const refreshLayout_ = React.useCallback(() => {
    const simRoot = document.getElementById(SIMULATOR_AREA_ID);
    if (!simRoot) {
      setBounds(null);
      if (Object.keys(screenByZoneRef.current).length > 0) {
        setScreenByZone({});
      }
      return;
    }

    const rect = simRoot.getBoundingClientRect();
    const nextBounds: SimulatorBounds = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
    setBounds(prev =>
      (prev &&
        prev.top === nextBounds.top &&
        prev.left === nextBounds.left &&
        prev.width === nextBounds.width &&
        prev.height === nextBounds.height
        ? prev
        : nextBounds)
    );

    const next: Record<string, ({ x: number; y: number } | null)[]> = {};
    const modes: Record<string, MatPlayAreaShape['edgeMode']> = {};
    for (const zone of zonesRef.current) {
      const list = matPlayAreaPointList(zone.shape);
      modes[zone.id] = zone.shape.edgeMode;
      next[zone.id] = list.map(local => {
        const world = matLocalToWorldCm(local);
        return projectWorldCmToSimulatorOverlay(world, simRoot);
      });
    }
    setEdgeModeByZone(modes);

    const prev = screenByZoneRef.current;
    let changed = Object.keys(next).length !== Object.keys(prev).length;
    if (!changed) {
      for (const id of Object.keys(next)) {
        if (!screenPointsEqual(next[id], prev[id] ?? [])) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      setScreenByZone(next);
    }
  }, []);

  React.useEffect(() => {
    if (!active) return;

    let el = document.getElementById(BODY_OVERLAY_ROOT_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = BODY_OVERLAY_ROOT_ID;
      document.body.appendChild(el);
    }
    setPortalRoot(el);
    detachSimulatorControls();

    refreshLayout_();

    const detachRepaint = subscribeSimulatorOverlayRepaint(() => {
      refreshLayout_();
    });

    const onResize = () => refreshLayout_();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    return () => {
      detachRepaint();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      restoreSimulatorControls();
      if (el?.parentElement && el.childElementCount === 0) {
        el.remove();
      }
    };
  }, [active, refreshLayout_]);

  const onPointerDown_ = (zoneId: string, index: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const handle = e.currentTarget as HTMLElement;
    handle.setPointerCapture(e.pointerId);
    dragRef.current = { zoneId, index };

    const onMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const local = pickMatLocalFromClient(ev.clientX, ev.clientY);
      if (!local) return;

      const zone = zonesRef.current.find(z => z.id === drag.zoneId);
      if (!zone) return;

      const next = updateMatPlayAreaPoint(zone.shape, drag.index, local);
      onZoneShapeChangeRef.current(drag.zoneId, next);
    };

    const onUp = (ev: PointerEvent) => {
      dragRef.current = null;
      try {
        handle.releasePointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  if (!active || !portalRoot || !bounds || bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }

  const activeZone = zones.find(z => z.id === activeZoneId) ?? zones[0];

  return ReactDOM.createPortal(
    <OverlayRoot
      style={{
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
        zIndex: 100,
      }}
    >
      <SvgLayer>
        {zones.map((zone, zoneIndex) => {
          const pts = screenByZone[zone.id];
          if (!pts?.every(p => p !== null)) return null;
          const colors = ZONE_DISPLAY_COLORS[zoneIndex % ZONE_DISPLAY_COLORS.length];
          const isActive = zone.id === activeZone?.id;
          const screenPts = pts.filter(
            (p): p is { x: number; y: number } => p !== null
          );
          const pathD = matPlayAreaOutlinePathD(
            screenPts,
            edgeModeByZone[zone.id] ?? 'straight'
          );
          return (
            <path
              key={zone.id}
              d={pathD}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={isActive ? 3 : 1.5}
              strokeDasharray={isActive ? undefined : '6 4'}
            />
          );
        })}
      </SvgLayer>
      {activeZone &&
        (screenByZone[activeZone.id] ?? []).map((pt, index) => {
          const zoneIndex = zones.findIndex(z => z.id === activeZone.id);
          const stroke =
            ZONE_DISPLAY_COLORS[zoneIndex % ZONE_DISPLAY_COLORS.length]?.stroke ??
            'rgba(76, 175, 80, 0.95)';
          return pt ? (
            <Handle
              key={`${activeZone.id}-pt-${index}`}
              theme={theme}
              $stroke={stroke}
              style={{ left: pt.x, top: pt.y }}
              title={LocalizedString.lookup(
                tr('Drag to adjust this area point'),
                locale
              )}
              onPointerDown={onPointerDown_(activeZone.id, index)}
            />
          ) : null;
        })}
    </OverlayRoot>,
    portalRoot
  );
};

export default JbcMatPlayZonesOverlay;
