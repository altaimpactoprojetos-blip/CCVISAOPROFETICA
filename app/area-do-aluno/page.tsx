import type { Metadata } from "next";
import { SiteShell } from "../../components/SiteShell";
import { StudentArea } from "./StudentArea";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Área do Aluno",
  description:
    "Acesse a Área do Aluno com sua conta Google para acompanhar cursos, eventos, certificados e célula.",
};

export default function AreaDoAlunoPage() {
  return (
    <SiteShell>
      <StudentArea />
    </SiteShell>
  );
}
