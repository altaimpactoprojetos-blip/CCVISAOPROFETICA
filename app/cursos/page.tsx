import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "../../components/icons";
import { PageHero } from "../../components/PageHero";
import { PlaceholderNotice } from "../../components/PlaceholderNotice";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = { title: "Cursos", description: "Cursos e ensino bíblico da CC Visão Profética." };
export default function CursosPage() { return <SiteShell><PageHero eyebrow="Ensino e formação" title="Cresça na Palavra" description="Uma área própria para cursos, módulos, aulas, materiais, questionários e acompanhamento de progresso."/>
  <section className="content-section"><div className="container-shell"><PlaceholderNotice>O catálogo é administrável e ainda não possui cursos oficialmente publicados. Os exemplos abaixo representam as categorias solicitadas e poderão ser editados ou removidos.</PlaceholderNotice>
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{["Curso de Batismo", "Novos Convertidos", "Fundamentos da Fé", "Discipulado", "Escola de Líderes", "Formação de Líderes de Célula"].map((course, index) => <article key={course} className="panel flex min-h-80 flex-col p-7"><span className="text-xs text-zinc-400">0{index+1}</span><div className="mt-auto"><p className="eyebrow text-zinc-400">Exemplo editável</p><h2 className="mt-3 text-2xl font-bold">{course}</h2><p className="mt-3 text-sm leading-7 text-zinc-500">Descrição, professor, carga horária, módulos e data a confirmar.</p>{index === 0 ? <Link href="/cursos/batismo" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">Ver estrutura <ArrowIcon className="h-4 w-4"/></Link> : <span className="mt-6 inline-flex text-xs font-bold uppercase tracking-wider text-zinc-400">Aguardando publicação</span>}</div></article>)}</div>
  </div></section></SiteShell>; }
