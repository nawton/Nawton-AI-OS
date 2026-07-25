import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAgentChat } from "@/server/ai/chat";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, message } = (await req.json()) as { conversationId: string; message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

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
