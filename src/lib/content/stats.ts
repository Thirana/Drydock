import type { Lab, Track } from "./types";

export interface TrackStats {
  defects: number;
  phases: number;
  journeys: number;
  components: number;
}

export function trackStats(track: Track): TrackStats | undefined {
  const model = track.architecture;
  if (!model) return undefined;
  return {
    defects: model.defects.length,
    phases: model.phases.filter((p) => p.number > 0).length,
    journeys: model.journeys.length,
    components: Object.keys(model.componentSheets).length,
  };
}

export function labStats(lab: Lab): TrackStats | undefined {
  const all = lab.tracks.map(trackStats).filter((s): s is TrackStats => !!s);
  if (!all.length) return undefined;
  return all.reduce((sum, s) => ({
    defects: sum.defects + s.defects,
    phases: sum.phases + s.phases,
    journeys: sum.journeys + s.journeys,
    components: sum.components + s.components,
  }));
}
