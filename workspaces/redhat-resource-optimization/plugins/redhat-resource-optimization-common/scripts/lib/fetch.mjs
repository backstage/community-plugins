export async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
