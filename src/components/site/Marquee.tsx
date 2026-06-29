export default function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="no-scrollbar overflow-hidden border-y border-ink-line py-5">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {row.map((item, i) => (
          <span
            key={i}
            className="mx-7 flex items-center gap-7 font-serif text-2xl uppercase tracking-[0.08em] text-cream/35"
          >
            {item}
            <span className="text-[8px] text-brand">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
