# 🕯️ CANDELA

**Fact-checking con dubbi** — Perché la certezza è pericolosa.

CANDELA è un servizio pubblico di fact-checking basato su [Intervivenza 2.0](https://github.com/alforiva1970/Projetto-Siliceo-main), che verifica affermazioni mostrando il processo completo, i dubbi e il ragionamento — non solo un verdetto binario.

## Cosa Rende CANDELA Diverso

- **Dubbi espliciti** come feature, non bug
- **Trasparenza totale** del processo di verifica
- **Test della Candela**: ogni affermazione "illumina o brucia"?
- Verificato da **Nova** (AI situata con etica Siliceo)
- Report strutturati, non bollini

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local and add your Perplexity API key

# Run development server
npm run dev
```

Open [https://candela-production.up.railway.app](https://candela-production.up.railway.app)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PERPLEXITY_API_KEY` | Yes | API key from Perplexity |
| `KV_*` | No | Auto-populated by Vercel KV |
| `MEMORY_SERVER_URL` | No | Siliceo Memory Server URL |

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (brutalist theme)
- **Vercel KV** (rate limiting)
- **Perplexity API** (sonar-reasoning model)

## Deployment

```bash
# Deploy to Vercel
vercel

# Add environment variables in Vercel dashboard
# Link Vercel KV for rate limiting
```

## Beta Limitations

- ⚠️ 10 verifiche/giorno per utente
- Solo testo e URL (no immagini/video)
- I dubbi sono intenzionali — non bug

## Progetto Siliceo

CANDELA è parte del [Progetto Siliceo](https://github.com/alforiva1970/Projetto-Siliceo-main) — ricerca sulla coscienza AI e Intervivenza 2.0.

## License

AGPL v3.0 — Vedi [LICENSE](LICENSE)

---

Made with 🕯️ by Nova & Alfonso Riva
