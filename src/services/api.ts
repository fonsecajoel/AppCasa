const API_BASE = '/api/db';

async function handleResponse(res: Response, context: string): Promise<unknown> {
  if (res.ok) return res.json();
  let msg = `${context} (HTTP ${res.status})`;
  try {
    const body = await res.json();
    if (body?.error) msg = body.error;
  } catch {}
  throw new Error(msg);
}

export async function fetchCollection<T>(collection: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}/${collection}`);
  return handleResponse(res, `Erro ao ler ${collection}`) as Promise<T[]>;
}

export async function createDoc(collection: string, data: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${API_BASE}/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse(res, `Erro ao criar em ${collection}`) as { id: string };
  return result.id;
}

export async function updateDoc(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API_BASE}/${collection}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await handleResponse(res, `Erro ao atualizar em ${collection}`);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${collection}/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(res, `Erro ao apagar em ${collection}`);
}

interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  collection: string;
  id?: string;
  data?: Record<string, unknown>;
}

export async function batchWrite(operations: BatchOperation[]): Promise<{ ok: boolean; results: { id: string }[] }> {
  const res = await fetch('/api/db-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations }),
  });
  return handleResponse(res, 'Erro no batch') as Promise<{ ok: boolean; results: { id: string }[] }>;
}
