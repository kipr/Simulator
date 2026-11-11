# 3D models

Binary glTF (`.glb`) models served at `/static/object_binaries/`, stored with
Git LFS.

## Layout

| Folder | Contents |
| --- | --- |
| `robots/<robot>/` | Robot parts, such as `robots/demobot/`. |
| `games/<year>/` | One Botball season's tables and game pieces. Tables are named `<event>_table.glb` (`spring_table.glb`, `fall_table.glb`, `explorer_table.glb`). |
| `challenges/<set>/` | Models for other challenge sets, such as `jbc/` and `moon/`. |
| `common/` | Models used by more than one game or challenge set, such as Botguy. |
| `common/building/` | Materials that tables are built from: lumber, PVC, tape. |

A model goes in the folder of the game that uses it. When a second game or
challenge set needs it, move it to `common/` instead of copying it.

## Names

- Lowercase `snake_case`: `<object>[_<color>][_<size>].glb`, such as
  `cube_red_2in.glb`.
- Add the size only when the object comes in more than one size in that folder.
- No version markers (`_v2`, `_new`, `previous`). Git keeps old versions; if
  two versions are both needed, name them by what differs
  (`chassis_no_reflectance.glb`).

## Adding, moving or removing a model

1. Add the path to `MODELS` in `src/simulator/definitions/models.ts` and refer
   to the model through `MODELS` rather than by path.
2. When a model moves or is renamed, add `"old/path.glb": "new/path.glb"` to
   `legacyModelPaths.json` at the repository root. Saved scenes store model
   URIs, and `express.js` redirects old paths so those scenes keep loading.
   Update existing entries that pointed at the old path too.
3. Delete models nothing uses; Git keeps their history.

`test/simulator/models.spec.ts` checks that `MODELS`, the files here and
`legacyModelPaths.json` agree.
