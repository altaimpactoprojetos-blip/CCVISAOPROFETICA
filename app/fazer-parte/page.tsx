import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { SiteShell } from "../../components/SiteShell";
import { SubmissionForm, type Field } from "../../components/SubmissionForm";

export const metadata: Metadata = { title: "Quero Fazer Parte" };
const fields: Field[] = [
  { name: "nome", label: "Nome completo", required: true }, { name: "nascimento", label: "Data de nascimento", type: "date" },
  { name: "whatsapp", label: "WhatsApp", type: "tel", required: true }, { name: "email", label: "E-mail", type: "email" },
  { name: "cidade", label: "Cidade", required: true }, { name: "bairro", label: "Bairro", required: true },
  { name: "como_conheceu", label: "Como conheceu a igreja?", full: true },
  { name: "ja_participou", label: "Já participou de algum culto?", type: "select", options: ["Sim", "Não"] },
  { name: "quer_celula", label: "Deseja participar de uma célula?", type: "select", options: ["Sim", "Não", "Quero saber mais"] },
  { name: "ministerio", label: "Deseja conhecer algum ministério?", full: true },
  { name: "observacoes", label: "Observações", type: "textarea" },
];
export default function FazerPartePage() { return <SiteShell><PageHero eyebrow="Seu próximo passo" title="Quero fazer parte da Visão Profética" description="Queremos conhecer você e caminhar ao seu lado. Preencha seus dados e nossa equipe entrará em contato."/><section className="content-section"><div className="container-shell max-w-4xl"><SubmissionForm kind="fazer_parte" fields={fields} buttonLabel="Quero fazer parte" successMessage="Cadastro realizado com sucesso! Em breve nossa equipe entrará em contato com você."/></div></section></SiteShell>; }
