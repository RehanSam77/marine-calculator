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
}
