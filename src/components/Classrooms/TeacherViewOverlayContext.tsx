import * as React from 'react';

export type TeacherViewOverlayContextValue = {
  beginOverlay: () => void;
  endOverlay: () => void;
};

export const TeacherViewOverlayContext = React.createContext<TeacherViewOverlayContextValue | null>(null);

/**
 * Wraps teacher dashboard content so tab views can signal when a modal is open
 * (e.g. to blur classroom card actions on the same screen).
 */
export function TeacherViewOverlayProvider({
  children,
  onDepthChange,
}: {
  children: React.ReactNode;
  onDepthChange: (depth: number) => void;
}) {
  const depthRef = React.useRef(0);
  const onDepthChangeRef = React.useRef(onDepthChange);
  onDepthChangeRef.current = onDepthChange;

  const value = React.useMemo((): TeacherViewOverlayContextValue => ({
    beginOverlay: () => {
      depthRef.current += 1;
      onDepthChangeRef.current(depthRef.current);
    },
    endOverlay: () => {
      depthRef.current = Math.max(0, depthRef.current - 1);
      onDepthChangeRef.current(depthRef.current);
    },
  }), []);

  return (
    <TeacherViewOverlayContext.Provider value={value}>
      {children}
    </TeacherViewOverlayContext.Provider>
  );
}

/** When `isOpen` is true, increments the teacher-view overlay depth until it becomes false or the component unmounts. */
export function useTeacherViewOverlayEffect(isOpen: boolean): void {
  const ctx = React.useContext(TeacherViewOverlayContext);
  React.useEffect(() => {
    if (!ctx || !isOpen) return;
    ctx.beginOverlay();
    return () => {
      ctx.endOverlay();
    };
  }, [ctx, isOpen]);
}
