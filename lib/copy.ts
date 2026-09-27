// Copia texto para a área de transferência. Tenta primeiro o execCommand de forma
// síncrona (funciona nos navegadores embutidos do WhatsApp/Instagram, onde a API
// navigator.clipboard costuma faltar ou ser negada) e depois a API moderna.
function legacyCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  area.style.fontSize = "16px"; // evita zoom no iOS
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  area.remove();
  return ok;
}

export async function copyText(text: string) {
  if (legacyCopy(text)) return true;
  try {
    if (navigator.clipboard) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* segue para o retorno false */ }
  return false;
}
