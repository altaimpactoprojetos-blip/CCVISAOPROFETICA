import type {Metadata} from "next";
import {SiteShell} from "../../../components/SiteShell";
import {AdminLogin} from "../../../components/AdminLogin";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Ativar administração",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function SetupPage(){return <SiteShell><section className="content-section"><div className="container-shell admin-access panel"><AdminLogin setup/></div></section></SiteShell>;}
