import { ComputeManagementClient } from "@azure/arm-compute";
import { DefaultAzureCredential } from "@azure/identity";
import { z } from "zod";

export const vmListSchema = z.object({
  resource_group: z.string().optional().describe("Filter by resource group name"),
});

export type VmListInput = z.infer<typeof vmListSchema>;

export async function vmList(input: VmListInput): Promise<string> {
  const credential = new DefaultAzureCredential();
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
  const client = new ComputeManagementClient(credential, subscriptionId);

  const vms: Array<Record<string, unknown>> = [];

  if (input.resource_group) {
    for await (const vm of client.virtualMachines.list(input.resource_group)) {
      vms.push({
        name: vm.name,
        id: vm.id,
        location: vm.location,
        vmSize: vm.hardwareProfile?.vmSize,
        provisioningState: vm.provisioningState,
        osType: vm.storageProfile?.osDisk?.osType,
      });
    }
  } else {
    for await (const vm of client.virtualMachines.listAll()) {
      vms.push({
        name: vm.name,
        id: vm.id,
        location: vm.location,
        vmSize: vm.hardwareProfile?.vmSize,
        provisioningState: vm.provisioningState,
        osType: vm.storageProfile?.osDisk?.osType,
      });
    }
  }

  return JSON.stringify(vms, null, 2);
}
