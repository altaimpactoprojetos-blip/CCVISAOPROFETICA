import {headers} from "next/headers";
import {createHash, randomBytes, scryptSync, timingSafeEqual} from "node:crypto";
import {Buffer} from "node:buffer";
import {database, rpcNumber} from "./database";

export const SESSION_COOKIE = "__Host-cc_admin";
const SESSION_SECONDS = 8 * 60 * 60;
export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function sessionToken(cookie: string | null) {
  const token = cookie?.split(";").map(part=>part.trim()).find(part=>part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length+1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
export async function getAdmin() {
  const token = sessionToken((await headers()).get("cookie"));
  if (!token) return null;
  const db = database();
  const session = await db.from("admin_sessions").select("admin_id").eq("token_hash", digest(token)).gt("expires_at", Math.floor(Date.now()/1000)).maybeSingle();
  if (session.error) throw session.error;
  if (!session.data) return null;
  const admin = await db.from("admin_credentials").select("id, email").eq("id", session.data.admin_id).maybeSingle();
  if (admin.error) throw admin.error;
  return admin.data as {id:number;email:string} | null;
}
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new RequestError("Origem da solicitação não autorizada.",403);
}
export async function requireAdminRequest(request: Request) {
  if (request.method !== "GET") sameOrigin(request);
  const user = await getAdmin();
  if (!user) throw new RequestError("Sua sessão expirou ou o acesso não foi autorizado. Entre novamente na administração.",403);
  return user;
}
export function privateJson(data: unknown, status = 200, extraHeaders: Record<string,string> = {}) {
  return Response.json(data,{status,headers:{"Cache-Control":"private, no-store","Vary":"Cookie",...extraHeaders}});
}
export function requestFailure(error: unknown) {
  if(error instanceof RequestError)return privateJson({error:error.message},error.status);
  console.error("Admin request failed",error);
  return privateJson({error:"Não foi possível concluir agora. Tente novamente em instantes."},503);
}
export function validatePassword(value: unknown) {
  if(typeof value!=="string" || value.length<8 || value.length>128)throw new RequestError("Use uma senha de 8 a 128 caracteres.");
  return value;
}
export function passwordHash(password: string) {
  const salt=randomBytes(16).toString("hex");
  // OWASP scrypt profile: 16 MiB, N=2^14, r=8, p=5; fits the Worker memory budget.
  const hash=scryptSync(password,salt,64,{N:16384,r:8,p:5,maxmem:32*1024*1024}).toString("hex");
  return `scrypt$16384$8$5$${salt}$${hash}`;
}
export function passwordMatches(password: string, encoded: string) {
  const parts=encoded.split("$");
  if(parts.length!==6 || parts[0]!=="scrypt" || parts[1]!=="16384" || parts[2]!=="8" || parts[3]!=="5" || !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5]))return false;
  const candidate=scryptSync(password,parts[4],64,{N:16384,r:8,p:5,maxmem:32*1024*1024});
  return timingSafeEqual(candidate,Buffer.from(parts[5],"hex"));
}
export function cookie(value: string, seconds = SESSION_SECONDS) {return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${seconds}`;}
export async function startSession(adminId: number, verifiedHash: string) {
  const token=randomBytes(32).toString("hex"),now=Math.floor(Date.now()/1000),db=database();
  const cleanup = await db.from("admin_sessions").delete().lte("expires_at", now);
  if (cleanup.error) throw cleanup.error;
  const account = await db.from("admin_credentials").select("id").eq("id", adminId).eq("password_hash", verifiedHash).maybeSingle();
  if (account.error) throw account.error;
  if (!account.data) throw new RequestError("A senha foi alterada. Entre novamente.",401);
  const result = await db.from("admin_sessions").insert({token_hash:digest(token), admin_id:adminId, expires_at:now+SESSION_SECONDS}).select("token_hash").maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) throw new RequestError("Não foi possível iniciar a sessão.",503);
  return cookie(token);
}
export async function limitAuth(request: Request, account: string) {
  const db=database(),now=Math.floor(Date.now()/1000);
  const keys=[`ip:${digest(request.headers.get("cf-connecting-ip") || "unknown")}`,`account:${digest(account.toLowerCase())}`];
  for (const key of keys) {
    const result = await db.rpc("register_admin_auth_attempt", {p_key:key, p_now:now, p_reset_at:now+900});
    if (result.error) throw result.error;
    if ((rpcNumber(result.data) ?? 9)>8) throw new RequestError("Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",429);
  }
  const cleanup = await db.from("admin_login_attempts").delete().lt("reset_at",now-3600);
  if (cleanup.error) throw cleanup.error;
}
