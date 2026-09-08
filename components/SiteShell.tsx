import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteShell({ children }: { children: ReactNode }) {
  return <><a href="#conteudo" className="skip-link">Pular para o conteúdo</a><Header/><main id="conteudo" tabIndex={-1}>{children}</main><Footer/></>;
}
