import type { ArchitectureModel } from "@/lib/architecture/types";

export interface CaseStats {
  defects: number;
  phases: number;
  journeys: number;
  components: number;
}

export function caseStats(model: ArchitectureModel): CaseStats {
  return {
    defects: model.defects.length,
    phases: model.phases.filter((p) => p.number > 0).length,
    journeys: model.journeys.length,
    components: Object.keys(model.componentSheets).length,
  };
}
