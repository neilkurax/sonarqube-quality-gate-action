import { Context } from "@actions/github/lib/context";
import { Condition, QualityGate } from "./models";
import {
  formatMetricKey,
  getStatusEmoji,
  getComparatorSymbol,
  trimTrailingSlash,
  formatStringNumber,
  getCurrentDateTime,
} from "./utils";

const buildRow = (condition: Condition) => {
  const rowValues = [
    formatMetricKey(condition.metricKey), // Metric
    getStatusEmoji(condition.status), // Status
    formatStringNumber(condition.actualValue), // Value
    `${getComparatorSymbol(condition.comparator)} ${condition.errorThreshold}`, // Error Threshold
  ];

  return "|" + rowValues.join("|") + "|";
};

export const buildReport = (
  result: QualityGate,
  hostURL: string,
  projectKey: string,
  context: Context,
  branch?: string
) => {
  const projectURL =
    trimTrailingSlash(hostURL) +
    `/dashboard?id=${projectKey}` +
    (branch ? `&branch=${encodeURIComponent(branch)}` : "");

  const projectStatus = getStatusEmoji(result.projectStatus.status);

  const resultTable = result.projectStatus.conditions.map(buildRow).join("\n");

  const { value: updatedDate, offset: updatedOffset } = getCurrentDateTime();

  return `### SonarQube Quality Gate Result
- **Result**: ${projectStatus}${branch ? `\n- **Branch**: \`${branch}\`` : ""}
- Triggered by @${context.actor} on \`${context.eventName}\`

| METRICAS | ESTADO | VALORES | Error Threshold |
|:--------:|:------:|:-------:|:---------------:|
${resultTable}

[View on SonarQube](${projectURL})
###### _updated: ${updatedDate} (${updatedOffset})_`;
};
