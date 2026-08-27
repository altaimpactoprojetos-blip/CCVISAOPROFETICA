import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../../../components/PageHero";
import { PlaceholderNotice } from "../../../components/PlaceholderNotice";
import { SiteShell } from "../../../components/SiteShell";

export const metadata: Metadata = { title: "Curso de Batismo" };
export default function CursoBatismoPage() { return <SiteShell><PageHero eyebrow="Estrutura de curso" title="Curso de Batismo" description="Página preparada para receber descrição, professor, carga horária, módulos, aulas, materiais e questionários aprovados pela igreja."/>
  <section className="content-section"><div className="container-shell grid gap-8 lg:grid-cols-[1fr_.42fr]"><div><PlaceholderNotice>O conteúdo doutrinário, o professor, a carga horária e as datas ainda não foram fornecidos. Nenhum texto definitivo foi inventado.</PlaceholderNotice><div className="mt-8 grid gap-4">{["Módulo 01 — Título a confirmar", "Módulo 02 — Título a confirmar"].map((module, moduleIndex) => <div key={module} className="panel p-6"><p className="eyebrow text-zinc-400">Módulo 0{moduleIndex+1}</p><h2 className="mt-3 text-xl font-bold">{module}</h2><div className="mt-5 grid gap-2">{[1,2,3].map(lesson => <div key={lesson} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4"><span className="text-sm font-semibold">Aula 0{lesson} — Título a confirmar</span><span className="text-xs text-zinc-400">Bloqueada</span></div>)}</div></div>)}</div></div>
    <aside className="panel h-fit p-6 lg:sticky lg:top-32"><p className="eyebrow text-zinc-400">Seu progresso</p><p className="mt-3 text-4xl font-bold">0%</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200"><div className="h-full w-0 bg-black"/></div><div className="mt-6 grid gap-3 text-sm text-zinc-600"><p>0 aulas concluídas</p><p>Próxima aula: aguardando publicação</p></div><Link href="/area-do-aluno" className="btn-primary mt-7 w-full">Entrar na área do aluno</Link></aside>
  </div></section></SiteShell>; }
