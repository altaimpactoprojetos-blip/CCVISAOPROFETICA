import { database } from "../../../../lib/database";
import { requireAdminRequest, passwordHash, validatePassword, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, id, text } from "../../../../lib/validation";

/** Contas da recepção: só validam inscrições e imprimem a lista. */
export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const result = await database().from("admin_credentials").select("id, email, display_name, created_at").eq("role", "recepcao").order("id");
    if (result.error) throw result.error;
    return privateJson({accounts: result.data ?? []});
  } catch (error) { return requestFailure(error); }
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const data = await body(request);
    const name = text(data.name, "nome", 80);
    const email = text(data.email, "e-mail", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError("Informe um e-mail válido.");
    const password = validatePassword(data.password);
    const result = await database().from("admin_credentials").insert({email, display_name: name, role: "recepcao", password_hash: passwordHash(password)}).select("id").maybeSingle();
    if (result.error) {
      if (result.error.code === "23505") throw new RequestError("Já existe um acesso com este e-mail.", 409);
      throw result.error;
    }
    return privateJson({id: result.data?.id}, 201);
  } catch (error) { return requestFailure(error); }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminRequest(request);
    const accountId = id((await body(request)).id);
    const db = database();
    const account = await db.from("admin_credentials").select("id").eq("id", accountId).eq("role", "recepcao").maybeSingle();
    if (account.error) throw account.error;
    if (!account.data) throw new RequestError("Acesso não encontrado.", 404);
    const sessions = await db.from("admin_sessions").delete().eq("admin_id", accountId);
    if (sessions.error) throw sessions.error;
    const removed = await db.from("admin_credentials").delete().eq("id", accountId).eq("role", "recepcao");
    if (removed.error) throw removed.error;
    return privateJson({ok: true});
  } catch (error) { return requestFailure(error); }
}
