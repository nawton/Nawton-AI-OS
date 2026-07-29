import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000);
}
function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86400000);
}

async function main() {
  console.log("Seeding Nawton AI OS demo data...");

  await prisma.$transaction([
    prisma.timeEntry.deleteMany(),
    prisma.workflowRun.deleteMany(),
    prisma.workflow.deleteMany(),
    prisma.aIMemory.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.document.deleteMany(),
    prisma.email.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.task.deleteMany(),
    prisma.project.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
    prisma.company.deleteMany(),
  ]);

  const company = await prisma.company.create({
    data: { name: "Nawton Digital", orgNumber: "559123-4567" },
  });

  const passwordHash = await bcrypt.hash("nawton1234", 10);

  const nawid = await prisma.user.create({
    data: {
      companyId: company.id,
      name: "Nawid",
      email: "nawid@nawton.se",
      passwordHash,
      role: "OWNER",
      hourlyRate: 950,
    },
  });

  const partner = await prisma.user.create({
    data: {
      companyId: company.id,
      name: "Alex",
      email: "alex@nawton.se",
      passwordHash,
      role: "ADMIN",
      hourlyRate: 850,
    },
  });

  // --- Customers -----------------------------------------------------------

  const milano = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: "Restaurang Milano",
      industry: "Restaurang",
      status: "ACTIVE",
      value: 45000,
      notes: "Vill expandera med onlinebokning under Q3.",
      contacts: { create: [{ name: "Marco Rossi", email: "marco@milano.se", phone: "070-111 22 33", role: "Ägare" }] },
    },
  });

  const bellaSalong = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: "Salong Bella",
      industry: "Tjänsteföretag",
      status: "ACTIVE",
      value: 34900,
      contacts: { create: [{ name: "Bella Andersson", email: "bella@salongbella.se", phone: "070-222 33 44", role: "Ägare" }] },
    },
  });

  const fastighetNorr = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: "Fastighetsbyrå Norr",
      industry: "Fastighet",
      status: "PAUSED",
      value: 32900,
      contacts: { create: [{ name: "Erik Nordin", email: "erik@fastighetnorr.se", role: "VD" }] },
    },
  });

  const solsidan = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: "Café Solsidan",
      industry: "Restaurang",
      status: "ACTIVE",
      value: 19900,
      contacts: { create: [{ name: "Sara Lind", email: "sara@solsidan.se", role: "Ägare" }] },
    },
  });

  await prisma.customer.create({
    data: {
      companyId: company.id,
      name: "Nordlys Interiör",
      industry: "E-handel",
      status: "CHURNED",
      value: 0,
      contacts: { create: [{ name: "Tove Berg", email: "tove@nordlys.se", role: "Ägare" }] },
    },
  });

  // --- Leads -----------------------------------------------------------------

  await prisma.lead.createMany({
    data: [
      {
        companyId: company.id,
        name: "Restaurang Fyrtorn",
        companyName: "Fyrtorn AB",
        email: "info@fyrtorn.se",
        industry: "Restaurang",
        source: "Kontaktformulär",
        score: 82,
        potential: "HIGH",
        status: "QUALIFIED",
        recommendedService: "Webb Premium",
        proposedPrice: 29900,
        nextStep: "Boka möte",
        lastContactedAt: daysAgo(2),
      },
      {
        companyId: company.id,
        name: "Frisör Nova",
        companyName: "Nova Hår & Skönhet",
        email: "kontakt@novahar.se",
        industry: "Tjänsteföretag",
        source: "Instagram",
        score: 65,
        potential: "MEDIUM",
        status: "CONTACTED",
        recommendedService: "Webb + Bokningssystem",
        proposedPrice: 34900,
        nextStep: "Skicka offert",
        lastContactedAt: daysAgo(6),
      },
      {
        companyId: company.id,
        name: "Butik Kompassen",
        companyName: "Kompassen Retail",
        email: "hej@kompassen.se",
        industry: "E-handel",
        source: "Rekommendation",
        score: 40,
        potential: "MEDIUM",
        status: "NEW",
        recommendedService: "E-handelspaket",
        proposedPrice: 39900,
        nextStep: "Kvalificera behov",
        lastContactedAt: null,
      },
      {
        companyId: company.id,
        name: "Byggfirma Sten & Söner",
        companyName: "Sten & Söner Bygg",
        email: "info@stensoner.se",
        industry: "Bygg",
        source: "Mässa",
        score: 20,
        potential: "LOW",
        status: "NEW",
        recommendedService: "Webb Standard",
        proposedPrice: 19900,
        nextStep: "Kvalificera behov",
        lastContactedAt: daysAgo(12),
      },
      {
        companyId: company.id,
        name: "Spa Lugnet",
        companyName: "Lugnet Spa & Massage",
        email: "boka@lugnet.se",
        industry: "Tjänsteföretag",
        source: "Google",
        score: 70,
        potential: "HIGH",
        status: "QUALIFIED",
        recommendedService: "Webb + Bokningssystem",
        proposedPrice: 34900,
        nextStep: "Boka möte",
        lastContactedAt: daysAgo(1),
      },
    ],
  });

  // --- Projects & tasks --------------------------------------------------

  const milanoProject = await prisma.project.create({
    data: {
      companyId: company.id,
      customerId: milano.id,
      name: "Ny hemsida — Restaurang Milano",
      status: "DELAYED",
      deadline: daysAgo(4),
      budget: 45000,
      ownerId: nawid.id,
      tasks: {
        create: [
          { title: "Frontend klar", status: "DONE", priority: "MEDIUM", assigneeId: partner.id },
          { title: "SEO-optimering återstår", status: "IN_PROGRESS", priority: "HIGH", assigneeId: nawid.id, dueDate: daysFromNow(2) },
          { title: "Kunden har inte skickat bilder", status: "TODO", priority: "URGENT", assigneeId: nawid.id, dueDate: daysAgo(1) },
        ],
      },
    },
    include: { tasks: true },
  });

  const bellaProject = await prisma.project.create({
    data: {
      companyId: company.id,
      customerId: bellaSalong.id,
      name: "Bokningssystem — Salong Bella",
      status: "IN_PROGRESS",
      deadline: daysFromNow(10),
      budget: 34900,
      ownerId: partner.id,
      tasks: {
        create: [
          { title: "Designutkast godkänt", status: "DONE", priority: "MEDIUM", assigneeId: partner.id },
          { title: "Bygga bokningsflöde", status: "IN_PROGRESS", priority: "HIGH", assigneeId: partner.id, dueDate: daysFromNow(5) },
          { title: "Integrera betalning", status: "TODO", priority: "MEDIUM", assigneeId: nawid.id, dueDate: daysFromNow(8) },
        ],
      },
    },
    include: { tasks: true },
  });

  const solsidanProject = await prisma.project.create({
    data: {
      companyId: company.id,
      customerId: solsidan.id,
      name: "Ny hemsida — Café Solsidan",
      status: "REVIEW",
      deadline: daysFromNow(3),
      budget: 19900,
      ownerId: nawid.id,
      tasks: {
        create: [
          { title: "Innehåll inlagt", status: "DONE", priority: "LOW" },
          { title: "Kundgodkännande väntas", status: "REVIEW", priority: "MEDIUM", assigneeId: nawid.id, dueDate: daysFromNow(1) },
        ],
      },
    },
    include: { tasks: true },
  });

  const fastighetProject = await prisma.project.create({
    data: {
      companyId: company.id,
      customerId: fastighetNorr.id,
      name: "Webb Premium — Fastighetsbyrå Norr",
      status: "COMPLETED",
      deadline: daysAgo(20),
      budget: 32900,
      ownerId: partner.id,
      tasks: {
        create: [{ title: "Lansering", status: "DONE", priority: "MEDIUM" }],
      },
    },
    include: { tasks: true },
  });

  // --- Time entries ----------------------------------------------------------
  // Backs the profitability view on each project's detail page — logged
  // against real tasks so "budget vs. nedlagd kostnad" isn't a guess.

  const findTask = (project: typeof milanoProject, title: string) => {
    const task = project.tasks.find((t) => t.title === title);
    if (!task) throw new Error(`Seed error: task "${title}" not found on project ${project.name}`);
    return task;
  };

  await prisma.timeEntry.createMany({
    data: [
      // Milano (DELAYED, budget 45 000 kr) — margin has gotten tight, matches its DELAYED status
      { companyId: company.id, projectId: milanoProject.id, taskId: findTask(milanoProject, "Frontend klar").id, userId: partner.id, minutes: 960, note: "Bygga responsiv startsida + menysida", loggedAt: daysAgo(10) },
      { companyId: company.id, projectId: milanoProject.id, taskId: findTask(milanoProject, "SEO-optimering återstår").id, userId: nawid.id, minutes: 300, note: "Metadata + sitemap", loggedAt: daysAgo(3) },
      { companyId: company.id, projectId: milanoProject.id, taskId: findTask(milanoProject, "SEO-optimering återstår").id, userId: nawid.id, minutes: 120, note: "Bildoptimering", loggedAt: daysAgo(1) },

      // Bella (IN_PROGRESS, budget 34 900 kr) — healthy margin so far
      { companyId: company.id, projectId: bellaProject.id, taskId: findTask(bellaProject, "Designutkast godkänt").id, userId: partner.id, minutes: 420, note: "Design + kundfeedback-rundor", loggedAt: daysAgo(14) },
      { companyId: company.id, projectId: bellaProject.id, taskId: findTask(bellaProject, "Bygga bokningsflöde").id, userId: partner.id, minutes: 300, note: "Kalender-UI", loggedAt: daysAgo(4) },

      // Café Solsidan (REVIEW, budget 19 900 kr) — tight but on budget
      { companyId: company.id, projectId: solsidanProject.id, taskId: findTask(solsidanProject, "Innehåll inlagt").id, userId: nawid.id, minutes: 480, note: "Textinnehåll + bildval", loggedAt: daysAgo(9) },
      { companyId: company.id, projectId: solsidanProject.id, taskId: findTask(solsidanProject, "Kundgodkännande väntas").id, userId: nawid.id, minutes: 360, note: "Sidbygge", loggedAt: daysAgo(5) },

      // Fastighetsbyrå Norr (COMPLETED, budget 32 900 kr) — closed project, real margin to look back on
      { companyId: company.id, projectId: fastighetProject.id, taskId: findTask(fastighetProject, "Lansering").id, userId: partner.id, minutes: 1080, note: "Hela projektet, samlad tid vid lansering", loggedAt: daysAgo(20) },
    ],
  });

  // --- Invoices ------------------------------------------------------------

  await prisma.invoice.createMany({
    data: [
      { companyId: company.id, customerId: milano.id, projectId: milanoProject.id, number: "F-2026-041", amount: 22500, status: "PAID", issuedAt: daysAgo(6), dueDate: daysAgo(1), paidAt: daysAgo(2) },
      { companyId: company.id, customerId: bellaSalong.id, number: "F-2026-042", amount: 11700, status: "PAID", issuedAt: daysAgo(5), dueDate: daysAgo(2), paidAt: daysAgo(1) },
      { companyId: company.id, customerId: fastighetNorr.id, number: "F-2026-039", amount: 32900, status: "OVERDUE", issuedAt: daysAgo(25), dueDate: daysAgo(10) },
      { companyId: company.id, customerId: solsidan.id, number: "F-2026-043", amount: 19900, status: "SENT", issuedAt: daysAgo(3), dueDate: daysFromNow(11) },
    ],
  });

  // --- Emails (mimicking a synced Gmail inbox) ------------------------------

  await prisma.email.createMany({
    data: [
      {
        companyId: company.id,
        customerId: null,
        direction: "INBOUND",
        fromAddress: "info@fyrtorn.se",
        fromName: "Restaurang Fyrtorn",
        subject: "Behöver ny hemsida",
        snippet: "Hej, vi behöver en ny hemsida för vår restaurang...",
        body: "Hej, vi behöver en ny hemsida för vår restaurang. Vi vill kunna visa meny och ta emot bordsbokningar online. Hör av er snarast!",
        isRead: false,
        aiSummary: "Restaurang som vill ha ny hemsida med bordsbokning, brådskande.",
        aiIndustry: "Restaurang",
        aiPotential: "HIGH",
        aiRecommendedService: "Webb Premium",
        aiProposedPrice: 29900,
        aiNextStep: "Boka möte",
        receivedAt: daysAgo(0),
      },
      {
        companyId: company.id,
        customerId: milano.id,
        direction: "INBOUND",
        fromAddress: "marco@milano.se",
        fromName: "Marco Rossi",
        subject: "Bilder till nya hemsidan",
        snippet: "Hej! Jag har inte hunnit skicka bilderna än, kommer imorgon...",
        body: "Hej! Jag har inte hunnit skicka bilderna än, kommer imorgon. Ursäkta förseningen.",
        isRead: false,
        receivedAt: daysAgo(4),
      },
      {
        companyId: company.id,
        customerId: null,
        direction: "INBOUND",
        fromAddress: "boka@lugnet.se",
        fromName: "Spa Lugnet",
        subject: "Offertförfrågan bokningssystem",
        snippet: "Hej, kan ni skicka en offert för ett bokningssystem till vår spa...",
        body: "Hej, kan ni skicka en offert för ett bokningssystem till vår spa? Vi vill kunna hantera onlinebokningar och betalningar.",
        isRead: true,
        aiSummary: "Spa som vill ha bokningssystem med betalintegration.",
        aiIndustry: "Tjänsteföretag",
        aiPotential: "HIGH",
        aiRecommendedService: "Webb + Bokningssystem",
        aiProposedPrice: 34900,
        aiNextStep: "Boka möte",
        receivedAt: daysAgo(1),
      },
      {
        companyId: company.id,
        customerId: null,
        direction: "INBOUND",
        fromAddress: "hej@kompassen.se",
        fromName: "Butik Kompassen",
        subject: "Fundering kring webshop",
        snippet: "Vi funderar på att flytta vår butik online, vad kostar det...",
        body: "Vi funderar på att flytta vår butik online, vad kostar det ungefär att bygga en webshop?",
        isRead: false,
        aiSummary: "E-handelslead i tidigt skede, prisförfrågan.",
        aiIndustry: "E-handel",
        aiPotential: "MEDIUM",
        aiRecommendedService: "E-handelspaket",
        aiProposedPrice: 39900,
        aiNextStep: "Kvalificera behov",
        receivedAt: daysAgo(2),
      },
      {
        companyId: company.id,
        customerId: solsidan.id,
        direction: "INBOUND",
        fromAddress: "sara@solsidan.se",
        fromName: "Sara Lind",
        subject: "Fråga om lanseringsdatum",
        snippet: "Hej! Undrar bara när ni tror att sidan kan gå live...",
        body: "Hej! Undrar bara när ni tror att sidan kan gå live? Vi vill gärna hinna innan sommarsäsongen.",
        isRead: true,
        receivedAt: daysAgo(6),
      },
      {
        companyId: company.id,
        customerId: fastighetNorr.id,
        direction: "INBOUND",
        fromAddress: "erik@fastighetnorr.se",
        fromName: "Erik Nordin",
        subject: "Påminnelse faktura",
        snippet: "Hej, jag ser att fakturan gick förbi förfallodatum, återkommer...",
        body: "Hej, jag ser att fakturan gick förbi förfallodatum. Återkommer med betalning inom kort, hade lite kassaflödesproblem.",
        isRead: true,
        receivedAt: daysAgo(8),
      },
      {
        companyId: company.id,
        customerId: null,
        direction: "OUTBOUND",
        fromAddress: "nawid@nawton.se",
        fromName: "Nawid",
        subject: "Re: Behöver ny hemsida",
        snippet: "Hej! Tack för ditt intresse — jag har analyserat era behov...",
        body: "Hej! Tack för ditt intresse. Baserat på er bransch rekommenderar vi vårt Webb Premium-paket för 29 900 kr. Boka gärna ett kort möte så visar jag exempel på liknande projekt.",
        isRead: true,
        receivedAt: daysAgo(0),
      },
    ],
  });

  // --- Documents (knowledge base) -------------------------------------------

  await prisma.document.createMany({
    data: [
      {
        companyId: company.id,
        customerId: milano.id,
        projectId: milanoProject.id,
        name: "Offert — Restaurang Milano.pdf",
        type: "QUOTE",
        content: "Offert till Restaurang Milano avseende ny hemsida med bordsbokning. Totalt 45 000 kr, leverans inom 6 veckor.",
      },
      {
        companyId: company.id,
        customerId: bellaSalong.id,
        name: "Mötesanteckningar — kickoff Salong Bella",
        type: "MEETING_NOTES",
        content: "Kickoff-möte 2026-06-10. Salong Bella vill ha onlinebokning med SMS-påminnelser. Lansering målsätts till augusti.",
      },
    ],
  });

  // --- Automation workflow example ------------------------------------------

  await prisma.workflow.create({
    data: {
      companyId: company.id,
      name: "Ny kund — onboarding",
      trigger: "customer.created",
      status: "ACTIVE",
      steps: [
        { step: "create_customer_profile" },
        { step: "create_project" },
        { step: "create_default_tasks" },
        { step: "send_welcome_email" },
        { step: "create_quote_draft" },
        { step: "schedule_kickoff_meeting" },
      ],
    },
  });

  console.log("Seed complete.");
  console.log("Login: nawid@nawton.se / nawton1234 (or alex@nawton.se / nawton1234)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
