export const APOLLO_11 = {
  lander: {
    x: 0,
    z: -17,
    widthM: 4.2,
    thicknessM: 1.7,
    clearanceM: 1.5,
    footpadSpanM: 9.4,
    ascentHeightM: 2.8,
    ascentWidthM: 4.3,
  },
  easep: {
    massKg: 48,
    deploymentDistanceM: 17,
    deploymentToleranceM: 1,
    minDeploymentDistanceM: 0,
    maxDeploymentDistanceM: 30,
    panelHeadingDeg: 90,
    panelAlignmentToleranceDeg: 10,
  },
  camera: {
    eyeHeightM: 0.8,
    deployment: { pos: [0, 5, 6], look: [0, 1, -17] },
    firstPerson: { pos: [0, 0.8, -0.5], look: [0, 2, -17] },
    earthLook: { pos: [0, 0.8, -0.5], look: [0, 9.2, 40] },
    origin: { pos: [0, 0.45, -15.4], look: [0, 0.8, -17] },
  },
  timing: {
    astronautClimbMs: 1800,
    eyeOpenMs: 2600,
    turnMs: 4000,
    memoryBeatMs: 450,
    shutdownCloseMs: 6000,
    shutdownErrorHoldMs: 8000,
  },
} as const;

export interface ApolloPart {
  id: string;
  name: string;
  role: string;
  facts: string;
  contribution: string;
  narration: string;
  factId: string;
  narration2?: string;
  factId2?: string;
}

export const APOLLO_PARTS: readonly ApolloPart[] = [
  {
    id: 'saturn',
    name: 'part.saturn.name',
    role: 'part.saturn.role',
    facts: 'part.saturn.facts',
    contribution: 'part.saturn.contribution',
    narration: 'p2.saturn',
    factId: 'launch-vehicle',
  },
  {
    id: 'columbia',
    name: 'part.columbia.name',
    role: 'part.columbia.role',
    facts: 'part.columbia.facts',
    contribution: 'part.columbia.contribution',
    narration: 'p2.columbia',
    factId: 'columbia-orbiter',
  },
  {
    id: 'ascent',
    name: 'part.ascent.name',
    role: 'part.ascent.role',
    facts: 'part.ascent.facts',
    contribution: 'part.ascent.contribution',
    narration: 'p2.ascent',
    factId: 'eagle-ascent',
  },
  {
    id: 'descent',
    name: 'part.descent.name',
    role: 'part.descent.role',
    facts: 'part.descent.facts',
    contribution: 'part.descent.contribution',
    narration: 'p2.descent',
    factId: 'eagle-descent',
  },
  {
    id: 'surface',
    name: 'part.surface.name',
    role: 'part.surface.role',
    facts: 'part.surface.facts',
    contribution: 'part.surface.contribution',
    narration: 'p2.surface',
    factId: 'surface-work',
    narration2: 'p2.surfaceMedia',
    factId2: 'surface-media',
  },
  {
    id: 'easep',
    name: 'part.easep.name',
    role: 'part.easep.role',
    facts: 'part.easep.facts',
    contribution: 'part.easep.contribution',
    narration: 'p2.easep',
    factId: 'easep-instruments',
    narration2: 'p2.reflector',
    factId2: 'retroreflector',
  },
] as const;
