import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

export async function getSecretValue(secretId: string): Promise<string> {
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretId,
    });
    const response = await client.send(command);
    return response.SecretString || '';
  } catch (error) {
    console.error('Error getting secret:', error);
    throw error;
  }
}
