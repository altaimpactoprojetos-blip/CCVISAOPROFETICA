"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="container-shell header-inner">
        <Link href="/" className="brand-link" aria-label="Início - Comunidade Cristã Visão Profética">
          <img src="/logo-symbol.svg" alt="" aria-hidden="true" className="brand-symbol" />
          <span className="brand-name">
            <span>COMUNIDADE CRISTÃ</span>
            <strong>VISÃO PROFÉTICA</strong>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link" aria-current={isActive(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/area-do-aluno" className="student-link" aria-current={isActive("/area-do-aluno") ? "page" : undefined}>
            Área do aluno
          </Link>
          <button type="button" className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Fechar menu" : "Abrir menu"}>
            {open ? <CloseIcon className="h-5 w-5"/> : <MenuIcon className="h-5 w-5"/>}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-navigation" className="mobile-menu" onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
          }
        }}>
          <nav className="container-shell" aria-label="Navegação mobile">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="mobile-link" aria-current={isActive(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
            <Link href="/area-do-aluno" onClick={() => setOpen(false)} className="student-link mobile-student-link">Área do aluno</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
