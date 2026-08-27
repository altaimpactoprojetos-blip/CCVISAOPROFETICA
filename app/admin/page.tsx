import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { SiteShell } from "../../components/SiteShell";
import { getDb } from "../../db";
import { submissions, userRoles } from "../../db/schema";
import { requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel Administrativo" };

const menu = ["Dashboard", "Inscrições", "Eventos", "Células", "Interessados em células", "Cursos", "Aulas", "Alunos", "Certificados", "Membros", "Visitantes", "Ministérios", "Galeria", "Pedidos de oração", "Programação", "Liderança", "Conteúdo do site", "Configurações"];

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const db = getDb();
  const roleRow = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.email, user.email)).limit(1);
  const allowed = roleRow[0]?.role === "admin" || roleRow[0]?.role === "leadership";
  if (!allowed) return <SiteShell><section className="content-section"><div className="container-shell max-w-2xl text-center"><p className="eyebrow text-zinc-500">Acesso restrito</p><h1 className="section-title mt-5">Acesso administrativo protegido.</h1><p className="body-copy mt-6">Sua identidade foi confirmada, mas ainda não possui uma função administrativa autorizada. Solicite à administração que vincule o e-mail <strong className="text-black">{user.email}</strong> a uma função.</p></div></section></SiteShell>;
  const [total] = await db.select({ value: count() }).from(submissions);
  const cards = [
    ["Cadastros recebidos", total.value], ["Novos visitantes", "Ver inscrições"], ["Pessoas procurando célula", "Ver interessados"], ["Alunos ativos", "Aguardando cursos"], ["Cursos ativos", "0"], ["Próximos eventos", "0"], ["Pedidos de oração", "Privado"], ["Membros cadastrados", "0"],
  ];
  return <SiteShell><section className="bg-black py-14 text-white"><div className="container-shell"><p className="eyebrow text-zinc-500">Administração</p><h1 className="section-title mt-4">Painel da igreja</h1><p className="mt-4 text-sm text-zinc-400">Acesso de {user.displayName}</p></div></section><section className="content-section"><div className="container-shell grid gap-8 xl:grid-cols-[260px_1fr]"><aside className="panel h-fit p-5"><nav className="grid gap-1">{menu.map((item,index)=><span key={item} className={`rounded-sm px-4 py-3 text-sm ${index===0?"bg-black font-bold text-white":"text-zinc-600"}`}>{item}</span>)}</nav></aside><div><p className="eyebrow text-zinc-500">Visão geral</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label,value])=><article key={label} className="panel min-h-40 p-5"><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-10 text-2xl font-bold">{value}</p></article>)}</div><div className="mt-6 border border-zinc-200 bg-white p-6"><h2 className="text-xl font-bold">Estrutura preparada</h2><p className="mt-3 text-sm leading-7 text-zinc-500">O banco de dados já organiza conteúdo, programação, células, cursos, módulos, aulas, progresso, eventos, ministérios, galerias, pedidos e demais formulários. As telas de edição poderão ser liberadas conforme as permissões da equipe.</p></div></div></div></section></SiteShell>;
}
