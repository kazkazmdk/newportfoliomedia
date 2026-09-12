import { launchReport } from "@penta/catalog";

const report = launchReport();
console.log(JSON.stringify(report, null, 2));
