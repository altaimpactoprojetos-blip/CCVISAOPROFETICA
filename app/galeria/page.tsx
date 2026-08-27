import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { PlaceholderNotice } from "../../components/PlaceholderNotice";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = { title: "Galeria" };
const photos = [
  "https://images.unsplash.com/photo-1748180446698-6b0c5af79bd7?auto=format&fit=crop&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1642654877094-e8db202268de?auto=format&fit=crop&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1776091104217-02e3732a4a81?auto=format&fit=crop&fm=jpg&q=80&w=1200",
];
export default function GaleriaPage() { return <SiteShell><PageHero eyebrow="Nossa comunidade" title="Vivendo momentos juntos" description="Álbuns de cultos, células, batismos, conferências, eventos, jovens, crianças e projetos."/><section className="content-section"><div className="container-shell"><PlaceholderNotice>Estas fotografias são apenas uma ambientação temporária. Em breve este espaço receberá os registros oficiais da CC Visão Profética.</PlaceholderNotice><div className="mt-10 grid gap-3 md:grid-cols-12">{photos.map((src, index) => <figure key={src} className={`${index === 0 ? "md:col-span-7" : index === 1 ? "md:col-span-5" : "md:col-span-12"} group relative overflow-hidden bg-zinc-300`}><img src={src} alt="Imagem provisória de um momento de adoração" className={`w-full object-cover transition duration-500 group-hover:scale-[1.02] ${index === 2 ? "h-96" : "h-[30rem]"}`}/><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-20 text-white"><p className="eyebrow text-zinc-300">Galeria em preparação</p><p className="mt-2 text-xl font-semibold">Registros da igreja serão adicionados aqui</p></figcaption></figure>)}</div></div></section></SiteShell>; }
