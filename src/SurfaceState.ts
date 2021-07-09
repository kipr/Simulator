export interface SurfaceState{ 
  // Filename
  surfaceImage: string;

  // Inches
  surfaceWidth: number;
  surfaceHeight: number;

  // Display name
  surfaceName: string; 
}

export namespace SurfaceStatePresets{
  export const jbcA: SurfaceState = {
    surfaceImage: "static/Surface-A.png",
    surfaceWidth: 118,
    surfaceHeight: 59,
    surfaceName: "JBC Mat A"
  };

  export const jbcB: SurfaceState = {
    surfaceImage: "static/Surface-B.png",
    surfaceWidth: 118,
    surfaceHeight: 59,
    surfaceName: "JBC Mat B"
  };

  export const presets: SurfaceState[] = [jbcA, jbcB];
}