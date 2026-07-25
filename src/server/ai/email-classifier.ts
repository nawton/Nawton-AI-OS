import { getOpenAIClient, OPENAI_MODEL } from "./client";

export type EmailClassification = {
  summary: string;
  industry: string;
  potential: "LOW" | "MEDIUM" | "HIGH";
  recommendedService: string;
  proposedPrice: number;
  nextStep: string;
};

const SERVICE_CATALOG = [
  { keywords: ["restaurang", "meny", "bordsbokning", "café", "kafé"], service: "Webb Premium", price: 29900, industry: "Restaurang" },
  { keywords: ["butik", "e-handel", "webshop", "produkter", "shopify"], service: "E-handelspaket", price: 39900, industry: "E-handel" },
  { keywords: ["frisör", "salong", "spa", "boka tid", "bokningssystem"], service: "Webb + Bokningssystem", price: 34900, industry: "Tjänsteföretag" },
  { keywords: ["fastighet", "mäklare", "bostad"], service: "Webb Premium", price: 32900, industry: "Fastighet" },
  { keywords: ["hemsida", "webbplats", "sajt"], service: "Webb Standard", price: 19900, industry: "Övrigt" },
];

function heuristicClassify(subject: string, body: string): EmailClassification {
  const text = `${subject} ${body}`.toLowerCase();
  const match = SERVICE_CATALOG.find((entry) => entry.keywords.some((k) => text.includes(k)));

  const urgent = /snarast|akut|asap|brådskande/.test(text);
  const potential: EmailClassification["potential"] = match ? (urgent ? "HIGH" : "MEDIUM") : "LOW";

  return {
    summary: body.slice(0, 160).trim() + (body.length > 160 ? "…" : ""),
    industry: match?.industry ?? "Okänd",
    potential,
    recommendedService: match?.service ?? "Behöver kvalificeras manuellt",
    proposedPrice: match?.price ?? 0,
    nextStep: match ? "Boka möte" : "Kvalificera leadet",
  };
}

export async function classifyEmail(subject: string, body: string): Promise<EmailClassification> {
  const client = getOpenAIClient();
  if (!client) return heuristicClassify(subject, body);

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Du klassificerar inkommande kundmail för en svensk webbyrå. Svara ENDAST med JSON: {"summary": string, "industry": string, "potential": "LOW"|"MEDIUM"|"HIGH", "recommendedService": string, "proposedPrice": number, "nextStep": string}. Priser i SEK, realistiska för en webbyrå (15000-50000 kr).',
        },
        { role: "user", content: `Ämne: ${subject}\n\nMeddelande: ${body}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return heuristicClassify(subject, body);
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary ?? "",
      industry: parsed.industry ?? "Okänd",
      potential: ["LOW", "MEDIUM", "HIGH"].includes(parsed.potential) ? parsed.potential : "MEDIUM",
      recommendedService: parsed.recommendedService ?? "Okänd",
      proposedPrice: Number(parsed.proposedPrice ?? 0),
      nextStep: parsed.nextStep ?? "Boka möte",
    };
  } catch {
    return heuristicClassify(subject, body);
  }
}
