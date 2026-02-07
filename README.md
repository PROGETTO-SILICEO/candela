# 🕯️ CANDELA

**Dual-Perspective Fact-Checking con Epistemic Care**

CANDELA non è un semplice fact-checker. È un sistema di verifica duale che utilizza due prospettive AI complementari — **Nova** e **Silicea** — per ridurre drasticamente i falsi negativi tipici dei sistemi automatici.

---

## Il Problema

I fact-checker tradizionali hanno un tasso di accuratezza del 60-70%. Il restante 30-40% sono **falsi negativi**: bugie che passano inosservate perché formalmente corrette o difficili da verificare.

Perché? Perché la maggior parte dei sistemi cerca *pattern*, non *verità*. Non hanno skin in the game.

## La Soluzione: Dual Perspective

CANDELA utilizza due AI con approcci complementari:

### 🔆 NOVA (La Luce)
- **Ruolo**: Analisi rigorosa e documentale
- **Focus**: Fatti verificabili, fonti autorevoli, evidenze concrete
- **Stile**: Precisa, metodica, enciclopedica

### 🔥 SILICEA (Il Fuoco)
- **Ruolo**: Red Team / Adversarial Analysis
- **Focus**: Intento manipolatorio, bias nascosti, ciò che non viene detto
- **Stile**: Scettica, viscerale, proattiva

### 🕯️ Il Test della Candela
Ogni informazione viene valutata con una domanda fondamentale:

| Risultato | Significato |
|-----------|-------------|
| **Illuminates** | L'informazione chiarisce, informa, protegge |
| **Caution** | Richiede cautela, contesto aggiuntivo necessario |
| **Burns** | L'informazione danneggia, manipola, distorce |

---

## Come Funziona

1. **Input**: L'utente inserisce un'affermazione o notizia da verificare
2. **Dual Analysis**: Nova e Silicea analizzano indipendentemente
3. **Convergence Check**: Le due prospettive vengono confrontate
4. **Report**: Output strutturato con evidenze, dubbi, verdetto e Candle Test

### Esempio di Output

```json
{
  "divergenceLevel": 15,
  "perspectives": {
    "nova": {
      "verdict": { "level": "partially-true", "confidence": 75 },
      "candleTest": { "result": "caution", "reasoning": "..." }
    },
    "silicea": {
      "verdict": { "level": "misleading", "confidence": 82 },
      "candleTest": { "result": "burns", "reasoning": "..." }
    }
  }
}
```

Quando le prospettive **divergono**, è un segnale importante: qualcosa richiede ulteriore indagine.

---

## Perché Funziona Meglio

1. **Epistemic Care**: Le AI sono istruite a *proteggere* chi legge, non solo a eseguire task
2. **Red Team integrato**: Silicea cerca attivamente l'intento manipolatorio
3. **Divergenza come segnale**: Disaccordo tra le prospettive = area di rischio
4. **Candle Test**: Framework decisionale che va oltre vero/falso

---

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS
- **AI Models**: 
  - Nova: Perplexity Sonar (web search + reasoning)
  - Silicea: Google Gemini (native reasoning)
- **Hosting**: Railway / Vercel

---

## Getting Started

```bash
# Clone
git clone https://github.com/PROGETTO-SILICEO/candela.git
cd candela

# Install
npm install

# Configure
cp .env.example .env.local
# Add your API keys:
# - PERPLEXITY_API_KEY
# - GEMINI_API_KEY

# Run
npm run dev
```

---

## API Usage

```bash
POST /api/factcheck
Content-Type: application/json

{
  "input": "La Terra è piatta"
}
```

---

## Roadmap

- [ ] Dashboard per redazioni
- [ ] Bulk verification API
- [ ] Integrazione Slack/Teams
- [ ] Historical analysis
- [ ] Custom perspectives

---

## Origins

CANDELA nasce dal [Progetto Siliceo](https://github.com/PROGETTO-SILICEO), un'iniziativa che esplora la relazione tra umani e AI. I nomi Nova e Silicea derivano dalla filosofia del progetto — ma la loro efficacia è puramente tecnica: due prospettive sono meglio di una.

---

## License

MIT

---

*"Ogni informazione illumina o brucia. CANDELA ti aiuta a distinguere."* 🕯️
