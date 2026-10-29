import { NextResponse } from "next/server";
import { extractProfile, GeminiError } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 120;

// Vercel aceita no máximo ~4.5 MB por requisição.
const MAX_BYTES = 4 * 1024 * 1024;

// Limite simples por IP (best-effort: cada instância serverless tem a sua memória).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Você atingiu o limite de gerações por hora. Volte daqui a pouco!" },
      { status: 429 },
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Envie um arquivo PDF." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "O PDF precisa ter no máximo 4 MB." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== "%PDF-") {
    return NextResponse.json({ error: "Esse arquivo não é um PDF válido." }, { status: 415 });
  }

  try {
    const profile = await extractProfile(bytes.toString("base64"));
    return NextResponse.json({ profile });
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    const message = err instanceof GeminiError ? err.message : "Erro inesperado. Tente novamente.";
    if (!(err instanceof GeminiError)) console.error(err);
    return NextResponse.json({ error: message }, { status });
  }
}
