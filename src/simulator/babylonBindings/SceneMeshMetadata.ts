export interface SceneMeshMetadata {
  id: string;
  selected?: boolean;
  sourceGeometryId?: string;
}

export const withSceneNodeId = (metadata: SceneMeshMetadata | undefined, id: string): SceneMeshMetadata => ({
  ...metadata,
  id,
});
