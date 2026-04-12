const API_BASE = '/api/db';

export async function fetchCollection<T>(collection: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}/${collection}`);
  if (!res.ok) throw new Error(`Erro ao ler ${collection}`);
  return res.json();
}

export async function createDoc(collection: string, data: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${API_BASE}/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao criar em ${collection}`);
  const result = await res.json();
  return result.id;
}

export async function updateDoc(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API_BASE}/${collection}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar em ${collection}`);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${collection}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Erro ao apagar em ${collection}`);
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
  if (!res.ok) throw new Error('Erro no batch');
  return res.json();
}
