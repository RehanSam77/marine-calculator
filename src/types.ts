export type CoreType = "Single Core" | "2 Core" | "3 or 4 Core";

export interface InputParameters {
  load_Amp: number;
  run_Length: number;
  voltage: number;
  voltage_Drop: number;
  pf: number;
  core_Type: CoreType;
  ambient_Temp: number;
  /** Either "Minimum Run" (iterate CSA upward) or a CSA string like "25" */
  selected_CSA: string;
}

export interface IterationPoint {
  csa: number;
  voltage_drop: number;
  rated_current: number;
  iteration: number;
  conditions_met: boolean;
}

export interface CalculationResult {
  csa: string;
  rated_Current: number;
  Vd_Percent: number;
  newConTemp: number;
  R: number;
  X: number;
  Vd: number;
  angle_Degrees: number;
  num_runs: number;
  iterations: IterationPoint[];
  log: string[];
  core_Type: CoreType;
}

/**
 * Build the product code, e.g. BVA-XXXN/2C70.
 * The digit after the slash reflects the core type:
 *   Single Core  → 1
 *   2 Core       → 2
 *   3 or 4 Core  → 3
 */
export function buildCableCode(coreType: CoreType, csa: string): string {
  const coreDigit =
    coreType === "Single Core" ? 1 : coreType === "2 Core" ? 2 : 3;
  return `BVA-XXXN/${coreDigit}C${csa}`;
}
