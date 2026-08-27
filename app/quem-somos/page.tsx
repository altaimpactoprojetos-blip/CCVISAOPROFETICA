import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { PlaceholderNotice } from "../../components/PlaceholderNotice";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = { title: "Quem Somos", description: "Conheça a história, o propósito e a liderança da Comunidade Cristã Visão Profética." };

export default function QuemSomosPage() {
  return <SiteShell>
    <PageHero eyebrow="Conheça nossa casa" title="Nossa história começa com pessoas." description="Este espaço apresentará a história, o propósito e os fundamentos da Comunidade Cristã Visão Profética com conteúdo validado pela liderança." />
    <section className="content-section"><div className="container-shell grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
      <div><p className="eyebrow text-zinc-500">Nossa história</p><h2 className="section-title mt-5">Uma trajetória que será contada com verdade.</h2></div>
      <div><PlaceholderNotice>A história institucional e as fotografias reais da igreja ainda precisam ser fornecidas. O painel permitirá atualizar este conteúdo sem alterar a estrutura do site.</PlaceholderNotice><div className="mt-8 grid gap-4 sm:grid-cols-2">{["História", "Propósito", "Missão", "Visão", "Valores", "Princípios"].map(item => <div key={item} className="panel min-h-36 p-6"><p className="text-lg font-bold">{item}</p><p className="mt-3 text-sm leading-6 text-zinc-500">Conteúdo aguardando validação.</p></div>)}</div></div>
    </div></section>
    <section className="content-section bg-white"><div className="container-shell"><p className="eyebrow text-zinc-500">Nossa liderança</p><h2 className="section-title mt-5 max-w-3xl">Pessoas que servem e cuidam.</h2><div className="mt-10 grid gap-0 border-y border-zinc-300 md:grid-cols-3">{["Pastor presidente", "Liderança ministerial", "Liderança de células"].map((item,index) => <article key={item} className={`${index ? "border-t md:border-l md:border-t-0" : ""} border-zinc-300`}><div className="aspect-[4/3] bg-zinc-200"/><div className="p-6"><p className="eyebrow text-zinc-400">{item}</p><h3 className="mt-3 text-xl font-semibold">Nome a confirmar</h3><p className="mt-3 text-sm leading-7 text-zinc-500">A apresentação da liderança será publicada após a confirmação da igreja.</p></div></article>)}</div></div></section>
  </SiteShell>;
}
