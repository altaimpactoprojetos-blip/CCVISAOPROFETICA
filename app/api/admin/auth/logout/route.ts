import {database} from "../../../../../lib/database";
import {sameOrigin,sessionToken,digest,cookie,privateJson,requestFailure} from "../../../../../lib/admin-auth";
export async function POST(request:Request){
  try {sameOrigin(request);const token=sessionToken(request.headers.get("cookie"));if(token){const result=await database().from("admin_sessions").delete().eq("token_hash",digest(token));if(result.error)throw result.error;}return privateJson({ok:true},200,{"Set-Cookie":cookie("",0)});}catch(error){return requestFailure(error);}
}
