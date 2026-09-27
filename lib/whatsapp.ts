// Normaliza um telefone brasileiro para o formato do wa.me (55 + DDD + número).
// Aceita "(85) 99413-3277", "+55 85 9413-3277", "085 99413-3277" etc. Celular salvo
// sem o nono dígito ganha o 9, senão o WhatsApp não encontra o número.
export function whatsappNumber(value: string) {
  let digits = String(value || "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (digits.length === 12 && digits.startsWith("55") && /[6-9]/.test(digits[4])) digits = `${digits.slice(0, 4)}9${digits.slice(4)}`;
  return digits.length >= 12 ? digits : "";
}

export function whatsappLink(value: string, text?: string) {
  const number = whatsappNumber(value);
  if (!number) return "";
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

// No Android, abre direto no WhatsApp comum (Messenger) em vez do WhatsApp Business.
// Se o WhatsApp comum não estiver instalado, o Chrome segue para o link wa.me.
// Navegadores embutidos (WebView, Instagram, Facebook) não tratam intent://, então ficam no wa.me.
export function opensWhatsappIntent(userAgent: string) {
  return /Android/i.test(userAgent) && !/; wv\)|Instagram|FBAN|FBAV/i.test(userAgent);
}

export function whatsappMessengerLink(value: string, text?: string) {
  const fallback = whatsappLink(value, text);
  if (!fallback) return "";
  const query = `phone=${whatsappNumber(value)}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
  return `intent://send?${query}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(fallback)};end`;
}
