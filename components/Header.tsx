"use client";

import Link from "next/link";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

const nav = [
  ["Início", "/"],
  ["Quem somos", "/quem-somos"],
  ["Programação", "/programacao"],
  ["Células", "/celulas"],
  ["Cursos", "/cursos"],
  ["Eventos", "/eventos"],
  ["Ministérios", "/ministerios"],
  ["Galeria", "/galeria"],
  ["Contato", "/contato"],
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="container-shell flex min-h-20 items-center justify-between gap-5">
        <Link href="/" className="flex items-center" aria-label="Início - CC Visão Profética">
          <img src="/logo-oficial.webp" alt="Logo oficial da Comunidade Cristã Visão Profética" className="h-16 w-16 object-contain" />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Navegação principal">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-[.78rem] font-medium text-zinc-300 transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/area-do-aluno" className="rounded-sm border border-white/30 px-4 py-3 text-[.72rem] font-semibold hover:bg-white hover:text-black">
            Área do aluno
          </Link>
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-sm border border-white/30 xl:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Fechar menu" : "Abrir menu"}>
          {open ? <CloseIcon className="h-5 w-5"/> : <MenuIcon className="h-5 w-5"/>}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black px-5 pb-6 xl:hidden">
          <nav className="container-shell grid py-3" aria-label="Navegação mobile">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="border-b border-white/10 py-3 text-sm font-semibold">
                {label}
              </Link>
            ))}
            <div className="mt-5 grid gap-2 sm:hidden">
              <Link href="/area-do-aluno" onClick={() => setOpen(false)} className="rounded-sm border border-white/30 px-5 py-4 text-center text-xs font-semibold">Área do aluno</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
