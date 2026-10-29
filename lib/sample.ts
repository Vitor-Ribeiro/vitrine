import type { Profile } from "./types";

// Perfil fictício usado no botão "Ver exemplo".
export const SAMPLE_PROFILE: Profile = {
  name: "Marina Duarte",
  headline: "Engenheira de Software Full Stack",
  tagline: "Construo produtos rápidos, acessíveis e que as pessoas gostam de usar.",
  about:
    "Sou engenheira de software há 6 anos, com foco em produtos web de alto tráfego. Gosto de transformar problemas confusos em interfaces simples e de cuidar da performance de ponta a ponta. Hoje lidero um time pequeno e ainda escrevo código todos os dias.",
  location: "São Paulo, Brasil",
  email: "marina@exemplo.com",
  links: [
    { label: "GitHub", url: "https://github.com" },
    { label: "LinkedIn", url: "https://linkedin.com" },
  ],
  stats: [
    { value: "6+", label: "anos de experiência" },
    { value: "2M", label: "usuários impactados" },
    { value: "30+", label: "projetos entregues" },
    { value: "3", label: "idiomas" },
  ],
  experience: [
    {
      role: "Tech Lead",
      company: "Fintech Aurora",
      period: "2023 — Atual",
      location: "Remoto",
      highlights: [
        "Liderei a reescrita do app web, reduzindo o tempo de carregamento em 62%",
        "Montei e mentorei um time de 5 pessoas desenvolvedoras",
        "Implantei testes automatizados que cortaram bugs em produção pela metade",
      ],
    },
    {
      role: "Desenvolvedora Full Stack",
      company: "Loja Nuvem",
      period: "2020 — 2023",
      location: "São Paulo",
      highlights: [
        "Criei o checkout em um clique usado por 2 milhões de clientes",
        "Migrei a API monolítica para microsserviços em Node.js",
      ],
    },
    {
      role: "Desenvolvedora Front-end",
      company: "Agência Pixel",
      period: "2018 — 2020",
      highlights: ["Entreguei mais de 20 sites para clientes de varejo e educação"],
    },
  ],
  education: [
    { course: "Ciência da Computação", institution: "Universidade de São Paulo", period: "2014 — 2018" },
  ],
  projects: [
    {
      name: "Orbita",
      description: "Painel open source para monitorar a performance de sites em tempo real.",
      tech: ["Next.js", "WebSockets", "Postgres"],
      url: "https://github.com",
    },
    {
      name: "Receitinha",
      description: "App que sugere receitas com o que você tem na geladeira usando IA.",
      tech: ["React Native", "OpenAI", "Firebase"],
    },
    {
      name: "a11y-check",
      description: "Extensão de navegador que aponta problemas de acessibilidade na página.",
      tech: ["TypeScript", "Chrome APIs"],
    },
  ],
  skills: [
    { category: "Front-end", items: ["React", "Next.js", "TypeScript", "CSS moderno", "Acessibilidade"] },
    { category: "Back-end", items: ["Node.js", "PostgreSQL", "Redis", "GraphQL"] },
    { category: "Infra", items: ["AWS", "Docker", "CI/CD", "Vercel"] },
  ],
  languages: ["Português (nativo)", "Inglês (fluente)", "Espanhol (intermediário)"],
  language: "pt",
};
