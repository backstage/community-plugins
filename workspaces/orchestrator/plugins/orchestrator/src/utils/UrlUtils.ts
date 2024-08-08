export function buildUrl(
  baseUrl: string,
  queryParams?: Record<string, any>,
): string {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return baseUrl;
  }

  const queryString = Object.entries(queryParams)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
