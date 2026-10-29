# ✦ Vitrine

**Seu currículo vira um site de portfólio em segundos.**

Envie um currículo em PDF e a IA (Google Gemini) lê sua trajetória, reescreve os textos com mais impacto e monta um site completo, que você personaliza e baixa pronto para publicar.

🔗 **Demo:** https://vitrine-rouge.vercel.app

![Prévia](docs/preview.png)

## Funcionalidades

- 📄 **Upload de PDF** com arrastar e soltar
- 🤖 **Extração com IA**: o Gemini lê o PDF direto (sem OCR) e devolve dados estruturados via JSON Schema
- ✍️ **Copywriting automático**: título, frase de impacto, "sobre" e conquistas reescritos
- 🎨 **3 temas** (Aurora, Editorial, Terminal) + cor de destaque personalizável
- 👀 **Prévia ao vivo** em desktop e celular, com edição dos textos
- ⬇️ **Download** de um único `index.html`, sem dependências, pronto para GitHub Pages / Netlify / Vercel
- 🌎 Detecta o idioma do currículo (PT, EN, ES)
- 🛡️ Validação de arquivo, limite de tamanho e limite de requisições por IP

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Google Gemini API](https://ai.google.dev) (plano gratuito) com *structured output*
- CSS puro, sem bibliotecas de UI
- Deploy na [Vercel](https://vercel.com)

## Como funciona

```
PDF ──► /api/generate ──► Gemini (PDF + prompt + JSON Schema)
                              │
                              ▼
                     Perfil estruturado (JSON)
                              │
                              ▼
         renderSite(perfil, tema)  ──►  HTML único
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
          Prévia (iframe)           Download (.html)
```

O mesmo gerador ([lib/templates.ts](lib/templates.ts)) produz a prévia e o arquivo baixado, então o que você vê é exatamente o que vai para o ar.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # e cole sua chave
npm run dev
```

Pegue uma chave gratuita do Gemini em **https://aistudio.google.com/apikey**.

## Deploy na Vercel

1. Suba o repositório no GitHub
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório
3. Em **Environment Variables**, adicione `GEMINI_API_KEY`
4. Clique em **Deploy**

## Privacidade

O PDF é enviado ao Gemini só para gerar o site e não fica salvo em nenhum lugar.

## Licença

MIT
