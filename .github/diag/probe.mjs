import { chromium, devices } from "playwright";
const base = "https://ccvisaoprofetica.online";
const note = (m) => console.log(`::notice::${String(m).replace(/\r?\n/g, " | ").slice(0, 3000)}`);
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark" });
const page = await ctx.newPage();
const logs = [];
page.on("console", m => { if (m.type() === "error" || m.type() === "warning") logs.push(`console.${m.type()}: ${m.text()}`); });
page.on("pageerror", e => logs.push(`pageerror: ${e.message} ${e.stack ?? ""}`));
page.on("requestfailed", r => logs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
page.on("response", r => { if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.url()}`); });
await page.goto(`${base}/eventos`, { waitUntil: "networkidle" });
const links = [...new Set(await page.$$eval('a[href^="/eventos/"]', as => as.map(a => a.getAttribute("href"))))];
note(`eventos: ${links.join(", ")}`);
for (const href of links) {
  logs.length = 0;
  const res = await page.goto(base + href, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent,
    form: !!document.querySelector("form.submission-form"),
    status: document.querySelector(".event-status")?.textContent,
    bg: getComputedStyle(document.body).backgroundColor,
    text: document.body.innerText.slice(0, 600),
  }));
  note(`${href} http=${res?.status()} ${JSON.stringify(info)}`);
  note(`${href} logs: ${logs.join(" || ") || "nenhum"}`);
}
await browser.close();
const api = async (label, body) => {
  const r = await fetch(`${base}/api/submissions`, { method: "POST", headers: { "content-type": "application/json", origin: base }, body: JSON.stringify(body) });
  note(`${label}: http=${r.status} ${(await r.text()).slice(0, 500)}`);
};
await api("evento inexistente", { kind: "evento", eventId: 999999, payload: { nome: "Teste Diagnostico", email: "teste@example.com", whatsapp: "85900000000" } });
await api("evento invalido", { kind: "evento", eventId: 0, payload: { nome: "x" } });
for (const path of ["/inscricao/AAAAAAAAAA", "/inscricao/abc"]) {
  const r = await fetch(base + path);
  const t = await r.text();
  note(`${path}: http=${r.status} ${t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400)}`);
}
