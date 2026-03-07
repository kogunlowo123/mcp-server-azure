import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { z } from "zod";

export const storageListBlobsSchema = z.object({
  account_name: z.string().describe("Azure Storage account name"),
  container_name: z.string().describe("Blob container name"),
  prefix: z.string().optional().describe("Blob name prefix filter"),
});

export type StorageListBlobsInput = z.infer<typeof storageListBlobsSchema>;

export async function storageListBlobs(input: StorageListBlobsInput): Promise<string> {
  const credential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(
    `https://${input.account_name}.blob.core.windows.net`,
    credential
  );

  const containerClient = blobServiceClient.getContainerClient(input.container_name);

  const blobs: Array<Record<string, unknown>> = [];

  for await (const blob of containerClient.listBlobsFlat({ prefix: input.prefix })) {
    blobs.push({
      name: blob.name,
      contentLength: blob.properties.contentLength,
      contentType: blob.properties.contentType,
      lastModified: blob.properties.lastModified?.toISOString(),
      blobType: blob.properties.blobType,
    });
  }

  return JSON.stringify(blobs, null, 2);
}
