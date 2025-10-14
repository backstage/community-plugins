import { IdentityApi } from '@backstage/core-plugin-api';

export interface CredentialResult {
  token?: string;
  success: boolean;
  error?: string;
}

export async function getCredentialsWithFallback(
  identityApi: IdentityApi,
): Promise<CredentialResult> {
  try {
    // Get credentials from identity API
    const credentials = await identityApi.getCredentials();
    const token = credentials?.token;

    return {
      token,
      success: !!token,
      error: token ? undefined : 'No token received',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export function createAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
