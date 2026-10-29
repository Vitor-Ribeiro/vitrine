import type { Profile, SiteOptions, ThemeId } from "./types";

/* ---------- utilidades ---------- */

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function safeUrl(raw?: string) {
  if (!raw) return "";
  let u = raw.trim();
  if (!/^[a-z]+:/i.test(u)) u = "https://" + u;
  return /^(https?:|mailto:)/i.test(u) ? esc(u) : "";
}

const safeColor = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c : "#7c5cff");

const LABELS = {
  pt: { about: "Sobre", exp: "Experiência", projects: "Projetos", skills: "Habilidades", edu: "Formação", contact: "Contato", talk: "Vamos conversar?", talkSub: "Estou aberto a novas oportunidades e colaborações.", langs: "Idiomas", made: "Feito com Vitrine" },
  en: { about: "About", exp: "Experience", projects: "Projects", skills: "Skills", edu: "Education", contact: "Contact", talk: "Let's talk?", talkSub: "I'm open to new opportunities and collaborations.", langs: "Languages", made: "Made with Vitrine" },
  es: { about: "Sobre mí", exp: "Experiencia", projects: "Proyectos", skills: "Habilidades", edu: "Formación", contact: "Contacto", talk: "¿Hablamos?", talkSub: "Estoy abierto a nuevas oportunidades y colaboraciones.", langs: "Idiomas", made: "Hecho con Vitrine" },
};

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/* ---------- temas ---------- */

const FONTS: Record<ThemeId, string> = {
  aurora: "family=Inter:wght@400;500;600;800&family=Space+Grotesk:wght@500;700",
  editorial: "family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600",
  terminal: "family=JetBrains+Mono:wght@400;600;800",
};

const THEME_CSS: Record<ThemeId, string> = {
  aurora: `
    :root{--bg:#07070c;--fg:#ecebf5;--muted:#9b99ad;--card:rgba(255,255,255,.04);--line:rgba(255,255,255,.09);--radius:18px}
    body{font-family:Inter,system-ui,sans-serif}
    h1,h2,h3,.brand{font-family:'Space Grotesk',Inter,sans-serif;letter-spacing:-.02em}
    .bg{position:fixed;inset:0;z-index:-1;overflow:hidden}
    .bg span{position:absolute;width:55vmax;height:55vmax;border-radius:50%;filter:blur(110px);opacity:.28;animation:float 18s ease-in-out infinite alternate}
    .bg span:nth-child(1){background:var(--accent);top:-20vmax;left:-15vmax}
    .bg span:nth-child(2){background:#00d4ff;bottom:-25vmax;right:-15vmax;animation-delay:-6s;opacity:.22}
    .bg span:nth-child(3){background:#ff4fd8;top:30%;left:45%;width:30vmax;height:30vmax;animation-delay:-12s;opacity:.15}
    @keyframes float{to{transform:translate(6vmax,4vmax) scale(1.1)}}
    .hero h1{font-size:clamp(2.8rem,8vw,6rem);line-height:.95;background:linear-gradient(120deg,#fff 30%,var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent}
    .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);backdrop-filter:blur(12px)}
    .btn{border-radius:999px}
  `,
  editorial: `
    :root{--bg:#f6f3ee;--fg:#16140f;--muted:#6b665c;--card:#fffdf9;--line:#e3ddd2;--radius:4px}
    body{font-family:Inter,system-ui,sans-serif}
    h1,h2,h3,.brand{font-family:'Instrument Serif',Georgia,serif;font-weight:400;letter-spacing:-.01em}
    .bg{display:none}
    .hero h1{font-size:clamp(3.2rem,10vw,7.5rem);line-height:.9}
    .hero h1 em{color:var(--accent)}
    h2{font-size:clamp(2.2rem,5vw,3.4rem)!important;font-style:italic}
    h3{font-size:1.5rem!important}
    .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius)}
    .section-num{font-family:Inter;font-size:.8rem;color:var(--accent);letter-spacing:.2em}
    .btn{border-radius:2px}
    .btn.primary{color:#fff}
  `,
  terminal: `
    :root{--bg:#0a0e0a;--fg:#d6f5d6;--muted:#6f8f6f;--card:#0f150f;--line:#1f2d1f;--radius:6px}
    body{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:15px}
    .bg{position:fixed;inset:0;z-index:-1;background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px);pointer-events:none}
    .hero h1{font-size:clamp(2.2rem,6.5vw,4.6rem);line-height:1.05}
    .hero h1::before{content:'> ';color:var(--accent)}
    .hero h1::after{content:'_';color:var(--accent);animation:blink 1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    h2::before{content:'## ';color:var(--accent)}
    .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius)}
    .chip::before{content:'#';opacity:.5}
    .btn{border-radius:4px}
    .btn.primary{color:#04140a}
  `,
};

const BASE_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--fg);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  a{color:inherit}
  .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
  nav{position:sticky;top:0;z-index:10;backdrop-filter:blur(14px);background:color-mix(in srgb,var(--bg) 75%,transparent);border-bottom:1px solid var(--line)}
  nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
  .brand{font-weight:700;font-size:1.1rem;text-decoration:none;display:flex;align-items:center;gap:10px}
  .avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff;font-size:.8rem;font-weight:700;font-family:Inter,sans-serif}
  nav ul{display:flex;gap:26px;list-style:none;font-size:.9rem}
  nav ul a{text-decoration:none;color:var(--muted);transition:color .2s}
  nav ul a:hover{color:var(--fg)}
  .hero{min-height:calc(min(100vh,960px) - 64px);display:flex;flex-direction:column;justify-content:center;padding:80px 24px}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:.85rem;color:var(--muted);margin-bottom:22px}
  .dot{width:8px;height:8px;border-radius:50%;background:#2ee59d;box-shadow:0 0 12px #2ee59d}
  .hero .headline{font-size:clamp(1.1rem,2.4vw,1.5rem);color:var(--accent);margin:18px 0 10px;font-weight:600}
  .hero .tagline{font-size:clamp(1rem,2vw,1.25rem);color:var(--muted);max-width:640px}
  .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;text-decoration:none;font-weight:600;font-size:.92rem;border:1px solid var(--line);transition:transform .2s,border-color .2s,background .2s}
  .btn:hover{transform:translateY(-2px);border-color:var(--accent)}
  .btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-top:70px}
  .stat{padding:22px}
  .stat b{display:block;font-size:2.2rem;line-height:1;color:var(--accent);font-family:inherit}
  .stat span{color:var(--muted);font-size:.85rem}
  section{padding:90px 0}
  h2{font-size:clamp(1.8rem,4vw,2.6rem);margin-bottom:36px;line-height:1.1}
  .about{font-size:clamp(1.1rem,2.2vw,1.45rem);max-width:820px;line-height:1.55}
  .timeline{display:grid;gap:18px}
  .job{padding:28px;display:grid;grid-template-columns:200px 1fr;gap:24px}
  .job .when{color:var(--muted);font-size:.85rem}
  .job h3{font-size:1.2rem;margin-bottom:2px}
  .job .company{color:var(--accent);font-weight:600;font-size:.95rem;margin-bottom:12px}
  .job ul{padding-left:18px;color:var(--muted);display:grid;gap:6px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
  .project{padding:26px;display:flex;flex-direction:column;gap:12px;transition:transform .25s,border-color .25s;text-decoration:none}
  .project:hover{transform:translateY(-4px);border-color:var(--accent)}
  .project h3{font-size:1.2rem}
  .project p{color:var(--muted);font-size:.95rem;flex:1}
  .chips{display:flex;flex-wrap:wrap;gap:8px}
  .chip{font-size:.78rem;padding:5px 12px;border:1px solid var(--line);border-radius:999px;color:var(--fg);background:color-mix(in srgb,var(--accent) 8%,transparent)}
  .skills{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
  .skills .card{padding:24px}
  .skills h3{font-size:1rem;margin-bottom:14px;color:var(--accent)}
  .edu{padding:22px 26px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .edu h3{font-size:1.1rem}
  .edu span{color:var(--muted);font-size:.9rem}
  .contact{text-align:center;padding:120px 0}
  .contact h2{font-size:clamp(2.4rem,7vw,5rem)}
  .contact p{color:var(--muted);margin:-16px 0 32px}
  .contact .actions{justify-content:center}
  footer{border-top:1px solid var(--line);padding:28px 0;color:var(--muted);font-size:.8rem}
  footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
  .reveal{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s ease}
  .reveal.in{opacity:1;transform:none}
  @media (max-width:720px){nav ul{display:none}.job{grid-template-columns:1fr;gap:6px}section{padding:64px 0}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.reveal{opacity:1;transform:none}}
`;

/* ---------- gerador ---------- */

export function renderSite(p: Profile, opts: SiteOptions): string {
  const L = LABELS[p.language] ?? LABELS.pt;
  const accent = safeColor(opts.accent);
  const theme = opts.theme;

  const links = (p.links ?? []).map((l) => ({ ...l, href: safeUrl(l.url) })).filter((l) => l.href);
  const mail = p.email ? `mailto:${esc(p.email)}` : "";

  const has = {
    about: !!p.about,
    exp: p.experience?.length > 0,
    projects: p.projects?.length > 0,
    skills: p.skills?.length > 0 || p.languages?.length > 0,
    edu: p.education?.length > 0,
  };

  let n = 0;
  const title = (label: string) =>
    theme === "editorial"
      ? `<div class="section-num">${String(++n).padStart(2, "0")} —</div><h2>${esc(label)}</h2>`
      : `<h2>${esc(label)}</h2>`;

  // No tema editorial, o sobrenome fica em itálico com a cor de destaque.
  const nameParts = esc(p.name).split(" ");
  const heroName =
    theme === "editorial" && nameParts.length > 1
      ? `${nameParts.slice(0, -1).join(" ")} <em>${nameParts.at(-1)}</em>`
      : esc(p.name);

  const nav = [
    has.about && `<li><a href="#sobre">${L.about}</a></li>`,
    has.exp && `<li><a href="#experiencia">${L.exp}</a></li>`,
    has.projects && `<li><a href="#projetos">${L.projects}</a></li>`,
    has.skills && `<li><a href="#habilidades">${L.skills}</a></li>`,
    `<li><a href="#contato">${L.contact}</a></li>`,
  ].filter(Boolean).join("");

  const linkButtons = links
    .map((l) => `<a class="btn" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${esc(p.language || "pt")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.name)} — ${esc(p.headline)}</title>
<meta name="description" content="${esc(p.tagline)}">
<meta property="og:title" content="${esc(p.name)} — ${esc(p.headline)}">
<meta property="og:description" content="${esc(p.tagline)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${FONTS[theme]}&display=swap" rel="stylesheet">
<style>${BASE_CSS}${THEME_CSS[theme]}:root{--accent:${accent}}</style>
</head>
<body>
<div class="bg"><span></span><span></span><span></span></div>

<nav><div class="wrap">
  <a class="brand" href="#"><span class="avatar">${esc(initials(p.name))}</span>${esc(p.name.split(" ")[0])}</a>
  <ul>${nav}</ul>
</div></nav>

<header class="hero wrap">
  ${p.location ? `<div class="eyebrow reveal"><span class="dot"></span>${esc(p.location)}</div>` : ""}
  <h1 class="reveal">${heroName}</h1>
  <p class="headline reveal">${esc(p.headline)}</p>
  <p class="tagline reveal">${esc(p.tagline)}</p>
  <div class="actions reveal">
    ${mail ? `<a class="btn primary" href="${mail}">${L.contact} →</a>` : ""}
    ${linkButtons}
  </div>
  ${p.stats?.length ? `<div class="stats">${p.stats.map((s) => `<div class="stat card reveal"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}</div>` : ""}
</header>

${has.about ? `<section id="sobre"><div class="wrap">${title(L.about)}<p class="about reveal">${esc(p.about)}</p></div></section>` : ""}

${has.exp ? `<section id="experiencia"><div class="wrap">${title(L.exp)}<div class="timeline">
${p.experience.map((e) => `<article class="job card reveal">
  <div class="when">${esc(e.period)}${e.location ? `<br>${esc(e.location)}` : ""}</div>
  <div><h3>${esc(e.role)}</h3><div class="company">${esc(e.company)}</div>
  ${e.highlights?.length ? `<ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}</div>
</article>`).join("")}
</div></div></section>` : ""}

${has.projects ? `<section id="projetos"><div class="wrap">${title(L.projects)}<div class="grid">
${p.projects.map((pr) => {
  const href = safeUrl(pr.url);
  const tag = href ? "a" : "div";
  const attrs = href ? ` href="${href}" target="_blank" rel="noopener"` : "";
  return `<${tag} class="project card reveal"${attrs}>
  <h3>${esc(pr.name)}${href ? " ↗" : ""}</h3><p>${esc(pr.description)}</p>
  ${pr.tech?.length ? `<div class="chips">${pr.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
</${tag}>`;
}).join("")}
</div></div></section>` : ""}

${has.skills ? `<section id="habilidades"><div class="wrap">${title(L.skills)}<div class="skills">
${(p.skills ?? []).map((g) => `<div class="card reveal"><h3>${esc(g.category)}</h3><div class="chips">${g.items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div></div>`).join("")}
${p.languages?.length ? `<div class="card reveal"><h3>${L.langs}</h3><div class="chips">${p.languages.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div></div>` : ""}
</div></div></section>` : ""}

${has.edu ? `<section id="formacao"><div class="wrap">${title(L.edu)}<div class="timeline">
${p.education.map((e) => `<div class="edu card reveal"><div><h3>${esc(e.course)}</h3><span>${esc(e.institution)}</span></div><span>${esc(e.period)}</span></div>`).join("")}
</div></div></section>` : ""}

<section id="contato" class="contact"><div class="wrap">
  <h2 class="reveal">${L.talk}</h2>
  <p class="reveal">${L.talkSub}</p>
  <div class="actions reveal">
    ${mail ? `<a class="btn primary" href="${mail}">${esc(p.email)}</a>` : ""}
    ${linkButtons}
  </div>
</div></section>

<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(p.name)}</span><span>${L.made}</span></div></footer>

<script>
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
</script>
</body>
</html>`;

  return html;
}
