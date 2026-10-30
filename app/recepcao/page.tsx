import type {Metadata} from "next";
import {SiteShell} from "../../components/SiteShell";
import {CheckInDesk} from "../../components/CheckInDesk";
import {AdminLogin, AdminLogout} from "../../components/AdminLogin";
import {getStaff} from "../../lib/admin-auth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Recepção", robots: {index: false, follow: false}};
export default async function ReceptionPage() {
  let staff;
  try { staff = await getStaff(); }
  catch { return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Recepção temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível verificar seu acesso agora. Tente novamente em instantes.</p></div></section></SiteShell>; }
  if (!staff) return <SiteShell><section className="content-section"><div className="container-shell admin-access panel"><AdminLogin redirectTo="/recepcao" title="Recepção do evento" intro="Entre com o e-mail e a senha que a administração criou para você validar as inscrições na entrada."/></div></section></SiteShell>;
  return <SiteShell><div className="checkin-page">
    <div className="admin-heading"><div className="container-shell flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Recepção</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Validar inscrições</h1><p className="mt-2 text-sm text-zinc-600">Leia o QR code do comprovante ou procure pelo nome.</p></div><div className="flex flex-wrap gap-3">{staff.role === "admin" && <a className="btn-secondary" href="/admin">Painel</a>}<AdminLogout redirectTo="/recepcao"/></div></div></div>
    <section className="content-section"><div className="container-shell"><CheckInDesk staffName={staff.display_name || staff.email}/></div></section>
  </div></SiteShell>;
}
