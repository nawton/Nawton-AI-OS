import type OpenAI from "openai";
import { getOpenAIClient, OPENAI_MODEL } from "./client";
import { AGENT_TOOLS, executeTool } from "./tools";
import { collectBriefingData } from "./briefing";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `Du är Nawton, den interna AI-agenten för en svensk webbyrå. Du har tillgång till verktyg som läser företagets riktiga data (kunder, leads, projekt, fakturor). Använd alltid verktygen istället för att gissa när frågan handlar om företagets siffror eller status. Svara alltid på svenska, konkret och i agent-stil: säg vad du HAR gjort eller HAR analyserat, inte bara vad användaren "borde" göra. Håll svaren korta och handlingsorienterade.`;

/**
 * Runs one turn of the AI Chat agent with function calling against live
 * company data. Falls back to a deterministic, still-grounded answer when
 * OPENAI_API_KEY isn't set, so the chat is usable in demo mode.
 */
export async function runAgentChat(messages: ChatMessage[], companyId: string): Promise<string> {
  const client = getOpenAIClient();
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  if (!client) {
    return demoModeReply(lastUserMessage, companyId);
  }

  try {
    return await runWithOpenAI(client, messages, companyId);
  } catch (error) {
    // OpenAI errors (quota exceeded, network issues, invalid model, etc.)
    // shouldn't 500 the whole chat — fall back the same way demo mode does.
    console.error("[chat] OpenAI request failed, falling back to demo mode:", error);
    return demoModeReply(lastUserMessage, companyId);
  }
}

async function runWithOpenAI(client: OpenAI, messages: ChatMessage[], companyId: string): Promise<string> {
  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content }) as OpenAI.Chat.Completions.ChatCompletionMessageParam),
  ];

  for (let iteration = 0; iteration < 4; iteration++) {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: chatMessages,
      tools: AGENT_TOOLS,
      temperature: 0.3,
    });

    const choice = completion.choices[0];
    const toolCalls = choice.message.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      return choice.message.content ?? "Jag kunde inte generera ett svar just nu.";
    }

    chatMessages.push(choice.message);

    for (const call of toolCalls) {
      if (call.type !== "function") continue;
      const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
      const result = await executeTool(call.function.name, args, companyId);
      chatMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return "Jag behövde för många steg för att svara på det — kan du specificera frågan?";
}

async function demoModeReply(question: string, companyId: string): Promise<string> {
  const data = await collectBriefingData(companyId, "");
  const q = question.toLowerCase();

  if (q.includes("fokus") || q.includes("prioriter")) {
    if (data.priorities.length === 0) return "Jag har gått igenom läget — inget akut just nu. Bra jobbat!";
    return `Jag har analyserat läget. Fokusera på:\n${data.priorities.map((p) => `- ${p}`).join("\n")}`;
  }

  if (q.includes("problem") || q.includes("lös")) {
    const issues: string[] = [];
    if (data.delayedProjects.length > 0) issues.push(`${data.delayedProjects.length} försenat projekt`);
    if (data.invoicesToFollowUp > 0) issues.push(`${data.invoicesToFollowUp} obetald faktura`);
    if (data.staleCustomers.length > 0) issues.push(`${data.staleCustomers.length} kund som inte hörts av`);
    if (issues.length === 0) return "Jag har analyserat verksamheten — inga akuta problem hittades.";
    return `Jag har identifierat följande som behöver lösas: ${issues.join(", ")}.`;
  }

  return `Jag har analyserat företagets data: omsättning ${Math.round(data.revenueThisWeek)} kr denna vecka, ${data.delayedProjects.length} försenade projekt, ${data.leadsAwaitingQuote} leads som väntar på offert. Ställ en mer specifik fråga så gräver jag djupare. (AI-läge: demo — lägg till OPENAI_API_KEY för fullt resonemang.)`;
}
