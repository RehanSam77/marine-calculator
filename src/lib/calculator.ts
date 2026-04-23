import {
  CURRENT_TABLE,
  REACTANCE_TABLE,
  RESISTANCE_TABLE,
  type CableTable,
} from "../data/cableTables";
import type {
  CalculationResult,
  CoreType,
  InputParameters,
  IterationPoint,
} from "../types";

const MAX_ITERATIONS = 20;
const MAX_RUNS = 20;

function findClosestValue(
  columnName: CoreType,
  loadAmp: number,
): { key: string | null; value: number | null } {
  const headers = CURRENT_TABLE[0] as string[];
  const columnPosition = headers.indexOf(columnName);

  let bestKey: string | null = null;
  let bestValue: number | null = null;

  for (let i = 1; i < CURRENT_TABLE.length; i++) {
    const row = CURRENT_TABLE[i];
    const key = row[0] as string;
    const value = parseInt(row[columnPosition] as string, 10);
    if (value >= loadAmp) {
      if (bestValue === null || value < bestValue) {
        bestKey = key;
        bestValue = value;
      }
    }
  }
  return { key: bestKey, value: bestValue };
}

function findNextHigherCsa(currentCsa: string): string | null {
  for (let i = 1; i < CURRENT_TABLE.length; i++) {
    const key = CURRENT_TABLE[i][0] as string;
    if (parseFloat(key) > parseFloat(currentCsa)) return key;
  }
  return null;
}

function getValueFromTable(
  table: CableTable,
  csa: string,
  coreType: CoreType,
): number {
  const headers = table[0] as string[];
  const headerIndex = headers.indexOf(coreType);
  for (let i = 1; i < table.length; i++) {
    if (table[i][0] === csa) {
      return parseFloat(table[i][headerIndex] as string);
    }
  }
  throw new Error(`CSA ${csa} not found in table`);
}

function ratedCurrentFor(csa: string, coreType: CoreType): number {
  const headers = CURRENT_TABLE[0] as string[];
  const columnPosition = headers.indexOf(coreType);
  for (let i = 1; i < CURRENT_TABLE.length; i++) {
    if (CURRENT_TABLE[i][0] === csa) {
      return parseInt(CURRENT_TABLE[i][columnPosition] as string, 10);
    }
  }
  throw new Error(`CSA ${csa} not found in current-rating table`);
}

/**
 * Run the full cable-selection algorithm.
 * Mirrors the Python `calculate_cable_selection` logic:
 *  - "Minimum Run" mode iterates CSAs upward until voltage-drop limit is met,
 *    falling back to multiple parallel runs on the largest CSA if needed.
 *  - Fixed-CSA mode increases the number of parallel runs until voltage drop
 *    and capacity per run both pass.
 */
export function runCalculation(params: InputParameters): CalculationResult {
  const log: string[] = [];
  const iterations: IterationPoint[] = [];
  log.push("Starting cable selection calculation...");

  const angle = Math.acos(params.pf);
  const angleDeg = (angle * 180) / Math.PI;

  let csa: string;
  let ratedCurrent: number;
  let R = 0;
  let X = 0;
  let Vd = 0;
  let VdPercent = Infinity;
  let newConTemp = 0;
  let numberOfRuns = 1;

  if (params.selected_CSA === "Minimum Run") {
    const closest = findClosestValue(params.core_Type, params.load_Amp);
    if (!closest.key || closest.value === null) {
      throw new Error(
        "No cable size in the table is rated high enough for this load.",
      );
    }
    csa = closest.key;
    ratedCurrent = closest.value;

    log.push(`Initial CSA selected: ${csa} mm²`);
    log.push(`Initial rated current: ${ratedCurrent} A`);

    let iter = 0;
    while (VdPercent > params.voltage_Drop && iter < MAX_ITERATIONS) {
      iter += 1;

      R = getValueFromTable(RESISTANCE_TABLE, csa, params.core_Type);
      X = getValueFromTable(REACTANCE_TABLE, csa, params.core_Type);

      Vd =
        (params.load_Amp *
          params.run_Length *
          Math.sqrt(3) *
          (R * Math.cos(angle) + X * Math.sin(angle))) /
        1000;
      VdPercent = (Vd / params.voltage) * 100;

      newConTemp =
        params.ambient_Temp *
        Math.pow(params.load_Amp / ratedCurrent, 2) +
        params.ambient_Temp;

      const met = VdPercent <= params.voltage_Drop;
      iterations.push({
        csa: parseFloat(csa),
        voltage_drop: VdPercent,
        rated_current: ratedCurrent,
        iteration: iter,
        conditions_met: met,
      });

      log.push(`Iteration ${iter}:`);
      log.push(`  CSA: ${csa} mm², Rated Current: ${ratedCurrent} A`);
      log.push(`  R: ${R.toFixed(4)} Ω/km, X: ${X.toFixed(4)} Ω/km`);
      log.push(`  Voltage Drop: ${VdPercent.toFixed(2)}%`);

      if (met) {
        log.push("✓ Voltage drop condition met!");
        break;
      }

      const nextCsa = findNextHigherCsa(csa);
      if (nextCsa === null) {
        log.push(
          "⚠ No higher CSA available. Switching to multiple runs on highest CSA.",
        );
        let runs = 2;
        while (runs <= MAX_RUNS) {
          const loadPerRun = params.load_Amp / runs;
          Vd =
            (loadPerRun *
              params.run_Length *
              Math.sqrt(3) *
              (R * Math.cos(angle) + X * Math.sin(angle))) /
            1000;
          VdPercent = (Vd / params.voltage) * 100;
          newConTemp =
            params.ambient_Temp *
            Math.pow(loadPerRun / ratedCurrent, 2) +
            params.ambient_Temp;
          log.push(
            `Runs: ${runs} | CSA: ${csa} mm² | I/run: ${loadPerRun.toFixed(
              2,
            )} A | Vd%: ${VdPercent.toFixed(2)}%`,
          );
          if (
            VdPercent <= params.voltage_Drop &&
            loadPerRun <= ratedCurrent
          ) {
            numberOfRuns = runs;
            log.push("✓ Conditions met with multiple runs on highest CSA");
            break;
          }
          runs += 1;
        }
        if (runs > MAX_RUNS) {
          log.push("⚠ Unable to meet conditions with reasonable number of runs");
          numberOfRuns = MAX_RUNS;
        }
        break;
      }

      csa = nextCsa;
      ratedCurrent = ratedCurrentFor(csa, params.core_Type);
    }
  } else {
    // Fixed CSA; vary number of parallel runs
    csa = params.selected_CSA;
    ratedCurrent = ratedCurrentFor(csa, params.core_Type);
    R = getValueFromTable(RESISTANCE_TABLE, csa, params.core_Type);
    X = getValueFromTable(REACTANCE_TABLE, csa, params.core_Type);

    numberOfRuns = 1;
    VdPercent = Infinity;

    while (numberOfRuns <= MAX_RUNS) {
      const loadPerRun = params.load_Amp / numberOfRuns;

      Vd =
        (loadPerRun *
          params.run_Length *
          Math.sqrt(3) *
          (R * Math.cos(angle) + X * Math.sin(angle))) /
        1000;
      VdPercent = (Vd / params.voltage) * 100;
      newConTemp =
        params.ambient_Temp *
        Math.pow(loadPerRun / ratedCurrent, 2) +
        params.ambient_Temp;

      const met =
        VdPercent <= params.voltage_Drop && loadPerRun <= ratedCurrent;
      iterations.push({
        csa: parseFloat(csa),
        voltage_drop: VdPercent,
        rated_current: ratedCurrent,
        iteration: numberOfRuns,
        conditions_met: met,
      });

      log.push(
        `Runs: ${numberOfRuns} | CSA: ${csa} mm² | I/run: ${loadPerRun.toFixed(
          2,
        )} A | Vd%: ${VdPercent.toFixed(2)}%`,
      );

      if (met) {
        log.push("✓ Conditions met with multiple runs");
        break;
      }
      numberOfRuns += 1;
    }

    if (numberOfRuns > MAX_RUNS) {
      log.push("⚠ Unable to meet conditions with reasonable number of runs");
      numberOfRuns = MAX_RUNS;
    }
  }

  log.push("✓ Calculation completed successfully!");

  return {
    csa,
    rated_Current: ratedCurrent,
    Vd_Percent: VdPercent,
    newConTemp,
    R,
    X,
    Vd,
    angle_Degrees: angleDeg,
    num_runs: numberOfRuns,
    iterations,
    log,
  };
}
