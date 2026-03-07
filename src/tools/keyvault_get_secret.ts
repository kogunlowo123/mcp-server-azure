import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { z } from "zod";

export const keyvaultGetSecretSchema = z.object({
  vault_name: z.string().describe("Key Vault name"),
  secret_name: z.string().describe("Secret name"),
});

export type KeyvaultGetSecretInput = z.infer<typeof keyvaultGetSecretSchema>;

export async function keyvaultGetSecret(input: KeyvaultGetSecretInput): Promise<string> {
  const credential = new DefaultAzureCredential();
  const vaultUrl = `https://${input.vault_name}.vault.azure.net`;
  const client = new SecretClient(vaultUrl, credential);

  const secret = await client.getSecret(input.secret_name);

  return JSON.stringify(
    {
      name: secret.name,
      value: secret.value,
      contentType: secret.properties.contentType,
      enabled: secret.properties.enabled,
      createdOn: secret.properties.createdOn?.toISOString(),
      updatedOn: secret.properties.updatedOn?.toISOString(),
      expiresOn: secret.properties.expiresOn?.toISOString(),
    },
    null,
    2
  );
}
