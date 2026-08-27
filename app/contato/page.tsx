import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { PlaceholderNotice } from "../../components/PlaceholderNotice";
import { SiteShell } from "../../components/SiteShell";
import { SubmissionForm, type Field } from "../../components/SubmissionForm";

export const metadata: Metadata = { title: "Contato" };
const fields: Field[] = [{ name: "nome", label: "Nome completo", required: true }, { name: "whatsapp", label: "WhatsApp", type: "tel", required: true }, { name: "email", label: "E-mail", type: "email" }, { name: "assunto", label: "Assunto", required: true, full: true }, { name: "mensagem", label: "Mensagem", type: "textarea", required: true }];
export default function ContatoPage() { return <SiteShell><PageHero eyebrow="Fale conosco" title="Será uma alegria receber você." description="Entre em contato com a igreja, tire dúvidas e receba orientações para sua visita."/><section className="content-section"><div className="container-shell grid gap-10 lg:grid-cols-[.55fr_1fr]"><div><h2 className="text-3xl font-bold">Informações da igreja</h2><div className="mt-6"><PlaceholderNotice>Endereço, telefone, WhatsApp, Instagram, YouTube, e-mail, horários e localização no mapa ainda não foram informados.</PlaceholderNotice></div><div className="mt-6 grid gap-3 text-sm text-zinc-600"><p><strong>Endereço:</strong> a confirmar</p><p><strong>WhatsApp:</strong> a confirmar</p><p><strong>E-mail:</strong> a confirmar</p><p><strong>Horários:</strong> consulte a programação após atualização</p></div></div><SubmissionForm kind="contato" fields={fields} buttonLabel="Enviar mensagem" successMessage="Mensagem recebida. Nossa equipe entrará em contato assim que possível."/></div></section></SiteShell>; }
