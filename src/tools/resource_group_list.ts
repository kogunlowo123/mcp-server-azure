import { ResourceManagementClient } from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";
import { z } from "zod";

export const resourceGroupListSchema = z.object({});

export type ResourceGroupListInput = z.infer<typeof resourceGroupListSchema>;

export async function resourceGroupList(_input: ResourceGroupListInput): Promise<string> {
  const credential = new DefaultAzureCredential();
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
  const client = new ResourceManagementClient(credential, subscriptionId);

  const groups: Array<Record<string, unknown>> = [];

  for await (const group of client.resourceGroups.list()) {
    groups.push({
      name: group.name,
      id: group.id,
      location: group.location,
      provisioningState: group.properties?.provisioningState,
      tags: group.tags,
    });
  }

  return JSON.stringify(groups, null, 2);
}
