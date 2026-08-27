import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { SiteShell } from "../../components/SiteShell";
import { SubmissionForm, type Field } from "../../components/SubmissionForm";

export const metadata: Metadata = { title: "Pedido de Oração" };
const fields: Field[] = [
  { name: "nome", label: "Nome" }, { name: "whatsapp", label: "WhatsApp (opcional)", type: "tel" },
  { name: "anonimo", label: "Enviar de forma anônima", type: "checkbox", full: true }, { name: "pedido", label: "Pedido de oração", type: "textarea", required: true },
];
export default function OracaoPage() { return <SiteShell><PageHero eyebrow="Estamos com você" title="Podemos orar por você?" description="Compartilhe seu pedido conosco. Nossa equipe de oração estará intercedendo por você."/><section className="content-section"><div className="container-shell grid gap-10 lg:grid-cols-[.42fr_1fr]"><div><h2 className="text-3xl font-bold">Seu pedido é confidencial.</h2><p className="body-copy mt-4">Os pedidos não ficam públicos e somente pessoas autorizadas poderão visualizá-los.</p></div><SubmissionForm kind="oracao" fields={fields} buttonLabel="Enviar pedido de oração" successMessage="Seu pedido foi recebido com cuidado e será encaminhado à equipe de oração autorizada."/></div></section></SiteShell>; }
