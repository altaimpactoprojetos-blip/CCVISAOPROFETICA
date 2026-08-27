import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "../chatgpt-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Área do Aluno",
  description:
    "Acesse a Área do Aluno com seu e-mail para acompanhar cursos, eventos, certificados e célula.",
};

export default async function AreaDoAlunoPage() {
  const user = await getChatGPTUser();

  if (!user) {
    return (
      <SiteShell>
        <section className="bg-black py-16 text-white sm:py-24">
          <div className="container-shell grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow text-zinc-500">Área do Aluno</p>
              <h1 className="section-title mt-4">Seu caminho de aprendizado em um só lugar.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
                Entre com seu e-mail para acompanhar cursos, eventos,
                certificados e informações da sua célula.
              </p>
            </div>

            <div className="rounded-sm border border-white/15 bg-white p-7 text-black shadow-2xl sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-zinc-500">
                Acesso seguro
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Entre com e-mail ou Google
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Você pode utilizar sua conta Google vinculada ao ChatGPT. O
                acesso identifica seu e-mail e protege as informações da Área
                do Aluno.
              </p>
              <a
                href={chatGPTSignInPath("/area-do-aluno")}
                target="_top"
                className="btn-primary mt-7 w-full"
              >
                Acessar com e-mail ou Google
              </a>
              <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
                Qualquer pessoa com uma conta Google pode entrar.
              </p>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const cards = [
    { title: "Meus cursos", text: "Nenhum curso inscrito.", href: "/cursos" },
    { title: "Continuar estudando", text: "Sua próxima aula aparecerá aqui.", href: "/cursos" },
    { title: "Meus eventos", text: "Nenhuma inscrição encontrada.", href: "/eventos" },
    { title: "Meus certificados", text: "Nenhum certificado disponível.", href: "#" },
    { title: "Minha célula", text: "Vínculo ainda não cadastrado.", href: "/celulas" },
  ];
  return (
    <SiteShell>
      <section className="bg-black py-16 text-white">
        <div className="container-shell flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-zinc-500">Área protegida</p>
            <h1 className="section-title mt-4">Olá, {user.displayName}.</h1>
            <p className="mt-4 text-sm text-zinc-400">
              Acompanhe cursos, eventos, certificados e sua célula.
            </p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-sm border border-white/15 bg-white/5 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="text-xs text-zinc-300">Conta conectada: {user.email}</span>
            </div>
          </div>
          <a
            href={chatGPTSignOutPath("/")}
            className="rounded-sm border border-white/30 px-5 py-3 text-xs font-semibold transition hover:bg-white hover:text-black"
          >
            Sair
          </a>
        </div>
      </section>
      <section className="content-section">
        <div className="container-shell">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ title, text, href }, index) => (
              <Link
                key={title}
                href={href}
                className="panel min-h-60 p-7 transition hover:-translate-y-1"
              >
                <span className="text-xs text-zinc-400">0{index + 1}</span>
                <h2 className="mt-20 text-2xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm text-zinc-500">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
