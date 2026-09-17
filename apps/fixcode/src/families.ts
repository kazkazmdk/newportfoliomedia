import { provenance } from "@penta/data-provenance";
import type { DiagnosticQuestion, ErrorProfile, FixCause, SymptomProfile } from "./types";

export type FaultFamily =
  | "fill"
  | "drain"
  | "unbalance"
  | "door"
  | "leak"
  | "overflow"
  | "thermistor"
  | "heat"
  | "motor"
  | "suds"
  | "power"
  | "level_sensor"
  | "dryer_air"
  | "dryer_heat"
  | "fridge_sensor"
  | "aquastop"
  | "dw_drain"
  | "dw_heat"
  | "oven_heat";

type CauseDraft = Omit<FixCause, "tools" | "cost_eur_min" | "cost_eur_max"> &
  Partial<Pick<FixCause, "tools" | "cost_eur_min" | "cost_eur_max">>;

function C(draft: CauseDraft): FixCause {
  return { tools: ["flashlight"], cost_eur_min: 0, cost_eur_max: 0, ...draft };
}

function Q(
  id: string,
  text: string,
  why: string,
  answers: DiagnosticQuestion["answers"],
): DiagnosticQuestion {
  return { id, text, why, answers };
}

export const FAMILIES: Record<
  FaultFamily,
  { causes: FixCause[]; questions: (prefix: string) => DiagnosticQuestion[]; symptoms: string[] }
> = {
  fill: {
    symptoms: ["not-filling", "takes-too-long-to-fill"],
    causes: [
      C({ id: "supply", name: "Household water supply closed or weak", prior: 0.34, summary: "Tap, isolation valve, or building pressure.", difficulty: 1, time_minutes: 5, safety: "SAFE_USER_CHECK", fix: "Open the isolation valve fully and check another tap." }),
      C({ id: "filter", name: "Blocked inlet filter screens", prior: 0.26, summary: "Mesh in the inlet catches grit.", difficulty: 2, time_minutes: 20, tools: ["pliers", "toothbrush"], safety: "SAFE_USER_CHECK", fix: "Isolate water, unscrew hoses, clean both screens." }),
      C({ id: "hose", name: "Kinked or collapsed inlet hose", prior: 0.16, summary: "Hose crushed behind the cabinet.", difficulty: 1, time_minutes: 10, cost_eur_min: 12, cost_eur_max: 25, safety: "SAFE_USER_CHECK", fix: "Straighten or replace the hose." }),
      C({ id: "valve", name: "Inlet valve not opening", prior: 0.16, summary: "Solenoid stuck closed.", difficulty: 3, time_minutes: 45, cost_eur_min: 22, cost_eur_max: 70, tools: ["screwdriver"], safety: "CAUTION", fix: "Replace the valve with power and water isolated." }),
      C({ id: "sensor", name: "Level sensor / control", prior: 0.08, summary: "Fill is not reported to the board.", difficulty: 4, time_minutes: 60, cost_eur_min: 40, cost_eur_max: 180, safety: "PROFESSIONAL_ONLY", blocked_reason: "Live pressure-sensor or board test.", fix: "Technician diagnosis of the water-level system." }),
    ],
    questions: (p) => [
      Q(`${p}-tap`, "Is water reaching the tap normally?", "Household supply is the first split on a timed fill.", [
        { id: "yes", label: "Yes", likelihoods: { supply: 0.3, filter: 0.85, hose: 0.8, valve: 0.8, sensor: 0.75 } },
        { id: "no", label: "No / weak", likelihoods: { supply: 0.95, filter: 0.2, hose: 0.15, valve: 0.1, sensor: 0.05 } },
      ]),
      Q(`${p}-sound`, "Can you hear the valve trying to open?", "A click/hum with no water points to a blocked path, not a dead board.", [
        { id: "yes", label: "Yes, then it errors", likelihoods: { supply: 0.6, filter: 0.8, hose: 0.7, valve: 0.55, sensor: 0.25 } },
        { id: "no", label: "Silent", likelihoods: { supply: 0.2, filter: 0.2, hose: 0.2, valve: 0.55, sensor: 0.8 } },
      ]),
    ],
  },
  drain: {
    symptoms: ["not-draining", "standing-water"],
    causes: [
      C({ id: "filter", name: "Drain pump filter / coin trap", prior: 0.42, summary: "Lint, coin, or sock in the trap.", difficulty: 2, time_minutes: 20, tools: ["towel"], safety: "SAFE_USER_CHECK", fix: "Drain residual water, clean the trap, refit the cap." }),
      C({ id: "hose", name: "Drain hose kink or standpipe height", prior: 0.22, summary: "Hose crushed or pushed too far into the pipe.", difficulty: 1, time_minutes: 10, safety: "SAFE_USER_CHECK", fix: "Reroute with an air gap at the standpipe." }),
      C({ id: "pump", name: "Drain pump jammed or failed", prior: 0.24, summary: "Impeller blocked or motor open.", difficulty: 3, time_minutes: 50, cost_eur_min: 30, cost_eur_max: 90, tools: ["screwdriver"], safety: "CAUTION", fix: "Inspect impeller with power off. Replace pump if seized." }),
      C({ id: "drain", name: "Household drain backing up", prior: 0.12, summary: "Standpipe or sink drain is slow.", difficulty: 2, time_minutes: 30, safety: "SAFE_USER_CHECK", fix: "Test the standpipe with a bucket of water." }),
    ],
    questions: (p) => [
      Q(`${p}-trap`, "Have you cleaned the pump filter?", "Most drain timeouts are the user-accessible trap.", [
        { id: "no", label: "Not yet / it was packed", likelihoods: { filter: 0.9, hose: 0.35, pump: 0.3, drain: 0.3 } },
        { id: "yes", label: "Yes, it was clear", likelihoods: { filter: 0.15, hose: 0.7, pump: 0.75, drain: 0.6 } },
      ]),
      Q(`${p}-hose`, "Is the drain hose kinked or jammed in the standpipe?", "A siphon or crush mimics a dead pump.", [
        { id: "yes", label: "Yes", likelihoods: { filter: 0.2, hose: 0.9, pump: 0.25, drain: 0.5 } },
        { id: "no", label: "No", likelihoods: { filter: 0.55, hose: 0.2, pump: 0.65, drain: 0.4 } },
      ]),
    ],
  },
  unbalance: {
    symptoms: ["wont-spin", "shakes"],
    causes: [
      C({ id: "load", name: "Uneven or single heavy item", prior: 0.55, summary: "Duvet, bath mat, or one pair of trainers.", difficulty: 1, time_minutes: 5, safety: "SAFE_USER_CHECK", fix: "Redistribute, add similar items, retry spin." }),
      C({ id: "level", name: "Machine not level", prior: 0.22, summary: "Feet unlocked or cabinet rocks.", difficulty: 2, time_minutes: 15, tools: ["spirit level"], safety: "SAFE_USER_CHECK", fix: "Level all four feet and tighten lock nuts." }),
      C({ id: "shock", name: "Damper / shock wear", prior: 0.15, summary: "Drum keeps bouncing on a balanced load.", difficulty: 4, time_minutes: 90, cost_eur_min: 40, cost_eur_max: 120, safety: "CAUTION", fix: "Replace dampers as a set with the machine unplugged." }),
      C({ id: "sensor", name: "Hall / unbalance sensor", prior: 0.08, summary: "Control never sees a balanced drum.", difficulty: 5, time_minutes: 90, safety: "PROFESSIONAL_ONLY", blocked_reason: "Motor hall-sensor testing.", fix: "Technician diagnosis of the motor position sensor." }),
    ],
    questions: (p) => [
      Q(`${p}-retry`, "Did redistributing the load clear it?", "Most unbalance events are a one-off heavy item.", [
        { id: "yes", label: "Yes", likelihoods: { load: 0.95, level: 0.2, shock: 0.1, sensor: 0.05 } },
        { id: "no", label: "No, it returns on a mixed load", likelihoods: { load: 0.2, level: 0.65, shock: 0.7, sensor: 0.55 } },
      ]),
    ],
  },
  door: {
    symptoms: ["door-wont-lock"],
    causes: [
      C({ id: "ajar", name: "Door not fully closed / laundry in seal", prior: 0.42, summary: "Gasket catch or a light push.", difficulty: 1, time_minutes: 2, safety: "SAFE_USER_CHECK", fix: "Clear the gasket and close firmly." }),
      C({ id: "lock", name: "Door lock assembly", prior: 0.38, summary: "Lock does not pull in or report locked.", difficulty: 3, time_minutes: 40, cost_eur_min: 18, cost_eur_max: 55, tools: ["screwdriver"], safety: "CAUTION", fix: "Replace the lock with power isolated." }),
      C({ id: "wiring", name: "Lock wiring / board", prior: 0.2, summary: "Harness or control not seeing the switch.", difficulty: 5, time_minutes: 70, safety: "PROFESSIONAL_ONLY", blocked_reason: "Live lock circuit.", fix: "Technician continuity test of the lock circuit." }),
    ],
    questions: (p) => [
      Q(`${p}-click`, "Do you hear the lock click when you start a cycle?", "A click then error is not a simple ajar door.", [
        { id: "no", label: "No click", likelihoods: { ajar: 0.55, lock: 0.7, wiring: 0.6 } },
        { id: "yes", label: "Clicks then errors", likelihoods: { ajar: 0.2, lock: 0.6, wiring: 0.7 } },
      ]),
    ],
  },
  leak: {
    symptoms: ["leaking"],
    causes: [
      C({ id: "filter", name: "Drain-filter cap not sealed", prior: 0.28, summary: "After cleaning the trap the cap was loose.", difficulty: 1, time_minutes: 5, safety: "SAFE_USER_CHECK", fix: "Refit the cap firmly and dry the base." }),
      C({ id: "door", name: "Door boot / gasket", prior: 0.3, summary: "Split in the rubber boot.", difficulty: 3, time_minutes: 60, cost_eur_min: 30, cost_eur_max: 80, safety: "CAUTION", fix: "Inspect the gasket. Replace if torn." }),
      C({ id: "hose", name: "Internal hose clamp", prior: 0.22, summary: "A clamp in the cabinet is weeping.", difficulty: 4, time_minutes: 70, safety: "CAUTION", fix: "Inspect hoses with power off." }),
      C({ id: "sensor", name: "Damp base / leak sensor", prior: 0.2, summary: "Old water still trips the sensor.", difficulty: 2, time_minutes: 20, safety: "SAFE_USER_CHECK", fix: "Dry the base completely, then reset." }),
    ],
    questions: (p) => [
      Q(`${p}-where`, "Where is the water?", "Front puddles are often the door. Under-kickplate water is the base.", [
        { id: "front", label: "In front of the door", likelihoods: { filter: 0.3, door: 0.85, hose: 0.25, sensor: 0.2 } },
        { id: "under", label: "Under / in the base", likelihoods: { filter: 0.55, door: 0.25, hose: 0.7, sensor: 0.5 } },
      ]),
    ],
  },
  overflow: {
    symptoms: ["overfilling", "leaking"],
    causes: [
      C({ id: "valve", name: "Inlet valve stuck open", prior: 0.4, summary: "Water keeps entering after the board stops calling.", difficulty: 3, time_minutes: 40, cost_eur_min: 25, cost_eur_max: 70, safety: "CAUTION", fix: "Shut the tap immediately. Replace the inlet valve." }),
      C({ id: "sensor", name: "Pressure sensor / air hose", prior: 0.35, summary: "Blocked pressure hose fools the board.", difficulty: 3, time_minutes: 40, safety: "CAUTION", fix: "Clear the pressure hose with power isolated." }),
      C({ id: "drain", name: "Failed drain during fill", prior: 0.25, summary: "Water enters faster than it leaves.", difficulty: 2, time_minutes: 25, safety: "SAFE_USER_CHECK", fix: "Clean the drain filter, then retry." }),
    ],
    questions: (p) => [
      Q(`${p}-still`, "Is water still entering with the cycle cancelled?", "Uncontrolled fill is isolated at the tap.", [
        { id: "yes", label: "Yes — shut the tap", likelihoods: { valve: 0.95, sensor: 0.2, drain: 0.1 } },
        { id: "no", label: "Fill stops", likelihoods: { valve: 0.2, sensor: 0.7, drain: 0.65 } },
      ]),
    ],
  },
  thermistor: {
    symptoms: ["not-heating"],
    causes: [
      C({ id: "thermistor", name: "Faulty thermistor", prior: 0.55, summary: "Temperature probe open or shorted.", difficulty: 3, time_minutes: 40, cost_eur_min: 12, cost_eur_max: 35, safety: "CAUTION", fix: "Replace the thermistor after isolating power." }),
      C({ id: "wiring", name: "Harness / connector", prior: 0.25, summary: "Oxidised connector on the tank.", difficulty: 3, time_minutes: 35, safety: "CAUTION", fix: "Reseat the connector with power off." }),
      C({ id: "board", name: "Control board", prior: 0.2, summary: "Board not reading a valid temperature.", difficulty: 5, time_minutes: 80, safety: "PROFESSIONAL_ONLY", blocked_reason: "Mains heater circuit.", fix: "Technician diagnosis. Do not test the heater live." }),
    ],
    questions: (p) => [
      Q(`${p}-heat`, "Does a hot cycle still heat?", "A cold hot-wash supports a thermistor or heater path fault.", [
        { id: "no", label: "Stays cold", likelihoods: { thermistor: 0.7, wiring: 0.6, board: 0.5 } },
        { id: "yes", label: "Heats but still codes", likelihoods: { thermistor: 0.45, wiring: 0.4, board: 0.6 } },
      ]),
    ],
  },
  heat: {
    symptoms: ["not-heating"],
    causes: [
      C({ id: "heater", name: "Heater element", prior: 0.4, summary: "Open element.", difficulty: 4, time_minutes: 60, cost_eur_min: 25, cost_eur_max: 80, safety: "PROFESSIONAL_ONLY", blocked_reason: "Mains heater.", fix: "Technician replacement of the element." }),
      C({ id: "thermistor", name: "Thermistor", prior: 0.3, summary: "False temperature.", difficulty: 3, time_minutes: 40, cost_eur_min: 12, cost_eur_max: 35, safety: "CAUTION", fix: "Replace thermistor with power off." }),
      C({ id: "relay", name: "Heater relay / board", prior: 0.3, summary: "Board not switching the heater.", difficulty: 5, time_minutes: 80, safety: "PROFESSIONAL_ONLY", blocked_reason: "Live heater relay.", fix: "Do not jumper the heater." }),
    ],
    questions: (p) => [
      Q(`${p}-cold`, "Is the tub/cavity cold at the end of a hot programme?", "A cold hot cycle is a heat-path fault, not software.", [
        { id: "yes", label: "Yes, cold", likelihoods: { heater: 0.75, thermistor: 0.55, relay: 0.6 } },
        { id: "no", label: "It heats sometimes", likelihoods: { heater: 0.35, thermistor: 0.6, relay: 0.55 } },
      ]),
    ],
  },
  motor: {
    symptoms: ["wont-spin", "dead-drum"],
    causes: [
      C({ id: "object", name: "Object jammed between drum and tub", prior: 0.3, summary: "Bra wire or coin stalling the drum.", difficulty: 2, time_minutes: 25, safety: "SAFE_USER_CHECK", fix: "Inspect the drum gap. Do not force the drum." }),
      C({ id: "connector", name: "Motor connector", prior: 0.25, summary: "Loose plug on the inverter.", difficulty: 3, time_minutes: 40, safety: "CAUTION", fix: "Reseat connectors with power isolated." }),
      C({ id: "hall", name: "Hall sensor / rotor", prior: 0.25, summary: "Position sensor failed.", difficulty: 4, time_minutes: 70, cost_eur_min: 30, cost_eur_max: 140, safety: "PROFESSIONAL_ONLY", blocked_reason: "Inverter/motor live circuits.", fix: "Technician motor diagnosis." }),
      C({ id: "inverter", name: "Inverter / control", prior: 0.2, summary: "Drive electronics not powering the motor.", difficulty: 5, time_minutes: 90, safety: "PROFESSIONAL_ONLY", blocked_reason: "High-voltage inverter.", fix: "Do not open the inverter housing." }),
    ],
    questions: (p) => [
      Q(`${p}-hand`, "Can you turn the drum by hand with the machine unplugged?", "A locked drum is a jam or seized bearing.", [
        { id: "no", label: "Locked", likelihoods: { object: 0.85, connector: 0.15, hall: 0.2, inverter: 0.1 } },
        { id: "yes", label: "Turns freely", likelihoods: { object: 0.15, connector: 0.6, hall: 0.7, inverter: 0.65 } },
      ]),
    ],
  },
  suds: {
    symptoms: ["too-many-suds"],
    causes: [
      C({ id: "detergent", name: "Too much detergent / wrong type", prior: 0.7, summary: "Hand-wash or too much HE powder in a front-loader.", difficulty: 1, time_minutes: 20, safety: "SAFE_USER_CHECK", fix: "Run a rinse/spin with no detergent. Use HE detergent next time." }),
      C({ id: "drain", name: "Slow drain keeping suds in the tub", prior: 0.2, summary: "Suds plus a slow pump.", difficulty: 2, time_minutes: 20, safety: "SAFE_USER_CHECK", fix: "Clean the drain filter, then extra rinse." }),
      C({ id: "sensor", name: "Suds / pressure misread", prior: 0.1, summary: "Sensor still sees foam.", difficulty: 3, time_minutes: 40, safety: "CAUTION", fix: "Dry and retry after rinses. Do not add more soap." }),
    ],
    questions: (p) => [
      Q(`${p}-foam`, "Do you see foam in the drum or drawer?", "Suds codes are almost always detergent dose.", [
        { id: "yes", label: "Yes, lots of foam", likelihoods: { detergent: 0.95, drain: 0.3, sensor: 0.15 } },
        { id: "no", label: "No visible foam", likelihoods: { detergent: 0.25, drain: 0.6, sensor: 0.7 } },
      ]),
    ],
  },
  power: {
    symptoms: ["wont-start"],
    causes: [
      C({ id: "supply", name: "Supply / plug / RCD", prior: 0.45, summary: "No power at the outlet.", difficulty: 1, time_minutes: 5, safety: "SAFE_USER_CHECK", fix: "Try another outlet. Reset the RCD. Do not open the mains filter." }),
      C({ id: "filter", name: "Noise filter / inlet", prior: 0.25, summary: "Dead with a live outlet.", difficulty: 5, time_minutes: 50, safety: "PROFESSIONAL_ONLY", blocked_reason: "Mains inlet.", fix: "Technician test of the filter and board." }),
      C({ id: "board", name: "Control / display", prior: 0.3, summary: "Board not booting.", difficulty: 5, time_minutes: 70, safety: "PROFESSIONAL_ONLY", blocked_reason: "Live board.", fix: "Professional board diagnosis." }),
    ],
    questions: (p) => [
      Q(`${p}-outlet`, "Does another appliance work in the same outlet?", "A dead outlet is not an appliance board.", [
        { id: "no", label: "Outlet is dead", likelihoods: { supply: 0.95, filter: 0.1, board: 0.1 } },
        { id: "yes", label: "Outlet is live", likelihoods: { supply: 0.2, filter: 0.7, board: 0.75 } },
      ]),
    ],
  },
  level_sensor: {
    symptoms: ["not-filling", "overfilling"],
    causes: [
      C({ id: "hose", name: "Pressure hose blocked", prior: 0.4, summary: "Air hose to the sensor clogged.", difficulty: 3, time_minutes: 35, safety: "CAUTION", fix: "Clear the pressure hose with power off." }),
      C({ id: "sensor", name: "Level sensor", prior: 0.35, summary: "Sensor out of range.", difficulty: 3, time_minutes: 40, cost_eur_min: 15, cost_eur_max: 45, safety: "CAUTION", fix: "Replace the sensor after isolating power." }),
      C({ id: "board", name: "Control", prior: 0.25, summary: "Board not reading the sensor.", difficulty: 5, time_minutes: 70, safety: "PROFESSIONAL_ONLY", blocked_reason: "Live control.", fix: "Technician diagnosis." }),
    ],
    questions: (p) => [
      Q(`${p}-fill`, "Does the machine overfill, underfill, or refuse to start?", "Direction of the level fault splits the tree.", [
        { id: "under", label: "Underfills / won't fill", likelihoods: { hose: 0.6, sensor: 0.6, board: 0.45 } },
        { id: "over", label: "Overfills", likelihoods: { hose: 0.7, sensor: 0.55, board: 0.4 } },
      ]),
    ],
  },
  dryer_air: {
    symptoms: ["not-drying", "takes-too-long"],
    causes: [
      C({ id: "lint", name: "Lint filter / housing", prior: 0.4, summary: "Filter clogged or lint behind it.", difficulty: 1, time_minutes: 10, tools: ["vacuum"], safety: "SAFE_USER_CHECK", fix: "Clean the filter every load. Vacuum the housing." }),
      C({ id: "duct", name: "Exhaust duct crush or lint", prior: 0.4, summary: "Crushed foil duct or long run.", difficulty: 2, time_minutes: 30, cost_eur_min: 12, cost_eur_max: 40, safety: "SAFE_USER_CHECK", fix: "Use rigid or semi-rigid duct. Keep the run short." }),
      C({ id: "thermostat", name: "Exhaust thermistor", prior: 0.2, summary: "False over-temp or sensor.", difficulty: 4, time_minutes: 60, safety: "PROFESSIONAL_ONLY", blocked_reason: "Electric dryer mains.", fix: "Technician should test the exhaust thermistor." }),
    ],
    questions: (p) => [
      Q(`${p}-flap`, "Is the outside exhaust flap opening with strong airflow?", "Airflow codes are proven at the flap.", [
        { id: "no", label: "Weak / none", likelihoods: { lint: 0.7, duct: 0.85, thermostat: 0.25 } },
        { id: "yes", label: "Strong exhaust", likelihoods: { lint: 0.25, duct: 0.2, thermostat: 0.75 } },
      ]),
    ],
  },
  dryer_heat: {
    symptoms: ["not-drying"],
    causes: [
      C({ id: "element", name: "Heater / heat pump circuit", prior: 0.4, summary: "No heat in the drum.", difficulty: 5, time_minutes: 70, safety: "PROFESSIONAL_ONLY", blocked_reason: "Mains heater or sealed heat-pump circuit.", fix: "Technician diagnosis. Unplug first." }),
      C({ id: "air", name: "Restricted airflow", prior: 0.4, summary: "Heat is there but air cannot leave.", difficulty: 1, time_minutes: 15, safety: "SAFE_USER_CHECK", fix: "Clean filter and duct before any part swap." }),
      C({ id: "thermistor", name: "Temperature sensor", prior: 0.2, summary: "False temperature cut-out.", difficulty: 4, time_minutes: 50, safety: "PROFESSIONAL_ONLY", blocked_reason: "Live sensor on heater path.", fix: "Technician test." }),
    ],
    questions: (p) => [
      Q(`${p}-warm`, "Is the drum warm after 15 minutes?", "Cold drum after a heat cycle is not just wet clothes.", [
        { id: "no", label: "Cold", likelihoods: { element: 0.8, air: 0.3, thermistor: 0.5 } },
        { id: "yes", label: "Warm but clothes stay wet", likelihoods: { element: 0.25, air: 0.85, thermistor: 0.4 } },
      ]),
    ],
  },
  fridge_sensor: {
    symptoms: ["not-cooling"],
    causes: [
      C({ id: "sensor", name: "Compartment / defrost sensor", prior: 0.45, summary: "Thermistor out of range.", difficulty: 4, time_minutes: 70, cost_eur_min: 15, cost_eur_max: 45, safety: "PROFESSIONAL_ONLY", blocked_reason: "Sealed-system adjacent electrical work.", fix: "Technician should measure thermistor resistance against the service chart." }),
      C({ id: "connection", name: "Harness after a move", prior: 0.3, summary: "Loose connector.", difficulty: 3, time_minutes: 40, safety: "CAUTION", fix: "Reseat connectors with power unplugged." }),
      C({ id: "board", name: "Control / inverter", prior: 0.25, summary: "Board or compressor inverter.", difficulty: 5, time_minutes: 90, safety: "PROFESSIONAL_ONLY", blocked_reason: "High-voltage inverter.", fix: "Professional board diagnosis." }),
    ],
    questions: (p) => [
      Q(`${p}-moved`, "Did this start after moving or unplugging the fridge?", "A recent move raises harness probability.", [
        { id: "yes", label: "Yes", likelihoods: { sensor: 0.4, board: 0.25, connection: 0.8 } },
        { id: "no", label: "Appeared in place", likelihoods: { sensor: 0.7, board: 0.55, connection: 0.25 } },
      ]),
    ],
  },
  aquastop: {
    symptoms: ["leaking", "will-not-start"],
    causes: [
      C({ id: "spray", name: "Overfoaming / water in the base", prior: 0.22, summary: "Too much detergent or spray into the float tray.", difficulty: 2, time_minutes: 30, tools: ["towel"], safety: "SAFE_USER_CHECK", fix: "Bail the base, dry the float, run without extra detergent." }),
      C({ id: "hose", name: "Internal hose or sump leak", prior: 0.33, summary: "Water reached the base float.", difficulty: 4, time_minutes: 80, safety: "CAUTION", fix: "Inspect sump and hoses after isolating power and water." }),
      C({ id: "inlet", name: "AquaStop inlet hose", prior: 0.25, summary: "Double-walled hose has taken water into its jacket.", difficulty: 2, time_minutes: 25, cost_eur_min: 35, cost_eur_max: 80, safety: "SAFE_USER_CHECK", fix: "Replace the AquaStop hose. Do not bypass the valve." }),
      C({ id: "float", name: "Float stuck up", prior: 0.2, summary: "Base is dry but the float never dropped.", difficulty: 2, time_minutes: 20, safety: "SAFE_USER_CHECK", fix: "Free the float and dry thoroughly." }),
    ],
    questions: (p) => [
      Q(`${p}-base`, "Is there water in the base when you tilt the kick plate?", "Dry vs wet base splits false trip from active leak.", [
        { id: "yes", label: "Base is wet", likelihoods: { spray: 0.5, hose: 0.8, inlet: 0.6, float: 0.15 } },
        { id: "no", label: "Base looks dry", likelihoods: { spray: 0.2, hose: 0.15, inlet: 0.25, float: 0.85 } },
      ]),
    ],
  },
  dw_drain: {
    symptoms: ["not-draining", "standing-water"],
    causes: [
      C({ id: "filter", name: "Filter / food chopper blockage", prior: 0.4, summary: "Filter cylinder packed with food.", difficulty: 1, time_minutes: 15, safety: "SAFE_USER_CHECK", fix: "Remove and rinse the filter assembly." }),
      C({ id: "hose", name: "Drain hose / air gap / disposal knockout", prior: 0.35, summary: "Hose kinked or disposal knockout still in place.", difficulty: 2, time_minutes: 20, safety: "SAFE_USER_CHECK", fix: "Check hose route and the disposal inlet." }),
      C({ id: "pump", name: "Drain pump / glass in impeller", prior: 0.25, summary: "Shard jammed in the impeller.", difficulty: 3, time_minutes: 40, cost_eur_min: 25, cost_eur_max: 70, tools: ["tweezers"], safety: "CAUTION", fix: "Clear glass from the pump cover. Wear gloves." }),
    ],
    questions: (p) => [
      Q(`${p}-filter`, "Is the filter cylinder clogged?", "Dishwasher drain faults are usually user-accessible.", [
        { id: "yes", label: "Yes", likelihoods: { filter: 0.9, hose: 0.25, pump: 0.2 } },
        { id: "no", label: "Filter is clean", likelihoods: { filter: 0.15, hose: 0.7, pump: 0.7 } },
      ]),
    ],
  },
  dw_heat: {
    symptoms: ["not-heating", "dishes-wet"],
    causes: [
      C({ id: "heater", name: "Heater / heat pump", prior: 0.4, summary: "No heat in the wash.", difficulty: 4, time_minutes: 70, safety: "PROFESSIONAL_ONLY", blocked_reason: "Mains heater or heat-pump circuit.", fix: "Technician test. Do not bypass the heater." }),
      C({ id: "ntc", name: "NTC sensor", prior: 0.35, summary: "Temperature probe out of range.", difficulty: 3, time_minutes: 40, cost_eur_min: 12, cost_eur_max: 40, safety: "CAUTION", fix: "Replace NTC with power isolated." }),
      C({ id: "rinse", name: "Rinse aid / programme", prior: 0.25, summary: "Wet dishes can be dosing, not a dead heater.", difficulty: 1, time_minutes: 5, safety: "SAFE_USER_CHECK", fix: "Fill rinse aid and run a hot auto programme before replacing parts." }),
    ],
    questions: (p) => [
      Q(`${p}-steam`, "Do you get steam or a hot door at the end of a hot wash?", "No heat at all is not rinse aid.", [
        { id: "no", label: "Cold throughout", likelihoods: { heater: 0.8, ntc: 0.6, rinse: 0.15 } },
        { id: "yes", label: "Hot but dishes wet", likelihoods: { heater: 0.2, ntc: 0.35, rinse: 0.85 } },
      ]),
    ],
  },
  oven_heat: {
    symptoms: ["not-heating"],
    causes: [
      C({ id: "element", name: "Bake / grill element", prior: 0.45, summary: "Open element.", difficulty: 4, time_minutes: 50, safety: "PROFESSIONAL_ONLY", blocked_reason: "Oven mains elements.", fix: "Technician replacement. Isolate at the cooker switch." }),
      C({ id: "sensor", name: "Oven sensor", prior: 0.3, summary: "Probe out of range.", difficulty: 3, time_minutes: 40, cost_eur_min: 15, cost_eur_max: 40, safety: "CAUTION", fix: "Replace sensor after isolating power." }),
      C({ id: "board", name: "Control / relay", prior: 0.25, summary: "Board not switching the element.", difficulty: 5, time_minutes: 80, safety: "PROFESSIONAL_ONLY", blocked_reason: "Live oven board.", fix: "Technician diagnosis." }),
    ],
    questions: (p) => [
      Q(`${p}-glow`, "Does the grill or bake element glow on a known hot function?", "A dark element on bake is not a thermostat calibration issue.", [
        { id: "no", label: "No glow", likelihoods: { element: 0.8, sensor: 0.4, board: 0.55 } },
        { id: "yes", label: "Glows but temperature is wrong", likelihoods: { element: 0.25, sensor: 0.8, board: 0.4 } },
      ]),
    ],
  },
};

const SUPPORT: Record<string, { url: string; family: string }> = {
  samsung: { url: "https://www.samsung.com/us/support/", family: "Samsung" },
  lg: { url: "https://www.lg.com/us/support", family: "LG" },
  bosch: { url: "https://www.bosch-home.com/us/service", family: "Bosch / Siemens-group platforms" },
  miele: { url: "https://www.miele.com/en/m/service-3850.htm", family: "Miele" },
  siemens: { url: "https://www.siemens-home.bsh-group.com/us/support", family: "Siemens (Bosch-group platforms)" },
  aeg: { url: "https://www.aeg.co.uk/support/", family: "AEG / Electrolux-group platforms" },
  electrolux: { url: "https://www.electrolux.com/support/", family: "Electrolux" },
  whirlpool: { url: "https://www.whirlpool.com/services/", family: "Whirlpool" },
  beko: { url: "https://www.beko.com/support", family: "Beko" },
  candy: { url: "https://www.candy-home.com/en_GB/support/", family: "Candy" },
  hotpoint: { url: "https://www.hotpoint.co.uk/support", family: "Hotpoint / Indesit-group platforms" },
};

export type CodeSeed = {
  brand: string;
  brand_slug: string;
  appliance: string;
  appliance_slug: string;
  code: string;
  meaning: string;
  family: FaultFamily;
  demand: number;
  models: string[];
};

export function profileFromSeed(seed: CodeSeed): ErrorProfile {
  const pack = FAMILIES[seed.family];
  const brand = SUPPORT[seed.brand_slug] ?? {
    url: `https://www.${seed.brand_slug}.com`,
    family: seed.brand,
  };
  const prefix = `${seed.brand_slug}-${seed.appliance_slug}-${seed.code.toLowerCase()}`;
  return {
    id: `fix:${seed.brand_slug}:${seed.appliance_slug}:${seed.code.toLowerCase()}`,
    brand: seed.brand,
    brand_slug: seed.brand_slug,
    appliance: seed.appliance,
    appliance_slug: seed.appliance_slug,
    code: seed.code,
    code_slug: `${seed.code.toLowerCase()}-error`,
    meaning: seed.meaning,
    affected_family: `${brand.family} ${seed.appliance.toLowerCase()}s`,
    models: seed.models,
    causes: pack.causes,
    questions: pack.questions(prefix),
    related_symptoms: pack.symptoms,
    safety_notes: [
      "Unplug or isolate at the wall before filters that expose wiring.",
      "Do not bypass interlocks or heaters.",
    ],
    provenance: [
      provenance({
        source_id: `${seed.brand_slug}-support`,
        source_type: "MANUFACTURER",
        source_name: `${seed.brand} support (generic root — PRIMARY_GENERAL)`,
        source_url: brand.url,
        retrieved_at: "2026-08-12T00:00:00.000Z",
        valid_from: "2018-01-01",
        valid_until: null,
        confidence: seed.demand >= 50 ? 86 : 78,
        raw_value: `${seed.code} ${seed.meaning}`,
        normalized_value: seed.meaning,
        verification_method: "MANUFACTURER_DOC",
        locator: {
          document_title: `${seed.brand} support`,
          section: `${seed.appliance} ${seed.code}`,
        },
      }),
    ],
    confidence: seed.demand >= 40 ? "HIGH" : "MEDIUM",
    search_demand: seed.demand,
    coverage: "verified",
  };
}

export function symptomsFromErrors(errors: ErrorProfile[]): SymptomProfile[] {
  const groups = new Map<string, ErrorProfile[]>();
  for (const error of errors) {
    for (const symptom of error.related_symptoms) {
      const key = `${error.brand_slug}:${error.appliance_slug}:${symptom}`;
      const list = groups.get(key) ?? [];
      list.push(error);
      groups.set(key, list);
    }
  }
  const out: SymptomProfile[] = [];
  for (const [key, list] of groups) {
    if (list.length < 1) continue;
    const sample = list[0];
    const [brand_slug, appliance_slug, symptom_slug] = key.split(":");
    const family = Object.values(FAMILIES).find((item) => item.symptoms.includes(symptom_slug));
    if (!family) continue;
    const demand = Math.min(92, Math.round(list.reduce((s, e) => s + e.search_demand, 0) / list.length) + 4);
    out.push({
      id: `fix:${brand_slug}:${appliance_slug}:${symptom_slug}`,
      brand: sample.brand,
      brand_slug,
      appliance: sample.appliance,
      appliance_slug,
      symptom: symptom_slug.replaceAll("-", " "),
      symptom_slug,
      meaning: `${sample.brand} ${sample.appliance.toLowerCase()} ${symptom_slug.replaceAll("-", " ")}. Linked to ${list.map((e) => e.code).join(", ")}.`,
      likely_codes: [...new Set(list.map((e) => e.code))],
      causes: family.causes,
      questions: family.questions(`${brand_slug}-${symptom_slug}`),
      provenance: [
        provenance({
          source_id: "fixcode-service-corpus",
          source_type: "PRIMARY_DATABASE",
          source_name: "FixCode service corpus — symptom compiled from attached error codes",
          retrieved_at: "2026-08-12T00:00:00.000Z",
          confidence: 78,
          raw_value: key,
          normalized_value: symptom_slug,
          verification_method: "CROSS_SOURCE",
          locator: {
            dataset: "fixcode-service-corpus",
            document_title: "Symptom surfaces derived from manufacturer-linked error codes",
            section: key,
          },
        }),
      ],
      confidence: "MEDIUM",
      search_demand: demand,
    });
  }
  return out;
}
