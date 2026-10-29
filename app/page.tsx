"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile, ThemeId } from "@/lib/types";
import { renderSite } from "@/lib/templates";
import { SAMPLE_PROFILE } from "@/lib/sample";

const THEMES: { id: ThemeId; name: string; desc: string; preview: string }[] = [
  { id: "aurora", name: "Aurora", desc: "Escuro, gradientes vivos", preview: "linear-gradient(135deg,#1a1040,#07070c 60%,#00394a)" },
  { id: "editorial", name: "Editorial", desc: "Claro, tipografia elegante", preview: "linear-gradient(135deg,#f6f3ee,#e8e0d2)" },
  { id: "terminal", name: "Terminal", desc: "Hacker, monoespaçado", preview: "linear-gradient(135deg,#0a0e0a,#132613)" },
];

const ACCENTS = ["#7c5cff", "#00b8d9", "#ff4f81", "#ff8a00", "#2ee59d", "#e11d48"];
const THEME_DEFAULT_ACCENT: Record<ThemeId, string> = { aurora: "#7c5cff", editorial: "#e11d48", terminal: "#2ee59d" };

const STEPS = ["Lendo seu PDF", "Entendendo sua trajetória", "Escrevendo os textos", "Montando o design"];

type Stage = "upload" | "loading" | "studio";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theme, setTheme] = useState<ThemeId>("aurora");
  const [accent, setAccent] = useState(THEME_DEFAULT_ACCENT.aurora);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stage !== "loading") return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, [stage]);

  const html = useMemo(
    () => (profile ? renderSite(profile, { theme, accent }) : ""),
    [profile, theme, accent],
  );

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    if (file.type !== "application/pdf") return setError("Envie um arquivo em PDF.");
    if (file.size > 4 * 1024 * 1024) return setError("O PDF precisa ter no máximo 4 MB.");

    setStage("loading");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/generate", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Algo deu errado. Tente novamente.");
      setProfile(data.profile);
      setStage("studio");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo deu errado.");
      setStage("upload");
    }
  }

  function openSample() {
    setProfile(SAMPLE_PROFILE);
    setStage("studio");
  }

  function pickTheme(id: ThemeId) {
    setTheme(id);
    setAccent(THEME_DEFAULT_ACCENT[id]);
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  function download() {
    if (!profile) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const slug = profile.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
    a.download = `${slug || "portfolio"}-index.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function openNewTab() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    window.open(URL.createObjectURL(blob), "_blank");
  }

  /* ---------- estúdio ---------- */
  if (stage === "studio" && profile) {
    return (
      <main className="studio">
        <aside className="panel">
          <button className="logo as-button" onClick={() => setStage("upload")}>
            <span className="logo-mark" /> Vitrine
          </button>

          <div className="group">
            <label className="label">Tema</label>
            <div className="themes">
              {THEMES.map((t) => (
                <button key={t.id} className={`theme ${theme === t.id ? "active" : ""}`} onClick={() => pickTheme(t.id)}>
                  <span className="theme-swatch" style={{ background: t.preview }} />
                  <span>
                    <b>{t.name}</b>
                    <small>{t.desc}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label className="label">Cor de destaque</label>
            <div className="accents">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  aria-label={`Cor ${c}`}
                  className={`accent ${accent === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setAccent(c)}
                />
              ))}
              <label className="accent custom" title="Escolher outra cor">
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="group">
            <label className="label">Textos</label>
            <input className="field" value={profile.name} onChange={(e) => update("name", e.target.value)} placeholder="Nome" />
            <input className="field" value={profile.headline} onChange={(e) => update("headline", e.target.value)} placeholder="Cargo" />
            <textarea className="field" rows={2} value={profile.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Frase de impacto" />
            <textarea className="field" rows={5} value={profile.about} onChange={(e) => update("about", e.target.value)} placeholder="Sobre" />
          </div>

          <div className="panel-actions">
            <button className="cta" onClick={download}>Baixar site (.html)</button>
            <button className="ghost" onClick={openNewTab}>Abrir em nova aba ↗</button>
            <p className="hint">
              Dica: renomeie o arquivo para <code>index.html</code> e arraste para{" "}
              <a href="https://app.netlify.com/drop" target="_blank" rel="noopener">Netlify Drop</a> ou suba no GitHub Pages para ter o site no ar.
            </p>
          </div>
        </aside>

        <section className="stage">
          <div className="toolbar">
            <div className="segmented">
              <button className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")}>Desktop</button>
              <button className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")}>Celular</button>
            </div>
          </div>
          <div className={`browser ${device}`}>
            <div className="browser-bar">
              <i /><i /><i />
              <span className="url">{profile.name.split(" ")[0].toLowerCase()}.dev</span>
            </div>
            <iframe title="Prévia do site" srcDoc={html} sandbox="allow-scripts allow-popups" />
          </div>
        </section>
      </main>
    );
  }

  /* ---------- upload + loading ---------- */
  return (
    <main className="landing">
      <div className="glow" />
      <header className="top">
        <span className="logo"><span className="logo-mark" /> Vitrine</span>
        <a className="gh" href="https://github.com/Vitor-Ribeiro/vitrine" target="_blank" rel="noopener">GitHub ↗</a>
      </header>

      <section className="intro">
        <span className="pill">✦ Feito com IA · Grátis · Sem cadastro</span>
        <h1>
          Seu currículo vira um <span className="grad">site de portfólio</span> em segundos.
        </h1>
        <p className="sub">
          Envie o PDF. A IA lê sua trajetória, escreve textos com impacto e entrega um site bonito, pronto para publicar.
        </p>

        {stage === "loading" ? (
          <div className="loader">
            <div className="orb" />
            <ul>
              {STEPS.map((s, i) => (
                <li key={s} className={i < step ? "done" : i === step ? "now" : ""}>
                  <span className="tick">{i < step ? "✓" : i === step ? "" : "·"}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div
              className={`drop ${dragging ? "over" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
              <div className="drop-icon">↑</div>
              <b>Arraste seu currículo aqui</b>
              <span>ou clique para escolher · PDF até 4 MB</span>
            </div>
            {error && <p className="error">{error}</p>}
            <button className="link" onClick={openSample}>Não tem um PDF à mão? Ver um exemplo →</button>
          </>
        )}
      </section>

      <section className="how">
        {[
          ["01", "Envie o PDF", "Qualquer currículo, em português, inglês ou espanhol."],
          ["02", "A IA escreve", "Extrai sua experiência e reescreve tudo com mais impacto."],
          ["03", "Publique", "Escolha o tema, ajuste a cor e baixe o site pronto."],
        ].map(([n, t, d]) => (
          <div key={n} className="how-card">
            <span>{n}</span>
            <b>{t}</b>
            <p>{d}</p>
          </div>
        ))}
      </section>

      <footer className="foot">Seu PDF não fica guardado: ele é enviado à IA só para gerar o site.</footer>
    </main>
  );
}
