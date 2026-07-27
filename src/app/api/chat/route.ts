import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAgentChat } from "@/server/ai/chat";
import { checkRateLimit } from "@/server/rate-limit";

const CHAT_MESSAGE_LIMIT = 20;
const CHAT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const bodySchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().trim().min(1, "Meddelandet är tomt").max(4000, "Meddelandet är för långt (max 4000 tecken)"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = checkRateLimit(`chat:${session.user.id}`, CHAT_MESSAGE_LIMIT, CHAT_WINDOW_MS);
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: `För många meddelanden — vänta ${Math.max(retryAfterSeconds, 1)} sekunder och försök igen.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ogiltig förfrågan" }, { status: 400 });
  }
  const { conversationId, message } = parsed.data;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, companyId: session.user.companyId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.message.create({
    data: { conversationId, role: "USER", content: message },
  });

  const history = [
    ...conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant" | "system",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  const reply = await runAgentChat(history, session.user.companyId);

  await prisma.message.create({
    data: { conversationId, role: "ASSISTANT", content: reply },
  });

  if (conversation.messages.length === 0) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: message.slice(0, 60) },
    });
  }

  return NextResponse.json({ reply });
}
