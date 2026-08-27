import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { PlaceholderNotice } from "../../components/PlaceholderNotice";
import { SiteShell } from "../../components/SiteShell";
import { SubmissionForm, type Field } from "../../components/SubmissionForm";

export const metadata: Metadata = { title: "Células", description: "Encontre uma célula e faça parte de uma família na CC Visão Profética." };
const fields: Field[] = [
  { name: "nome", label: "Nome completo", required: true }, { name: "idade", label: "Idade", type: "number" }, { name: "whatsapp", label: "WhatsApp", type: "tel", required: true }, { name: "email", label: "E-mail", type: "email" },
  { name: "bairro", label: "Bairro", required: true }, { name: "cidade", label: "Cidade", required: true }, { name: "dias", label: "Dias disponíveis", required: true }, { name: "horario", label: "Melhor horário" },
  { name: "faixa_etaria", label: "Faixa etária" }, { name: "estado_civil", label: "Estado civil (opcional)" }, { name: "frequenta", label: "Já frequenta a Visão Profética?", type: "select", options: ["Sim", "Não", "Visitei algumas vezes"] },
  { name: "observacoes", label: "Observações", type: "textarea" },
];
export default function CelulasPage() { return <SiteShell><PageHero eyebrow="Igreja de casa em casa" title="Encontre sua célula" description="A igreja acontece também de casa em casa. Encontre uma célula e faça parte de uma família."/>
  <section className="content-section"><div className="container-shell"><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><h2 className="section-title">Perto de você.</h2><p className="body-copy mt-5">Por segurança, o endereço residencial completo não é exibido. A equipe entrará em contato com as orientações.</p></div><div><PlaceholderNotice>Nenhuma célula foi publicada ainda. O painel permitirá cadastrar nome, líder, região, cidade, dia, horário, público e faixa etária.</PlaceholderNotice><div className="mt-5 panel p-6"><p className="text-sm font-bold">Bairro / Região</p><h3 className="mt-8 text-2xl font-bold">Células em atualização</h3><p className="mt-3 text-sm text-zinc-500">Preencha o formulário para receber uma indicação personalizada.</p></div></div></div></div></section>
  <section className="content-section bg-white"><div className="container-shell max-w-4xl"><p className="eyebrow text-zinc-500">Quero participar</p><h2 className="section-title mt-4 mb-9">Vamos encontrar uma célula para você.</h2><SubmissionForm kind="celula" fields={fields} buttonLabel="Quero participar de uma célula" successMessage="Recebemos seu interesse. Nossa equipe entrará em contato para indicar a célula mais adequada."/></div></section>
  </SiteShell>; }
