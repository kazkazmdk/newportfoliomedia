export type MachineZone = "inlet" | "pump" | "motor" | "door" | "sensor" | "heater" | "none";
export type WaterStep = "source" | "hose" | "valve" | "control" | MachineZone;

export function zoneFromText(value: string): MachineZone {
  const t = value.toLowerCase();
  if (/(water|hose|inlet|tap|supply|valve|fill|4c|4e)/.test(t)) return "inlet";
  if (/(pump|drain|filter)/.test(t)) return "pump";
  if (/(motor|drum|spin|belt)/.test(t)) return "motor";
  if (/(door|latch|lock)/.test(t)) return "door";
  if (/(sensor|therm|ntc|control)/.test(t)) return "sensor";
  if (/(heat|element|boiler)/.test(t)) return "heater";
  return "none";
}

export function diagnosticPath(step?: WaterStep): { d: string; kind: "water" | "signal" } {
  switch (step) {
    case "source":
      return { d: "M12 72 H36", kind: "water" };
    case "hose":
      return { d: "M12 72 H36 C36 98 68 110 110 110", kind: "water" };
    case "valve":
      return { d: "M36 72 C36 98 68 110 110 113 H144 V148", kind: "water" };
    case "control":
      return { d: "M368 188 V96 H356", kind: "signal" };
    case "inlet":
      return { d: "M12 72 C36 72 36 110 110 113 C148 113 176 113 176 148", kind: "water" };
    case "pump":
      return { d: "M260 400 V452 H156", kind: "water" };
    case "motor":
      return { d: "M194 252 H326", kind: "signal" };
    case "door":
      return { d: "M368 255 H390", kind: "signal" };
    case "heater":
      return { d: "M300 417 H388", kind: "signal" };
    case "sensor":
      return { d: "M368 188 V96 H356", kind: "signal" };
    default:
      return { d: "M12 72 C36 72 36 110 110 113 C148 113 176 113 176 148 C176 200 210 232 260 252", kind: "water" };
  }
}

export function waterStepId(step?: WaterStep): "source" | "hose" | "valve" | "control" | "" {
  if (step === "source" || step === "hose" || step === "valve" || step === "control") return step;
  return "";
}
