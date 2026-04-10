import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generatePropertyAd(property: any) {
  const prompt = `Gera um anúncio de arrendamento atrativo para o seguinte imóvel:
  Nome: ${property.name}
  Tipo: ${property.type}
  Localização: ${property.address}
  Área: ${property.area}m2
  Renda: ${property.rentAmount}€
  
  Foca na tipologia, área e localização. O tom deve ser profissional e apelativo.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function generateMonthlyReport(data: {
  properties: any[];
  payments: any[];
  expenses: any[];
}) {
  const prompt = `Gera um relatório mensal para o proprietário com base nos seguintes dados:
  Imóveis: ${JSON.stringify(data.properties)}
  Pagamentos: ${JSON.stringify(data.payments)}
  Despesas: ${JSON.stringify(data.expenses)}
  
  O relatório deve incluir um resumo de rendimentos, despesas liquidadas e alertas de incumprimento.
  Usa o Euro (€) como moeda e o formato de data DD/MM/AAAA.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function generateCollectionNotice(tenant: any, payment: any) {
  const prompt = `Gera uma notificação de cobrança profissional e cordial para o inquilino ${tenant.name} com a renda de ${payment.amount}€ em atraso desde ${payment.date}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}
