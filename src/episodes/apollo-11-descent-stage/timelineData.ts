export type ApolloMachine = 'saturn' | 'columbia' | 'ascent' | 'descent' | 'easep';
export type ApolloVignette =
  | 'landing'
  | 'firstStep'
  | 'unload'
  | 'surfaceWork'
  | 'easepOn'
  | 'hatchClosed'
  | 'liftoff'
  | 'sunset'
  | 'wake'
  | 'shutdown';

export interface ApolloTimelineEvent {
  id: string;
  stamp: string;
  machine: ApolloMachine;
  title: string;
  line: string;
  fact: string;
  vignette?: ApolloVignette;
}

export const APOLLO_TIMELINE: readonly ApolloTimelineEvent[] = [
  { id: 'launch', stamp: 'timeline.launch.stamp', machine: 'saturn', title: 'timeline.launch.title', line: 'timeline.launch.line', fact: 'launch-vehicle' },
  { id: 'parking', stamp: 'timeline.parking.stamp', machine: 'saturn', title: 'timeline.parking.title', line: 'timeline.parking.line', fact: 'flight-profile' },
  { id: 'tli', stamp: 'timeline.tli.stamp', machine: 'saturn', title: 'timeline.tli.title', line: 'timeline.tli.line', fact: 'launch-vehicle' },
  { id: 'dock', stamp: 'timeline.dock.stamp', machine: 'columbia', title: 'timeline.dock.title', line: 'timeline.dock.line', fact: 'flight-profile' },
  { id: 'coast', stamp: 'timeline.coast.stamp', machine: 'columbia', title: 'timeline.coast.title', line: 'timeline.coast.line', fact: 'flight-profile' },
  { id: 'loi', stamp: 'timeline.loi.stamp', machine: 'columbia', title: 'timeline.loi.title', line: 'timeline.loi.line', fact: 'flight-profile' },
  { id: 'undock', stamp: 'timeline.undock.stamp', machine: 'ascent', title: 'timeline.undock.title', line: 'timeline.undock.line', fact: 'timeline-quotes' },
  { id: 'descentOrbit', stamp: 'timeline.descentOrbit.stamp', machine: 'descent', title: 'timeline.descentOrbit.title', line: 'timeline.descentOrbit.line', fact: 'flight-profile' },
  { id: 'poweredDescent', stamp: 'timeline.poweredDescent.stamp', machine: 'descent', title: 'timeline.poweredDescent.title', line: 'timeline.poweredDescent.line', fact: 'powered-descent' },
  { id: 'landing', stamp: 'timeline.landing.stamp', machine: 'descent', title: 'timeline.landing.title', line: 'timeline.landing.line', fact: 'timeline-quotes', vignette: 'landing' },
  { id: 'firstStep', stamp: 'timeline.firstStep.stamp', machine: 'descent', title: 'timeline.firstStep.title', line: 'timeline.firstStep.line', fact: 'first-step', vignette: 'firstStep' },
  { id: 'unload', stamp: 'timeline.unload.stamp', machine: 'easep', title: 'timeline.unload.title', line: 'timeline.unload.line', fact: 'deployment', vignette: 'unload' },
  { id: 'surfaceWork', stamp: 'timeline.surfaceWork.stamp', machine: 'descent', title: 'timeline.surfaceWork.title', line: 'timeline.surfaceWork.line', fact: 'surface-media', vignette: 'surfaceWork' },
  { id: 'easepOn', stamp: 'timeline.easepOn.stamp', machine: 'easep', title: 'timeline.easepOn.title', line: 'timeline.easepOn.line', fact: 'power-on', vignette: 'easepOn' },
  { id: 'hatchClosed', stamp: 'timeline.hatchClosed.stamp', machine: 'ascent', title: 'timeline.hatchClosed.title', line: 'timeline.hatchClosed.line', fact: 'hatch-closed', vignette: 'hatchClosed' },
  { id: 'liftoff', stamp: 'timeline.liftoff.stamp', machine: 'ascent', title: 'timeline.liftoff.title', line: 'timeline.liftoff.line', fact: 'eagle-liftoff', vignette: 'liftoff' },
  { id: 'redock', stamp: 'timeline.redock.stamp', machine: 'columbia', title: 'timeline.redock.title', line: 'timeline.redock.line', fact: 'flag-fall' },
  { id: 'jettison', stamp: 'timeline.jettison.stamp', machine: 'ascent', title: 'timeline.jettison.title', line: 'timeline.jettison.line', fact: 'eagle-liftoff' },
  { id: 'tei', stamp: 'timeline.tei.stamp', machine: 'columbia', title: 'timeline.tei.title', line: 'timeline.tei.line', fact: 'flight-profile' },
  { id: 'splashdown', stamp: 'timeline.splashdown.stamp', machine: 'columbia', title: 'timeline.splashdown.title', line: 'timeline.splashdown.line', fact: 'splashdown' },
  { id: 'sunset', stamp: 'timeline.sunset.stamp', machine: 'easep', title: 'timeline.sunset.title', line: 'timeline.sunset.line', fact: 'easep-operation', vignette: 'sunset' },
  { id: 'wake', stamp: 'timeline.wake.stamp', machine: 'easep', title: 'timeline.wake.title', line: 'timeline.wake.line', fact: 'easep-operation', vignette: 'wake' },
  { id: 'shutdown', stamp: 'timeline.shutdown.stamp', machine: 'easep', title: 'timeline.shutdown.title', line: 'timeline.shutdown.line', fact: 'terminal-failure', vignette: 'shutdown' },
];
