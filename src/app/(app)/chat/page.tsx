import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatClient } from "@/components/chat/ChatClient";
import { PageHeader } from "@/components/ui/PageHeader";

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
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title="AI Chat" description="Din AI-agent — kopplad till CRM, projekt och fakturor." />
      <ChatClient
        conversationId={conversation.id}
        initialMessages={conversation.messages
          .filter((m) => m.role !== "SYSTEM")
          .map((m) => ({ id: m.id, role: m.role as "USER" | "ASSISTANT", content: m.content }))}
      />
    </div>
  );
}
