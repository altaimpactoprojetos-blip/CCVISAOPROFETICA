import {database} from "../../../../../lib/database";
import {requireAdminRequest,limitAuth,validatePassword,passwordMatches,passwordHash,cookie,privateJson,requestFailure,RequestError} from "../../../../../lib/admin-auth";
import {body} from "../../../../../lib/validation";
export async function POST(request:Request){
  try {
    const user=await requireAdminRequest(request);const data=await body(request);await limitAuth(request,`password:${user.id}`);
    if(typeof data.current_password!=="string" || data.current_password.length>128)throw new RequestError("Senha atual inválida.");
    const next=validatePassword(data.password),db=database();
    const accountResult=await db.from("admin_credentials").select("password_hash").eq("id",user.id).maybeSingle();
    if(accountResult.error)throw accountResult.error;
    const account=accountResult.data as {password_hash:string} | null;
    if(!account || !passwordMatches(data.current_password,account.password_hash))throw new RequestError("Senha atual inválida.",401);
    const hash=passwordHash(next);
    const updated=await db.from("admin_credentials").update({password_hash:hash}).eq("id",user.id).eq("password_hash",account.password_hash).select("id").maybeSingle();
    if(updated.error)throw updated.error;
    if(!updated.data)throw new RequestError("A senha foi alterada. Entre novamente.",401);
    const sessions=await db.from("admin_sessions").delete().eq("admin_id",user.id);
    if(sessions.error)throw sessions.error;
    return privateJson({ok:true},200,{"Set-Cookie":cookie("",0)});
  }catch(error){return requestFailure(error);}
}
