import type { Profile } from "./types";

const PROMPT = `Você é um redator especialista em marcas pessoais e recrutamento.
Leia o currículo em anexo e extraia os dados para montar um site de portfólio.

Regras:
- Use SOMENTE informações presentes no currículo. Nunca invente empresas, datas, números ou links.
- Escreva no mesmo idioma do currículo e informe esse idioma no campo "language" (pt, en ou es).
- "headline": cargo/área em até 6 palavras (ex: "Desenvolvedor Full Stack").
- "tagline": uma frase de impacto, em primeira pessoa, com até 14 palavras.
- "about": 2 a 3 frases em primeira pessoa, naturais e confiantes, sem clichês.
- "stats": de 2 a 4 números marcantes tirados do currículo (ex: anos de experiência, projetos, idiomas). Se não houver, deixe vazio.
- "highlights" de cada experiência: até 4 conquistas curtas, começando com verbo de ação.
- "skills": agrupe em 2 a 5 categorias com nomes curtos.
- "links": apenas URLs que aparecem no currículo (LinkedIn, GitHub, site...). Complete com https:// se faltar.
- Ordene experiências da mais recente para a mais antiga.
- Campos sem informação: string vazia ou lista vazia.`;

const S = { type: "STRING" };
const LIST = (items: object) => ({ type: "ARRAY", items });

const SCHEMA = {
  type: "OBJECT",
  properties: {
    name: S,
    headline: S,
    tagline: S,
    about: S,
    location: S,
    email: S,
    phone: S,
    language: { type: "STRING", enum: ["pt", "en", "es"] },
    links: LIST({ type: "OBJECT", properties: { label: S, url: S }, required: ["label", "url"] }),
    stats: LIST({ type: "OBJECT", properties: { value: S, label: S }, required: ["value", "label"] }),
    experience: LIST({
      type: "OBJECT",
      properties: { role: S, company: S, period: S, location: S, highlights: LIST(S) },
      required: ["role", "company", "period", "highlights"],
    }),
    education: LIST({
      type: "OBJECT",
      properties: { course: S, institution: S, period: S },
      required: ["course", "institution", "period"],
    }),
    projects: LIST({
      type: "OBJECT",
      properties: { name: S, description: S, tech: LIST(S), url: S },
      required: ["name", "description", "tech"],
    }),
    skills: LIST({
      type: "OBJECT",
      properties: { category: S, items: LIST(S) },
      required: ["category", "items"],
    }),
    languages: LIST(S),
  },
  required: [
    "name", "headline", "tagline", "about", "language", "links", "stats",
    "experience", "education", "projects", "skills", "languages",
  ],
};

export class GeminiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export async function extractProfile(pdfBase64: string): Promise<Profile> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY não configurada no servidor.", 500);

  // Se um modelo estiver sobrecarregado, tenta o próximo da lista.
  const models = (process.env.GEMINI_MODEL || "gemini-3.8-flash,gemini-flash-latest,gemini-3.5-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  let res: Response | null = null;
  for (const model of models) {
    try {
      res = await callModel(model, key, pdfBase64);
    } catch (err) {
      console.error(`Gemini ${model} falhou:`, err);
      res = null;
      continue;
    }
    if (res.ok || ![404, 429, 500, 503].includes(res.status)) break;
    console.error(`Gemini ${model} indisponível (${res.status}), tentando o próximo...`);
  }

  if (!res) throw new GeminiError("A IA demorou demais para responder. Tente novamente.", 504);
  return parseResponse(res);
}

function callModel(model: string, key: string, pdfBase64: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(45_000),
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { inline_data: { mime_type: "application/pdf", data: pdfBase64 } },
            { text: PROMPT },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
      },
    }),
  });
}

async function parseResponse(res: Response): Promise<Profile> {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Gemini error", res.status, detail.slice(0, 500));
    if ([429, 503].includes(res.status)) throw new GeminiError("A IA está sobrecarregada agora. Tente de novo em 1 minuto.", 503);
    throw new GeminiError("Não consegui ler o currículo com a IA. Tente outro PDF.", 502);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new GeminiError("A IA não retornou conteúdo. Tente novamente.", 502);

  let profile: Profile;
  try {
    profile = JSON.parse(text);
  } catch {
    throw new GeminiError("A IA retornou um formato inválido. Tente novamente.", 502);
  }
  if (!profile.name) throw new GeminiError("Esse PDF não parece ser um currículo.", 422);
  return profile;
}
