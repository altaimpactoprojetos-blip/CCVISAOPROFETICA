import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../../components/PageHero";
import { PlaceholderNotice } from "../../components/PlaceholderNotice";
import { SiteShell } from "../../components/SiteShell";
import { SubmissionForm, type Field } from "../../components/SubmissionForm";

export const metadata: Metadata = { title: "Quero Me Batizar" };
const fields: Field[] = [
  { name: "nome", label: "Nome completo", required: true }, { name: "idade", label: "Idade", type: "number", required: true },
  { name: "whatsapp", label: "WhatsApp", type: "tel", required: true }, { name: "email", label: "E-mail", type: "email" },
  { name: "participa_igreja", label: "Já participa da igreja?", type: "select", options: ["Sim", "Não", "Estou conhecendo"] },
  { name: "participa_celula", label: "Participa de célula?", type: "select", options: ["Sim", "Não"] },
  { name: "curso_batismo", label: "Já realizou o curso de batismo?", type: "select", options: ["Sim", "Não", "Estou cursando"] },
  { name: "observacoes", label: "Observações", type: "textarea" },
];
export default function BatismoPage() { return <SiteShell><PageHero eyebrow="Uma decisão de fé" title="Quero me batizar" description="Manifeste seu interesse. A equipe pastoral entrará em contato para orientar os próximos passos e o curso de preparação."/><section className="content-section"><div className="container-shell grid gap-10 lg:grid-cols-[.45fr_1fr]"><div><h2 className="text-2xl font-bold">Sobre o batismo</h2><div className="mt-5"><PlaceholderNotice>O texto doutrinário sobre o significado do batismo será inserido após aprovação da liderança da igreja.</PlaceholderNotice></div><Link href="/cursos/batismo" className="btn-secondary mt-6">Conheça o curso</Link></div><SubmissionForm kind="batismo" fields={fields} buttonLabel="Quero me batizar" successMessage="Seu interesse foi registrado. Nossa equipe entrará em contato e poderá encaminhar você ao curso de batismo."/></div></section></SiteShell>; }
