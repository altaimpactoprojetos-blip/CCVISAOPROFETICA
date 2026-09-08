import {database} from "../../../../../lib/database";
import {sameOrigin,limitAuth,passwordMatches,startSession,privateJson,requestFailure,RequestError} from "../../../../../lib/admin-auth";
import {body} from "../../../../../lib/validation";
export async function POST(request:Request){
  try {
    sameOrigin(request);const data=await body(request);
    const email=typeof data.email==='string'?data.email.trim().toLowerCase():"";
    const password=typeof data.password==='string'?data.password:"";
    if(!email || email.length>254 || !password || password.length>128)throw new RequestError("E-mail ou senha inválidos.",401);
    await limitAuth(request,email);
    const result=await database().from("admin_credentials").select("id, password_hash").eq("email", email).maybeSingle();
    if(result.error)throw result.error;
    const account=result.data as {id:number;password_hash:string} | null;
    // Use the same slow verifier for missing accounts to avoid an email-enumeration timing shortcut.
    const fallback=`scrypt$16384$8$5$${"0".repeat(32)}$${"0".repeat(128)}`;
    const valid=passwordMatches(password,account?.password_hash ?? fallback);
    if(!account || !valid)throw new RequestError("E-mail ou senha inválidos.",401);
    return privateJson({ok:true},200,{"Set-Cookie":await startSession(account.id,account.password_hash)});
  }catch(error){return requestFailure(error);}
}
