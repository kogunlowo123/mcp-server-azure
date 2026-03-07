import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { vmListSchema, vmList } from "./tools/vm_list";
import { storageListBlobsSchema, storageListBlobs } from "./tools/storage_list_blobs";
import { keyvaultGetSecretSchema, keyvaultGetSecret } from "./tools/keyvault_get_secret";
import { resourceGroupListSchema, resourceGroupList } from "./tools/resource_group_list";
import { aksListClustersSchema, aksListClusters } from "./tools/aks_list_clusters";
import { monitorListMetricsSchema, monitorListMetrics } from "./tools/monitor_list_metrics";

const server = new McpServer({
  name: "mcp-server-azure",
  version: "1.0.0",
});

server.tool(
  "vm_list",
  "List Azure virtual machines, optionally filtered by resource group",
  vmListSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await vmList(input) }],
  })
);

server.tool(
  "storage_list_blobs",
  "List blobs in an Azure Storage container with optional prefix filter",
  storageListBlobsSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await storageListBlobs(input) }],
  })
);

server.tool(
  "keyvault_get_secret",
  "Retrieve a secret from Azure Key Vault by vault and secret name",
  keyvaultGetSecretSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await keyvaultGetSecret(input) }],
  })
);

server.tool(
  "resource_group_list",
  "List all resource groups in the Azure subscription",
  resourceGroupListSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await resourceGroupList(input) }],
  })
);

server.tool(
  "aks_list_clusters",
  "List AKS managed Kubernetes clusters, optionally filtered by resource group",
  aksListClustersSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await aksListClusters(input) }],
  })
);

server.tool(
  "monitor_list_metrics",
  "List Azure Monitor metrics for a given resource URI",
  monitorListMetricsSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await monitorListMetrics(input) }],
  })
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-server-azure running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
