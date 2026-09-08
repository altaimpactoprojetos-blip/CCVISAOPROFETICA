import type {Metadata} from "next";
import {SiteShell} from "../../components/SiteShell";
import {AdminPanel} from "../../components/AdminPanel";
import {AdminLogin,AdminLogout} from "../../components/AdminLogin";
import {getAdmin} from "../../lib/admin-auth";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Administração",robots:{index:false,follow:false}};
export default async function AdminPage(){
  let admin;try{admin=await getAdmin();}catch{return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Painel temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível verificar seu acesso agora. Tente novamente em instantes.</p></div></section></SiteShell>;}
  if(!admin)return <SiteShell><section className="content-section"><div className="container-shell admin-access panel"><AdminLogin/></div></section></SiteShell>;
  return <SiteShell><div className="admin-heading"><div className="container-shell flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Administração</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Painel da igreja</h1><p className="mt-2 text-sm text-zinc-600 break-all">{admin.email}</p></div><AdminLogout/></div></div><AdminPanel/></SiteShell>;
}
