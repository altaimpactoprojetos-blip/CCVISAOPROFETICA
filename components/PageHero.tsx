export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="page-hero">
      <div className="container-shell grid gap-8 border-t border-white/20 pt-7 lg:grid-cols-[1fr_.8fr] lg:items-end">
        <div>
          <p className="eyebrow text-zinc-400">{eyebrow}</p>
          <h1 className="section-title mt-5 max-w-4xl">{title}</h1>
        </div>
        <p className="max-w-xl text-base leading-8 lg:justify-self-end">{description}</p>
      </div>
    </section>
  );
}
