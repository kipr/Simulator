import {
  Color3,
  LinesMesh,
  MeshBuilder,
  Scene as BabylonScene,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { matLocalToWorldCm } from '../../util/jbcMatPlayArea';
import { RawVector2 } from '../../util/math/math';

const ROOT_NAME = 'playAreaRobotBoundsDebugRoot';
const LINE_LIFT_M = 0.002;

/** Footprint outlines for play-area debugging; intersection math is unchanged when false. */
export const PLAY_AREA_ROBOT_BOUNDS_DEBUG_VISIBLE = false;

const LINK_COLOR = new Color3(0.26, 0.65, 0.96);
const COMBINED_COLOR = new Color3(1, 0.6, 0);

export interface PlayAreaRobotBoundsDebugRobot {
  robotId: string;
  linkHulls: Array<{ linkId: string; hull: RawVector2[] }>;
  combinedHull: RawVector2[];
}

function hullToWorldLinePoints_(hull: RawVector2[]): Vector3[] {
  if (hull.length < 2) return [];
  const pts = hull.map(local => {
    const world = matLocalToWorldCm(local);
    return new Vector3(world.x / 100, world.y / 100 + LINE_LIFT_M, world.z / 100);
  });
  return [...pts, pts[0]];
}

/**
 * Live outline of mat-local robot footprint hulls used for play-area intersection.
 * Shown only on custom-challenge scenes with play zones (see SceneBinding).
 */
export class PlayAreaRobotBoundsDebugMeshes {
  private root_: TransformNode | null = null;
  private lineMeshes_: LinesMesh[] = [];
  private enabled_ = false;

  setEnabled(bScene: BabylonScene, enabled: boolean): void {
    if (enabled === this.enabled_ && (!enabled || this.root_)) return;
    this.enabled_ = enabled;
    if (!enabled) {
      this.dispose_(bScene);
    } else if (!this.root_) {
      this.root_ = new TransformNode(ROOT_NAME, bScene);
      this.root_.metadata = { playAreaRobotBoundsDebug: true };
    }
  }

  update(bScene: BabylonScene, robots: PlayAreaRobotBoundsDebugRobot[]): void {
    if (!this.enabled_ || !this.root_) return;

    for (const mesh of this.lineMeshes_) {
      mesh.dispose();
    }
    this.lineMeshes_ = [];

    for (const robot of robots) {
      for (const { linkId, hull } of robot.linkHulls) {
        const points = hullToWorldLinePoints_(hull);
        if (points.length < 2) continue;
        const line = MeshBuilder.CreateLines(
          `${ROOT_NAME}_${robot.robotId}_${linkId}`,
          { points },
          bScene
        );
        line.color = LINK_COLOR;
        line.alpha = 0.85;
        line.isPickable = false;
        line.renderingGroupId = 2;
        line.metadata = { playAreaRobotBoundsDebug: true };
        line.parent = this.root_;
        this.lineMeshes_.push(line);
      }

      const combinedPoints = hullToWorldLinePoints_(robot.combinedHull);
      if (combinedPoints.length < 2) continue;
      const combined = MeshBuilder.CreateLines(
        `${ROOT_NAME}_${robot.robotId}_combined`,
        { points: combinedPoints },
        bScene
      );
      combined.color = COMBINED_COLOR;
      combined.alpha = 1;
      combined.isPickable = false;
      combined.renderingGroupId = 2;
      combined.metadata = { playAreaRobotBoundsDebug: true };
      combined.parent = this.root_;
      this.lineMeshes_.push(combined);
    }
  }

  dispose_(bScene: BabylonScene): void {
    for (const mesh of this.lineMeshes_) {
      mesh.dispose();
    }
    this.lineMeshes_ = [];
    if (this.root_) {
      this.root_.dispose();
      this.root_ = null;
    }
    this.enabled_ = false;
  }
}
