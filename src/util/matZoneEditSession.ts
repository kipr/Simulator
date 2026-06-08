import {
  cloneMatPlayAreaShape,
  MatPlayAreaCorners,
  MatPlayAreaShape,
  matPlayAreaCornerList,
  MatPlayZone,
} from './jbcMatPlayArea';

export interface MatZoneEditSession {
  active: boolean;
  zones: MatPlayZone[];
  activeZoneId: string;
  onZoneShapeChange: (zoneId: string, shape: MatPlayAreaShape) => void;
}

type Listener = () => void;

let session: MatZoneEditSession | null = null;
const listeners = new Set<Listener>();

export function getMatZoneEditSession(): MatZoneEditSession | null {
  return session;
}

export function isMatZoneEditActive(): boolean {
  return session?.active === true;
}

export function setMatZoneEditSession(next: MatZoneEditSession | null): void {
  session = next;
  listeners.forEach(fn => fn());
}

export function updateMatZoneEditSession(
  patch: Partial<Pick<MatZoneEditSession, 'zones' | 'activeZoneId'>>
): void {
  if (!session) return;
  session = { ...session, ...patch };
  listeners.forEach(fn => fn());
}

export function subscribeMatZoneEditSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Update shape immediately so the overlay can repaint during drag (before React setState). */
export function patchMatZoneShape(zoneId: string, shape: MatPlayAreaShape): void {
  if (!session) return;
  session = {
    ...session,
    zones: session.zones.map(z =>
      (z.id === zoneId ? { ...z, shape: cloneMatPlayAreaShape(shape) } : z)
    ),
  };
  listeners.forEach(fn => fn());
}

/** Persist dragged shape to the wizard (session is already patched during drag). */
export function commitMatZoneShapeToWizard(zoneId: string, shape: MatPlayAreaShape): void {
  if (!session) return;
  session.onZoneShapeChange(zoneId, shape);
}

/** @deprecated Use {@link patchMatZoneShape}. */
export function patchMatZoneCorners(zoneId: string, corners: MatPlayAreaCorners): void {
  patchMatZoneShape(zoneId, {
    points: matPlayAreaCornerList(corners),
    edgeMode: 'straight',
  });
}

/** @deprecated Use {@link commitMatZoneShapeToWizard}. */
export function commitMatZoneCornersToWizard(
  zoneId: string,
  corners: MatPlayAreaCorners
): void {
  commitMatZoneShapeToWizard(zoneId, {
    points: matPlayAreaCornerList(corners),
    edgeMode: 'straight',
  });
}
