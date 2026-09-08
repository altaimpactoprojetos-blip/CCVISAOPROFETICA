"use client";
import {useEffect,useState,type FormEvent} from "react";
export function AdminLogin({setup=false}:{setup?:boolean}){
  const [token,setToken]=useState("");
  const [error,setError]=useState("");
  const [done,setDone]=useState(false);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if(setup){setToken(new URLSearchParams(window.location.hash.slice(1)).get("token")??"");history.replaceState(null,"",window.location.pathname);}},[setup]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");const data=new FormData(e.currentTarget);
    if(setup && data.get("password")!==data.get("confirmation")){setError("As senhas precisam ser iguais.");setBusy(false);return;}
    try {const response=await fetch(`/api/admin/auth/${setup?"setup":"login"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:data.get("email"),password:data.get("password"),...(setup?{token}:{})})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Não foi possível entrar agora.");if(setup){setDone(true);setToken("");}else{window.location.assign("/admin");}}
    catch(error){setError(error instanceof Error?error.message:"Confira a conexão e tente novamente.");}finally{setBusy(false);}
  }
  if(done)return <div role="status"><h1 className="section-title">Acesso criado.</h1><p className="body-copy mt-5">Entre com o e-mail e a senha que você acabou de definir.</p><a href="/admin" className="btn-primary mt-6">Ir para o login</a></div>;
  return <><p className="eyebrow">Administração da igreja</p><h1 className="section-title mt-4">{setup?"Crie seu acesso":"Entrar no painel"}</h1><p className="body-copy mt-5">{setup?"Defina o e-mail e a senha do administrador. Este link funciona apenas na primeira ativação.":"Use seu e-mail e sua senha para gerenciar os eventos, as inscrições e as fotos da igreja."}</p>
    <form className="mt-7 grid gap-5" onSubmit={submit}><label className="field-label"><span>E-mail</span><input name="email" type="email" required maxLength={254} autoComplete="username" className="field-control"/></label><label className="field-label"><span>{setup?"Crie uma senha":"Senha"}</span><input name="password" type="password" required minLength={setup?8:undefined} maxLength={128} autoComplete={setup?"new-password":"current-password"} className="field-control"/>{setup&&<span className="font-normal text-sm text-zinc-600">Mínimo de 8 caracteres.</span>}</label>{setup&&<label className="field-label"><span>Repita a senha</span><input name="confirmation" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="field-control"/></label>}
      {setup&&!token&&<p className="text-sm text-zinc-600">Abra o link privado de ativação fornecido pelo responsável pelo site.</p>}{error&&<p className="admin-notice admin-error" role="alert">{error}</p>}<button className="btn-primary" disabled={busy || (setup&&!token)}>{busy?"Aguarde…":setup?"Criar acesso administrativo":"Entrar"}</button></form>{!setup&&<p className="mt-5 text-sm text-zinc-600">Se esqueceu a senha, solicite ajuda ao responsável pelo site.</p>}</>;
}
export function AdminLogout(){
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  return <div><button className="btn-secondary" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch("/api/admin/auth/logout",{method:"POST"});if(!response.ok)throw new Error();window.location.assign("/admin");}catch{setError("Não foi possível sair. Tente novamente.");setBusy(false);}}}>{busy?"Saindo…":"Sair"}</button>{error&&<p role="alert">{error}</p>}</div>;
}
export function AdminPassword(){
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  return <form className="panel admin-editor mt-6" onSubmit={async e=>{e.preventDefault();setBusy(true);setError("");const data=new FormData(e.currentTarget);if(data.get("password")!==data.get("confirmation")){setError("As novas senhas precisam ser iguais.");setBusy(false);return;}try{const response=await fetch("/api/admin/auth/password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(data))});const result=await response.json();if(!response.ok)throw new Error(result.error);window.location.assign("/admin");}catch(error){setError((error as Error).message);}finally{setBusy(false);}}}><h3 className="text-xl font-bold">Alterar senha</h3><p className="body-copy mt-3">Ao salvar, você sairá das sessões abertas e deverá entrar com a nova senha.</p><div className="mt-5 grid gap-5">{[["current_password","Senha atual"],["password","Nova senha"],["confirmation","Repita a nova senha"]].map(([name,label])=><label key={name} className="field-label"><span>{label}</span><input name={name} type="password" autoComplete={name==="current_password"?"current-password":"new-password"} required minLength={name==="current_password"?undefined:8} maxLength={128} className="field-control"/></label>)}</div>{error&&<p className="admin-notice admin-error" role="alert">{error}</p>}<button className="btn-primary mt-5" disabled={busy}>{busy?"Salvando…":"Alterar senha e sair"}</button></form>;
}
