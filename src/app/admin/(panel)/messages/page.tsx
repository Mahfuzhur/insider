import { prisma } from "@/lib/prisma";
import { toggleMessageRead, deleteMessage } from "@/app/admin/actions";

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl text-cream">Messages</h1>
      <p className="mt-1 text-sm text-cream/50">
        Enquiries submitted through the contact form.
      </p>

      <div className="mt-6 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-line p-10 text-center text-sm text-cream/50">
            No messages yet.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              "rounded-2xl border p-5 " +
              (m.read
                ? "border-ink-line bg-ink-card"
                : "border-brand/40 bg-brand/[0.06]")
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-cream">{m.name}</span>
                  {!m.read && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] uppercase text-[#2a1006]">
                      New
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-cream/50">
                  <a href={`mailto:${m.email}`} className="hover:text-brand">
                    {m.email}
                  </a>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="hover:text-brand">
                      {m.phone}
                    </a>
                  )}
                  <span>{m.createdAt.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <form action={toggleMessageRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    className="text-cream/50 hover:text-cream"
                    title={m.read ? "Mark unread" : "Mark read"}
                  >
                    <i className={`ti ${m.read ? "ti-mail" : "ti-mail-opened"}`} />
                  </button>
                </form>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="text-cream/50 hover:text-brand" title="Delete">
                    <i className="ti ti-trash" />
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-cream/75">
              {m.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
