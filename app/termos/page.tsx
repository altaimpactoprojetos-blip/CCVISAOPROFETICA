import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { SiteShell } from "../../components/SiteShell";
export const metadata: Metadata = { title: "Termos de Uso" };
export default function TermosPage() { return <SiteShell><PageHero eyebrow="Uso do portal" title="Termos de Uso" description="Condições para utilização dos recursos deste site."/><section className="content-section"><article className="container-shell max-w-3xl space-y-7 text-sm leading-8 text-zinc-600"><p>Este portal reúne informações, inscrições, cursos e canais de contato da Comunidade Cristã Visão Profética. Informações de programação e eventos podem ser atualizadas pela administração.</p><p>O usuário deve fornecer dados verdadeiros nos formulários e utilizar as áreas protegidas somente com sua própria identidade.</p><p>Os termos jurídicos definitivos deverão ser revisados e aprovados pela igreja antes da abertura pública do portal.</p></article></section></SiteShell>; }
