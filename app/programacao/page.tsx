import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { PlaceholderNotice } from "../../components/PlaceholderNotice";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = { title: "Programação", description: "Veja os cultos, reuniões, células e encontros da CC Visão Profética." };

export default function ProgramacaoPage() {
  return <SiteShell><PageHero eyebrow="Organize sua visita" title="Programação" description="Cultos, reuniões, encontros, células e eventos semanais em uma agenda clara e fácil de consultar."/>
    <section className="content-section"><div className="container-shell"><PlaceholderNotice>Os dias, horários e locais oficiais ainda não foram informados. Assim que forem cadastrados, aparecerão automaticamente nesta agenda.</PlaceholderNotice>
      <div className="mt-10 grid gap-0 border-y border-zinc-300 md:grid-cols-2 xl:grid-cols-3">{["Culto de celebração", "Culto de ensino", "Encontros e células"].map((title,index) => <article key={title} className={`${index ? "border-t md:border-l md:border-t-0" : ""} border-zinc-300 p-7`}><span className="border-l border-zinc-400 pl-3 text-[.68rem] font-semibold">Horário a confirmar</span><h2 className="mt-16 text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm text-zinc-500">Local a confirmar</p></article>)}</div>
    </div></section>
  </SiteShell>;
}
