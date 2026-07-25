import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatClient } from "@/components/chat/ChatClient";

export default async function ChatPage() {
  const session = await auth();
  const companyId = session!.user.companyId;
  const userId = session!.user.id;

  let conversation = await prisma.conversation.findFirst({
    where: { companyId, userId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { companyId, userId, title: "Ny konversation" },
      include: { messages: true },
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">AI Chat</h1>
        <p className="text-sm text-text-muted">Din AI-agent — kopplad till CRM, projekt och fakturor.</p>
      </div>
      <ChatClient
        conversationId={conversation.id}
        initialMessages={conversation.messages
          .filter((m) => m.role !== "SYSTEM")
          .map((m) => ({ id: m.id, role: m.role as "USER" | "ASSISTANT", content: m.content }))}
      />
    </div>
  );
}
