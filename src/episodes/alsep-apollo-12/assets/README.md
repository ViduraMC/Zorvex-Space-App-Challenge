# 3D model assets

Place optimised GLB files here (run `npm run optimize:models`).

## NASA 3D Resources
Models sourced from https://science.nasa.gov/3d-resources/

| File | NASA model | URL |
|---|---|---|
| `apollo-lunar-module.glb` | Apollo Lunar Module | https://science.nasa.gov/3d-resources/ |

The Apollo Lunar Module GLB is already in `src/assets/models/`.
To use it set `machine: { model: 'apollo-lunar-module.glb' }` in episode.ts
(currently ALSEP uses a procedural scene.ts instead, as ALSEP itself is stationary).
