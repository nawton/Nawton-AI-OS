# Nawton AI OS

Företagets digitala hjärna — ett internt operativsystem för en modern webbyrå. En AI-agent som förstår verksamheten, ger rekommendationer och utför arbete genom integrationer, inte bara en chatbot.

## MVP v1 — vad finns idag

1. **Översikt (Dashboard)** — daglig AI-sammanfattning genererad från riktig data (omsättning, försenade projekt, obetalda fakturor, kunder som inte hörts av på ett tag).
2. **AI Chat** — en agent med function calling mot riktig företagsdata (kunder, leads, projekt, fakturor). Svarar i agent-stil ("jag har analyserat...") snarare än som en generisk chatbot.
3. **CRM** — kunder och leads, med kundprofil (status, projekt, värde, kontakter, historik) och lead-profil (AI-analys: bransch, potential, rekommenderad tjänst, föreslaget pris, nästa steg).
4. **E-post** — inkorg med AI-klassificering av inkommande leads (bransch/potential/tjänst/pris/nästa steg), på begäran eller förifyllt.
5. **Projekt** — status, deadline, budget, ansvarig, uppgifter, filer och kommunikation per projekt.
6. **Uppgifter** — kanban-tavla över alla projekt.

Fyra ytterligare moduler (Ekonomi, Kunskapsbank, Utveckling, Automation) finns som platshållare i sidomenyn — deras datamodeller (`Invoice`, `AIMemory`, `Workflow`) och integrationsadaptrar finns redan, se **Arkitektur** nedan.

## Teknisk stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend:** Next.js Route Handlers + Server Actions, Node.js
- **Databas:** PostgreSQL + Prisma ORM
- **AI:** OpenAI API (function calling, JSON mode) med deterministisk demo-fallback när ingen API-nyckel finns
- **Auth:** NextAuth v5 (Credentials-provider av start; Account/Session-modeller redo för Google/GitHub OAuth)

## Komma igång

```bash
# 1. Starta Postgres (docker-compose eller egen lokal instans)
docker compose up -d postgres

# 2. Kopiera env och fyll i det du har (OPENAI_API_KEY är valfri — demo-läge fungerar utan)
cp .env.example .env

# 3. Installera beroenden
npm install

# 4. Kör migrationer + seed
npm run db:migrate
npm run db:seed

# 5. Starta dev-servern
npm run dev
```

Logga in med **nawid@nawton.se** / **nawton1234** (seedat konto).

> Om `OPENAI_API_KEY` inte är satt körs alla AI-funktioner i ett deterministiskt demo-läge byggt på samma företagsdata, så hela appen går att testa end-to-end utan API-nyckel.

## Arkitektur

**Multi-tenant från start.** Varje rad i varje affärstabell hänger på `companyId` — samma schema kan användas av tusentals byråer, inte bara en.

**Integrationer bakom adaptrar.** `src/server/integrations/*` definierar interface (`EmailProvider`, `GitHubProvider`, `AccountingProvider`, `PaymentProvider`) med en Mock-implementation vardera. Gmail/GitHub/Fortnox/Stripe kopplas in genom att skriva en ny klass som uppfyller samma interface — inget ovanför adapterlagret behöver ändras.

**AI-agent, inte chatbot.** `src/server/ai/tools.ts` exponerar function-calling-verktyg (hämta företagsöversikt, leads som behöver uppföljning, försenade projekt, obetalda fakturor) som modellen anropar mot riktig Prisma-data. `src/server/ai/chat.ts` kör tool-loopen; `src/server/ai/briefing.ts` genererar dagens sammanfattning; `src/server/ai/email-classifier.ts` klassificerar inkommande mail. Alla tre har en deterministisk fallback när ingen OpenAI-nyckel är satt.

**Databasmodeller** (`prisma/schema.prisma`): `Company`, `User`/`Account`/`Session` (NextAuth), `Customer`, `Contact`, `Lead`, `Project`, `Task`, `Email`, `Invoice`, `Document`, `AIMemory` (embeddings som `Float[]` — redo för pgvector när volymen kräver det), `Conversation`/`Message`, `Workflow`/`WorkflowRun`.

## Utveckling med två personer

- `main` — delad grund (det som redan finns här)
- `feature/frontend` — dashboard/CRM/projekt/uppgifter-UI, komponenter, design
- `feature/backend` — API-routes, AI-orchestrering, integrationsadaptrar, schema-ändringar

Skapa PR:ar mot `main` när en modul är klar. Kör `npm run lint` och `npx tsc --noEmit` innan push.

## Scripts

| Command | Vad det gör |
|---|---|
| `npm run dev` | Startar dev-servern |
| `npm run build` | Produktionsbygge |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Kör Prisma-migrationer |
| `npm run db:seed` | Fyller databasen med demo-data för en fiktiv webbyrå |
| `npm run db:studio` | Öppnar Prisma Studio |
