import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = { title: "Programação", description: "Veja os cultos, reuniões, células e encontros da CC Visão Profética." };

import { siteContent, defaultSchedule } from "../../lib/content";
export const dynamic = "force-dynamic";

export default async function ProgramacaoPage() {
  let weeklySchedule = defaultSchedule;
  try { weeklySchedule = (await siteContent()).schedule; } catch (error) { console.error("Schedule unavailable; using existing schedule", error); }
  return <SiteShell><PageHero eyebrow="Organize sua visita" title="Programação" description="Cultos, reuniões, encontros, células e eventos semanais em uma agenda clara e fácil de consultar."/>
    <section className="content-section"><div className="container-shell">
      <div className="schedule-grid">
        {weeklySchedule.map((item,index) => (
          <article key={index} className="panel schedule-card">
            <span className="eyebrow">{item.day}</span>
            <h2>{item.name}</h2>
            <p className="schedule-time">{item.time}</p>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-8 text-zinc-600">Faça parte das nossas programações e viva o extraordinário de Deus!</p>
    </div></section>
  </SiteShell>;
}
