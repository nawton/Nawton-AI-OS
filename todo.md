# Todo — Nawton AI OS

## Nästa steg (imorgon): GitHub-koppling till Utveckling-modulen

Kontext: `/dev`-sidan är idag bara en "Snart"-platshållare. `GitHubProvider`-interfacet
finns redan (`src/server/integrations/github-provider.ts`) med en Mock-implementation
som returnerar tre påhittade commits. Målet är att ersätta den med en riktig koppling
mot GitHub, avgränsat till repot `nawton/Nawton-AI-OS` för nu (fler repon kan läggas
till senare utan omskrivning).

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
- [ ] Enforca roller (OWNER/ADMIN/MEMBER) — finns i datan, styr ingenting ännu
- [ ] Zod-validering på övriga server actions (bara `/api/chat` har det idag)
- [ ] Paginering på listor (mail, kunder, uppgifter hämtas obegränsat)
- [ ] Kunskapsbank + RAG-pipeline — `AIMemory`-modellen finns men inget skriver till den
- [ ] Automation-motor som faktiskt kör — `Workflow`/`WorkflowRun` finns, exekverar inget

## Mindre saker att komma ihåg

- [ ] Chattens textinmatning är trång på smala telefoner (~390px bredd)

## Status / referenser

- Repo: github.com/nawton/Nawton-AI-OS (grenar: `main`, `feature/frontend`, `feature/backend`)
- Login: `nawid@nawton.se` / `nawton1234` (även `alex@nawton.se`, samma lösenord)
- Återställ demodata: `npm run db:seed`
- Fullständig kodanalys: se artefakten "Nawton AI OS — Analys & Rekommendationer"
- Användarguide: se artefakten "Nawton AI OS — Användarguide"
