# Todo — Nawton AI OS

## Version 2 — roadmap (från "V2 Development Prompt")

Fullständig prioritering och motivering finns i chatthistoriken (CTO-analysen av
V2-specen). Kort sammanfattning av faserna:

**Fas 1 — bygger på data vi redan har, ingen ny integration behövs:**
- [x] Command Palette (⌘K) — sökning + navigering (customers/leads/projects/tasks)
- [ ] Activity Feed + Customer Timeline — samma underliggande händelsedata, två vyer
- [ ] Dashboard 2.0 — hälsopoäng + risksignaler ovanpå befintlig `briefing.ts`-logik

**Fas 2 — kräver att vi bygger en sak till först:**
- [ ] Company Brain / RAG — `AIMemory` finns, ingenting skriver dit ännu
- [ ] Notification Center med riktiga snabbåtgärder (kräver skriv-verktyg för AI:n
      + en bekräfta-innan-den-gör-något-flow — building block för båda)

**Fas 3 — störst, gör sist:**
- [ ] Automation Engine — enkel "kör X steg i ordning"-motor först, inte en visuell
      n8n-liknande builder
- [ ] Developer Center — så fort GitHub-token finns (se nedan)

Obs: "dagens möten" och "utgifter" i V2-specen kräver kalender- respektive
Fortnox-integration som inte finns — bygg inte fejkad data för dessa fält.

## GitHub-koppling till Utveckling-modulen (väntar på token)

Kontext: `/dev`-sidan är idag bara en "Snart"-platshållare. `GitHubProvider`-interfacet
finns redan (`src/server/integrations/github-provider.ts`) med en Mock-implementation
som returnerar tre påhittade commits. Målet är att ersätta den med en riktig koppling
mot GitHub, avgränsat till repot `nawton/Nawton-AI-OS` för nu.

- [ ] Skapa en fine-grained personal access token på GitHub
  - github.com/settings/personal-access-tokens/new
  - Resource owner: `nawton`
  - Repository access: endast `Nawton-AI-OS`
  - Permissions: Contents → Read-only
- [ ] Lägg till i `.env`:
  ```
  GITHUB_TOKEN="github_pat_..."
  GITHUB_ORG="nawton"
  ```
- [ ] Bygg en riktig `GitHubProvider`-klass som anropar GitHubs REST API
      (`GET /repos/{owner}/{repo}/commits`) istället för Mock-versionen
- [ ] Bygg klart `/dev`-sidan: lista senaste commits + en AI-sammanfattning av
      veckans ändringar (samma mönster som `email-classifier.ts` redan använder)

## Från kodanalysen — kvarstående prioriterade punkter

- [x] Mobilanpassa sidopanelen (hamburgermeny + drawer)
- [x] Rate limiting + input-validering på `/api/chat` + OpenAI-fallback
- [x] Command Palette (⌘K) — se Fas 1 ovan
- [ ] Enforca roller (OWNER/ADMIN/MEMBER) — finns i datan, styr ingenting ännu
- [ ] Zod-validering på övriga server actions (bara `/api/chat` och `/api/search` har det idag)
- [ ] Paginering på listor (mail, kunder, uppgifter hämtas obegränsat)
- [ ] Kunskapsbank + RAG-pipeline — se Fas 2 ovan
- [ ] Automation-motor som faktiskt kör — se Fas 3 ovan

## Mindre saker att komma ihåg

- [ ] Chattens textinmatning är trång på smala telefoner (~390px bredd)

## Status / referenser

- Repo: github.com/nawton/Nawton-AI-OS (grenar: `main`, `feature/frontend`, `feature/backend`)
- Login: `nawid@nawton.se` / `nawton1234` (även `alex@nawton.se`, samma lösenord)
- Återställ demodata: `npm run db:seed`
- Sök/navigera: ⌘K (eller Ctrl+K) var som helst i appen
- Fullständig kodanalys: se artefakten "Nawton AI OS — Analys & Rekommendationer"
- Användarguide: se artefakten "Nawton AI OS — Användarguide"
