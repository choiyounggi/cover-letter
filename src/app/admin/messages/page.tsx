import { listMessages } from "@/lib/data";
import { AdminPageHeader, DeleteButton, MarkReadButton } from "@/components/admin";
import { markMessageReadAction, deleteMessageAction } from "@/app/actions/admin/messages";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await listMessages();
  return (
    <div>
      <AdminPageHeader title="수신함" description="연락 폼으로 들어온 메시지를 확인합니다." />
      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const unread = !message.readAt;
          return (
            <div
              key={message.id}
              className={cn(
                "rounded-[var(--radius-md)] border border-border bg-bg-elevated p-5",
                unread && "font-semibold",
              )}
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>{message.name}</span>
                <span className="font-normal text-fg-muted">{message.email}</span>
                {unread ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-normal text-bg">새 메시지</span>
                ) : null}
                <span className="font-normal text-fg-muted">
                  {message.telegramSentAt ? "전송됨" : "전송 안 됨"}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm font-normal text-fg">{message.content}</p>
              <div className="mt-3 flex items-center gap-3">
                {unread ? <MarkReadButton action={markMessageReadAction} id={message.id} /> : null}
                <DeleteButton action={deleteMessageAction} id={message.id} label="메시지" />
              </div>
            </div>
          );
        })}
        {messages.length === 0 ? <p className="text-sm text-fg-muted">받은 메시지가 없습니다.</p> : null}
      </div>
    </div>
  );
}
