export async function generatePropertyAd(property: {
  name?: string;
  type?: string;
  address?: string;
  area?: number | string;
  rentAmount?: number | string;
}): Promise<string> {
  const res = await fetch("/api/generate-ad", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ property }),
  });
  if (!res.ok) throw new Error("Erro ao gerar anúncio");
  const data = await res.json();
  return data.text;
}

export async function generateMonthlyReport(data: {
  properties: unknown[];
  payments: unknown[];
  expenses: unknown[];
}): Promise<string> {
  const res = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao gerar relatório");
  const json = await res.json();
  return json.text;
}

export async function generateCollectionNotice(
  tenant: { name?: string },
  payment: { amount?: number | string; date?: string }
): Promise<string> {
  const res = await fetch("/api/generate-notice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenant, payment }),
  });
  if (!res.ok) throw new Error("Erro ao gerar notificação");
  const data = await res.json();
  return data.text;
}
