import { ContainerServiceClient } from "@azure/arm-containerservice";
import { DefaultAzureCredential } from "@azure/identity";
import { z } from "zod";

export const aksListClustersSchema = z.object({
  resource_group: z.string().optional().describe("Filter by resource group name"),
});

export type AksListClustersInput = z.infer<typeof aksListClustersSchema>;

export async function aksListClusters(input: AksListClustersInput): Promise<string> {
  const credential = new DefaultAzureCredential();
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
  const client = new ContainerServiceClient(credential, subscriptionId);

  const clusters: Array<Record<string, unknown>> = [];

  if (input.resource_group) {
    for await (const cluster of client.managedClusters.listByResourceGroup(input.resource_group)) {
      clusters.push({
        name: cluster.name,
        id: cluster.id,
        location: cluster.location,
        kubernetesVersion: cluster.kubernetesVersion,
        provisioningState: cluster.provisioningState,
        powerState: cluster.powerState?.code,
        nodeResourceGroup: cluster.nodeResourceGroup,
      });
    }
  } else {
    for await (const cluster of client.managedClusters.list()) {
      clusters.push({
        name: cluster.name,
        id: cluster.id,
        location: cluster.location,
        kubernetesVersion: cluster.kubernetesVersion,
        provisioningState: cluster.provisioningState,
        powerState: cluster.powerState?.code,
        nodeResourceGroup: cluster.nodeResourceGroup,
      });
    }
  }

  return JSON.stringify(clusters, null, 2);
}
