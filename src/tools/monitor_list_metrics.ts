import { MonitorClient } from "@azure/arm-monitor";
import { DefaultAzureCredential } from "@azure/identity";
import { z } from "zod";

export const monitorListMetricsSchema = z.object({
  resource_uri: z.string().describe("Full Azure resource URI"),
  metric_names: z.string().describe("Comma-separated metric names"),
  timespan: z.string().optional().describe("ISO 8601 timespan (e.g., PT1H, P1D)"),
  interval: z.string().optional().describe("Aggregation interval (e.g., PT5M)"),
});

export type MonitorListMetricsInput = z.infer<typeof monitorListMetricsSchema>;

export async function monitorListMetrics(input: MonitorListMetricsInput): Promise<string> {
  const credential = new DefaultAzureCredential();
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
  const client = new MonitorClient(credential, subscriptionId);

  const result = await client.metrics.list(input.resource_uri, {
    metricnames: input.metric_names,
    timespan: input.timespan,
    interval: input.interval,
  });

  const metrics = (result.value ?? []).map((metric) => ({
    name: metric.name?.value,
    unit: metric.unit,
    timeseries: (metric.timeseries ?? []).map((ts) => ({
      data: (ts.data ?? []).map((dp) => ({
        timestamp: dp.timeStamp?.toISOString(),
        average: dp.average,
        total: dp.total,
        minimum: dp.minimum,
        maximum: dp.maximum,
        count: dp.count,
      })),
    })),
  }));

  return JSON.stringify(metrics, null, 2);
}
