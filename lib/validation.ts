import { RequestError } from "./admin-auth";
export function text(value: unknown, label: string, max = 200, required = true) {
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) throw new RequestError(`Confira o campo ${label}.`);
  return value.trim();
}
export function id(value: unknown) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new RequestError("Registro inválido.");
  return number;
}
export function date(value: unknown, required = true) {
  if (!value && !required) return null;
  const result = text(value, "data", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(result)) || new Date(result).toISOString().slice(0,10) !== result) throw new RequestError("Informe uma data válida.");
  return result;
}
export function time(value: unknown) {
  const result = text(value, "horário", 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result)) throw new RequestError("Informe um horário válido.");
  return result;
}
export async function body(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new RequestError("Formato de solicitação inválido.");
  const value = await request.text();
  if (value.length > 32000) throw new RequestError("Dados acima do limite permitido.", 413);
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch { throw new RequestError("Dados inválidos."); }
}
export function publication(value: unknown) { if (typeof value !== "boolean") throw new RequestError("Publicação inválida."); return value; }
