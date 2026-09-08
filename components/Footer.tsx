import Link from "next/link";
import { siteContent, defaultContact } from "../lib/content";

export async function Footer() {
  let contact = defaultContact;
  try { contact = (await siteContent()).contact; } catch (error) { console.error("Footer contact unavailable", error); }
  return (
    <footer className="site-footer bg-black py-16 text-white">
      <div className="container-shell grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <img src="/logo-oficial.svg" alt="Logo oficial da CC Visão Profética" className="h-32 w-32 object-contain" />
          <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-400">
            Você é bem-vindo aqui. Venha viver a fé, a comunhão e a Palavra com a gente.
          </p>
        </div>
        <div>
          <p className="eyebrow text-zinc-500">Links rápidos</p>
          <div className="mt-5 grid gap-3 text-sm text-zinc-300">
            <Link href="/quem-somos">Quem somos</Link><Link href="/programacao">Programação</Link><Link href="/celulas">Células</Link><Link href="/cursos">Cursos</Link><Link href="/eventos">Eventos</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow text-zinc-500">Participar</p>
          <div className="mt-5 grid gap-3 text-sm text-zinc-300">
            <Link href="/fazer-parte">Quero fazer parte</Link><Link href="/batismo">Quero me batizar</Link><Link href="/ministerios">Quero servir</Link><Link href="/oracao">Pedido de oração</Link><Link href="/area-do-aluno">Área do aluno</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow text-zinc-500">Contato</p>
          <div className="mt-5 grid gap-3 text-sm text-zinc-300">
            <p>{contact.address || "Endereço a confirmar"}</p><p>{contact.whatsapp || "WhatsApp a confirmar"}</p><p className="break-all">{contact.email || "E-mail a confirmar"}</p>
            <Link href="/contato" className="underline underline-offset-4">Ver contato</Link>
          </div>
        </div>
      </div>
      <div className="container-shell mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Comunidade Cristã Visão Profética. Todos os direitos reservados.</p>
        <div className="flex flex-wrap gap-5"><Link href="/privacidade">Política de Privacidade</Link><Link href="/termos">Termos de Uso</Link><Link href="/admin" prefetch={false}>Administração</Link></div>
      </div>
    </footer>
  );
}
