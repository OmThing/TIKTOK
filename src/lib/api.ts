export type AnyRecord = Record<string, unknown> & { id?: string };

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export async function apiSave<T>(resource: string, payload: AnyRecord): Promise<T> {
  const id = payload.id;
  const response = await fetch(id ? `/api/${resource}/${id}` : `/api/${resource}`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, payload: AnyRecord): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export async function apiDelete(resource: string, id: string): Promise<void> {
  const response = await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await response.text());
}

export async function copyText(value: unknown) {
  const text = String(value ?? "");
  await navigator.clipboard.writeText(text);
}
