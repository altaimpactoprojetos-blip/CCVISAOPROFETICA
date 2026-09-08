import {env} from "cloudflare:workers";
import {database} from "../../../../../lib/database";
import {sameOrigin,limitAuth,digest,validatePassword,passwordHash,privateJson,requestFailure,RequestError} from "../../../../../lib/admin-auth";
import {body,text} from "../../../../../lib/validation";
export async function POST(request:Request){
  try {
    sameOrigin(request);const data=await body(request);await limitAuth(request,"initial-setup");
    const expected=String(env.ADMIN_SETUP_TOKEN_HASH ?? "");
    const expires=Number(env.ADMIN_SETUP_EXPIRES_AT ?? 0);
    if(!expected || expires<Date.now())throw new RequestError("A ativação está indisponível ou expirou. Solicite um novo link ao responsável pelo site.",403);
    if(typeof data.token!=="string" || data.token.length!==64 || digest(data.token)!==expected)throw new RequestError("Link de ativação inválido.",403);
    const email=text(data.email,"e-mail",254).toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new RequestError("Informe um e-mail válido.");
    const password=validatePassword(data.password);
    const db=database();
    const existing=await db.from("admin_credentials").select("id").limit(1);
    if(existing.error)throw existing.error;
    if(existing.data?.length)throw new RequestError("O acesso já foi ativado. Entre com seu e-mail e senha.",409);
    const hash=passwordHash(password);
    const result=await db.from("admin_credentials").insert({id:1,email,password_hash:hash}).select("id").maybeSingle();
    if(result.error) {
      if((result.error as {code?: string}).code === "23505")throw new RequestError("O acesso já foi ativado. Entre com seu e-mail e senha.",409);
      throw result.error;
    }
    if(!result.data)throw new RequestError("O acesso já foi ativado. Entre com seu e-mail e senha.",409);
    return privateJson({ok:true},201);
  }catch(error){return requestFailure(error);}
}
