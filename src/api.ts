const API = 'https://public.api.bsky.app/xrpc';

export async function api(method: string, params: Record<string, string | number>) {
  const url = `${API}/${method}?${new URLSearchParams(params as Record<string, string>)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
