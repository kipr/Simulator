import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import {
  cloneMatPlayAreaShape,
  cloneMatPlayZone,
  insertMatPlayAreaPointAfter,
  MatPlayAreaShape,
  MatPlayZone,
  matPlayAreaOutlinePathD,
  matLocalToWorldCm,
  matPlayAreaPointList,
  detachSimulatorControls,
  pickMatLocalFromClient,
  projectWorldCmToSimulatorOverlay,
  restoreSimulatorControls,
  subscribeSimulatorOverlayRepaint,
  simulatorProjectionReady,
  syncMatPlayZoneSurfaceMeshes,
  translateMatPlayAreaShape,
  updateMatPlayAreaPoint,
  ZONE_DISPLAY_COLORS,
} from '../../util/jbcMatPlayArea';
import {
  setMatZoneEditSession,
  updateMatZoneEditSession,
} from '../../util/matZoneEditSession';
import { RawVector2 } from '../../util/math/math';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';

const SIMULATOR_AREA_ID = 'simulator-area-root';

const OverlayRoot = styled('div', {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 20,
  overflow: 'visible',
});

const PointHandle = styled('div', (props: ThemeProps & { $active?: boolean }) => ({
  position: 'absolute',
  width: props.$active ? '16px' : '14px',
  height: props.$active ? '16px' : '14px',
  marginLeft: props.$active ? '-8px' : '-7px',
  marginTop: props.$active ? '-8px' : '-7px',
  borderRadius: '50%',
  border: `2px solid ${props.theme.color}`,
  backgroundColor: props.$active ? 'rgba(255, 235, 59, 0.95)' : 'rgba(76, 175, 80, 0.95)',
  boxShadow: '0 0 6px rgba(0,0,0,0.6)',
  cursor: 'grab',
  pointerEvents: 'auto',
  touchAction: 'none',
  zIndex: 25,
}));

type ScreenPoint = { x: number; y: number };

type DragState =
  | {
    type: 'move';
    zoneId: string;
    startMat: RawVector2;
    startShape: MatPlayAreaShape;
  }
  | {
    type: 'point';
    zoneId: string;
    pointIndex: number;
    startShape: MatPlayAreaShape;
  };

function isValidScreenPoint(p: { x: number; y: number } | null | undefined): p is ScreenPoint {
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

function projectShapeToScreen(
  shape: MatPlayAreaShape,
  simRoot: HTMLElement
): ScreenPoint[] | null {
  const projected = matPlayAreaPointList(shape).map(local => {
    const world = matLocalToWorldCm(local);
    return projectWorldCmToSimulatorOverlay(world, simRoot);
  });

  if (!projected.every(isValidScreenPoint)) {
    return null;
  }
  return projected ;
}

export interface MatZoneEditOverlayProps extends ThemeProps {
  locale: LocalizedString.Language;
  active: boolean;
  zones: MatPlayZone[];
  activeZoneId: string;
  onZoneShapeChange: (zoneId: string, shape: MatPlayAreaShape) => void;
  /** When false, zones are shown but not draggable (success/failure steps). */
  interactive?: boolean;
}

const MatZoneEditOverlay: React.FC<MatZoneEditOverlayProps> = ({
  theme,
  locale,
  active,
  zones,
  activeZoneId,
  onZoneShapeChange,
  interactive = true,
}) => {
  const [screenByZone, setScreenByZone] = React.useState<
  Record<string, { pts: ScreenPoint[]; edgeMode: MatPlayAreaShape['edgeMode'] }>
  >({});
  const [simReady, setSimReady] = React.useState(false);

  const localZonesRef = React.useRef<MatPlayZone[]>(zones.map(cloneMatPlayZone));
  const onChangeRef = React.useRef(onZoneShapeChange);
  const dragRef = React.useRef<DragState | null>(null);
  const zonePathRefs_ = React.useRef<Record<string, SVGPathElement | null>>({});

  onChangeRef.current = onZoneShapeChange;

  React.useEffect(() => {
    if (!dragRef.current) {
      localZonesRef.current = zones.map(cloneMatPlayZone);
    }
  }, [zones]);

  React.useEffect(() => {
    zonePathRefs_.current = {};
  }, [zones]);

  const getSimRoot_ = (): HTMLElement | null =>
    document.getElementById(SIMULATOR_AREA_ID);

  const paintZones_ = React.useCallback((zoneList: MatPlayZone[], force = false) => {
    if (!simulatorProjectionReady()) return;

    const simRoot = getSimRoot_();
    if (!simRoot) return;

    const simRect = simRoot.getBoundingClientRect();
    if (simRect.width <= 0 || simRect.height <= 0) return;

    const next: Record<string, { pts: ScreenPoint[]; edgeMode: MatPlayAreaShape['edgeMode'] }> =
      {};
    for (const zone of zoneList) {
      const pts = projectShapeToScreen(zone.shape, simRoot);
      if (pts) {
        next[zone.id] = { pts, edgeMode: zone.shape.edgeMode };
        const pathD = matPlayAreaOutlinePathD(pts, zone.shape.edgeMode);
        zonePathRefs_.current[zone.id]?.setAttribute('d', pathD);
      }
    }

    setScreenByZone(prev => {
      if (force) {
        return next;
      }
      const prevKeys = Object.keys(prev).sort()
        .join();
      const nextKeys = Object.keys(next).sort()
        .join();
      if (prevKeys !== nextKeys) {
        return next;
      }
      for (const id of Object.keys(next)) {
        const a = prev[id]?.pts ?? [];
        const b = next[id]?.pts ?? [];
        if (a.length !== b.length) {
          return next;
        }
        for (let i = 0; i < a.length; i++) {
          if (
            Math.abs(a[i].x - b[i].x) > 0.25 ||
            Math.abs(a[i].y - b[i].y) > 0.25
          ) {
            return next;
          }
        }
      }
      return prev;
    });
  }, []);

  const syncSurfaceMeshes_ = React.useCallback((zoneList: MatPlayZone[]) => {
    syncMatPlayZoneSurfaceMeshes(zoneList);
  }, []);

  const setZoneShape_ = (zoneId: string, shape: MatPlayAreaShape) => {
    const cloned = cloneMatPlayAreaShape(shape);
    localZonesRef.current = localZonesRef.current.map(z =>
      (z.id === zoneId ? { ...z, shape: cloned } : z)
    );
    syncSurfaceMeshes_(localZonesRef.current);
    paintZones_(localZonesRef.current, true);
    return cloned;
  };

  const endDrag_ = (drag: DragState | null) => {
    dragRef.current = null;
    restoreSimulatorControls();
    if (drag) {
      const zone = localZonesRef.current.find(z => z.id === drag.zoneId);
      if (zone) {
        onChangeRef.current(drag.zoneId, cloneMatPlayAreaShape(zone.shape));
      }
    }
    paintZones_(localZonesRef.current);
  };

  const startPointerDrag_ = (
    drag: DragState,
    onMove: (ev: PointerEvent) => void
  ) => {
    detachSimulatorControls();
    dragRef.current = drag;

    const onUp = () => {
      const current = dragRef.current;
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
      endDrag_(current);
    };

    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
  };

  React.useEffect(() => {
    if (!active || !interactive) {
      setMatZoneEditSession(null);
      return;
    }
    setMatZoneEditSession({
      active: true,
      zones,
      activeZoneId,
      onZoneShapeChange: (zoneId, shape) => onChangeRef.current(zoneId, shape),
    });
    return () => setMatZoneEditSession(null);
  }, [active, interactive]);

  React.useEffect(() => {
    if (!active || !interactive) return;
    updateMatZoneEditSession({ zones, activeZoneId });
  }, [active, interactive, zones, activeZoneId]);

  React.useEffect(() => {
    if (!active) {
      syncMatPlayZoneSurfaceMeshes([]);
      setScreenByZone({});
      setSimReady(false);
      restoreSimulatorControls();
      return;
    }

    localZonesRef.current = zones.map(cloneMatPlayZone);

    let hasPainted = false;
    const tryPaint_ = (): boolean => {
      if (!getSimRoot_()) return false;
      if (!interactive) {
        syncSurfaceMeshes_(localZonesRef.current);
        setSimReady(true);
        hasPainted = true;
        return true;
      }
      if (!simulatorProjectionReady()) return false;
      if (dragRef.current) return hasPainted;
      paintZones_(localZonesRef.current);
      setSimReady(true);
      hasPainted = true;
      return true;
    };

    const onLayout = () => {
      tryPaint_();
    };
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, true);

    let raf = 0;
    const scheduleRepaint = () => {
      if (tryPaint_()) {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
        return;
      }
      raf = window.requestAnimationFrame(scheduleRepaint);
    };

    // Repaint whenever the camera or canvas changes so outlines stay on the mat.
    const detachRepaint = subscribeSimulatorOverlayRepaint(() => {
      if (!dragRef.current) {
        tryPaint_();
      }
    });

    raf = window.requestAnimationFrame(scheduleRepaint);

    return () => {
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout, true);
      detachRepaint();
      if (raf) window.cancelAnimationFrame(raf);
      zonePathRefs_.current = {};
      syncMatPlayZoneSurfaceMeshes([]);
      if (dragRef.current) {
        dragRef.current = null;
        restoreSimulatorControls();
      }
    };
  }, [active, interactive, paintZones_, syncSurfaceMeshes_, zones]);

  React.useEffect(() => {
    if (!active) return;
    syncSurfaceMeshes_(zones.map(cloneMatPlayZone));
  }, [active, syncSurfaceMeshes_, zones]);

  const onMoveZonePointerDown_ = (e: React.PointerEvent) => {
    const activeZone =
      localZonesRef.current.find(z => z.id === activeZoneId) ??
      localZonesRef.current[0];
    if (!activeZone) return;

    const picked = pickMatLocalFromClient(e.clientX, e.clientY);
    if (!picked) return;

    e.preventDefault();
    e.stopPropagation();

    const moveDrag: DragState = {
      type: 'move',
      zoneId: activeZone.id,
      startMat: picked,
      startShape: cloneMatPlayAreaShape(activeZone.shape),
    };

    startPointerDrag_(moveDrag, ev => {
      const drag = dragRef.current;
      if (!drag || drag.type !== 'move') return;

      const at = pickMatLocalFromClient(ev.clientX, ev.clientY);
      if (!at) return;

      const delta: RawVector2 = {
        x: at.x - drag.startMat.x,
        y: at.y - drag.startMat.y,
      };
      setZoneShape_(drag.zoneId, translateMatPlayAreaShape(drag.startShape, delta));
    });
  };

  const onPointPointerDown_ = (pointIndex: number) => (e: React.PointerEvent) => {
    const activeZone =
      localZonesRef.current.find(z => z.id === activeZoneId) ??
      localZonesRef.current[0];
    if (!activeZone) return;

    e.preventDefault();
    e.stopPropagation();

    const pointDrag: DragState = {
      type: 'point',
      zoneId: activeZone.id,
      pointIndex,
      startShape: cloneMatPlayAreaShape(activeZone.shape),
    };

    startPointerDrag_(pointDrag, ev => {
      const drag = dragRef.current;
      if (!drag || drag.type !== 'point') return;

      const picked = pickMatLocalFromClient(ev.clientX, ev.clientY);
      if (!picked) return;

      const next = updateMatPlayAreaPoint(
        drag.startShape,
        drag.pointIndex,
        picked
      );
      setZoneShape_(drag.zoneId, next);
    });
  };

  const onEdgeDoubleClick_ = (e: React.MouseEvent<SVGPathElement>) => {
    const activeZone =
      localZonesRef.current.find(z => z.id === activeZoneId) ??
      localZonesRef.current[0];
    if (!activeZone || !interactive) return;

    const screen = screenByZone[activeZone.id];
    if (!screen || screen.pts.length < 3) return;

    const simRoot = getSimRoot_();
    if (!simRoot) return;
    const rect = simRoot.getBoundingClientRect();
    const click = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    let bestEdge = 0;
    let bestDist = Infinity;
    const n = screen.pts.length;
    for (let i = 0; i < n; i++) {
      const a = screen.pts[i];
      const b = screen.pts[(i + 1) % n];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy || 1;
      const t = Math.max(
        0,
        Math.min(1, ((click.x - a.x) * dx + (click.y - a.y) * dy) / lenSq)
      );
      const px = a.x + t * dx;
      const py = a.y + t * dy;
      const dist = Math.hypot(click.x - px, click.y - py);
      if (dist < bestDist) {
        bestDist = dist;
        bestEdge = i;
      }
    }

    if (bestDist > 24) return;

    const next = insertMatPlayAreaPointAfter(activeZone.shape, bestEdge);
    const cloned = setZoneShape_(activeZone.id, next);
    onChangeRef.current(activeZone.id, cloned);
  };

  if (!active || !simReady) {
    return null;
  }

  const simRoot = getSimRoot_();
  if (!simRoot) {
    return null;
  }

  const activeZone =
    localZonesRef.current.find(z => z.id === activeZoneId) ??
    localZonesRef.current[0];
  const activeScreen = activeZone ? screenByZone[activeZone.id] : undefined;
  if (!interactive) {
    return null;
  }

  return ReactDOM.createPortal(
    <OverlayRoot>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <g>
          {localZonesRef.current.map((zone, zoneIndex) => {
            const screen = screenByZone[zone.id];
            if (!screen || screen.pts.length < 3) return null;
            const colors = ZONE_DISPLAY_COLORS[zoneIndex % ZONE_DISPLAY_COLORS.length];
            const isActive = activeZone !== null && zone.id === activeZone.id;
            const pathD = matPlayAreaOutlinePathD(screen.pts, screen.edgeMode);

            if (!isActive || !interactive) {
              return (
                <path
                  key={zone.id}
                  ref={el => {
                    zonePathRefs_.current[zone.id] = el;
                  }}
                  d={pathD}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={isActive ? 3 : 2}
                  strokeDasharray={isActive ? undefined : '6 4'}
                />
              );
            }

            return (
              <path
                key={zone.id}
                ref={el => {
                  zonePathRefs_.current[zone.id] = el;
                }}
                d={pathD}
                fill="rgba(0, 0, 0, 0)"
                stroke="rgba(76, 175, 80, 0.95)"
                strokeWidth={4}
                style={{ cursor: 'grab', pointerEvents: 'auto' }}
                onPointerDown={onMoveZonePointerDown_}
                onDoubleClick={onEdgeDoubleClick_}
              >
                <title>
                  {LocalizedString.lookup(
                    tr('Drag to move. Double-click an edge to add a point.'),
                    locale
                  )}
                </title>
              </path>
            );
          })}
        </g>
      </svg>
      {interactive &&
        activeScreen?.pts.map((pt, index) => (
          <PointHandle
            key={`${activeZone?.id ?? 'zone'}-pt-${index}`}
            theme={theme}
            $active
            style={{ left: pt.x, top: pt.y }}
            title={LocalizedString.lookup(tr('Drag to move this point'), locale)}
            onPointerDown={onPointPointerDown_(index)}
          />
        ))}
    </OverlayRoot>,
    simRoot
  );
};

export default MatZoneEditOverlay;
