export function PlaceholderNotice({ children = "Informação aguardando confirmação da igreja. O conteúdo poderá ser atualizado no painel administrativo." }: { children?: React.ReactNode }) {
  return <div className="border-l-2 border-black py-1 pl-5 text-sm leading-7 text-zinc-600"><strong className="block text-[.72rem] font-semibold tracking-[.08em] text-zinc-900">Em atualização</strong><span className="mt-1 block">{children}</span></div>;
}
