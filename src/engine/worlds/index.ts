import { createMars } from './mars';
import { createMoon } from './moon';
import { createSpace } from './space';
import type { World, WorldKind, WorldOptions } from './world';

export type { HeightGrid, World, WorldKind, WorldOptions } from './world';

const BUILDERS: Record<WorldKind, (opts: WorldOptions) => World> = {
  mars: createMars,
  moon: createMoon,
  space: createSpace,
};

export const createWorld = (kind: WorldKind, opts: WorldOptions): World => BUILDERS[kind](opts);
