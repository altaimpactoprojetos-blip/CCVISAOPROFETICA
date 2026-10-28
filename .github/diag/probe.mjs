import { chromium, devices } from "playwright";
const base = "https://ccvisaoprofetica.online";
const note = (m) => console.log(`::notice::${String(m).replace(/\r?\n/g, " | ").slice(0, 3500)}`);
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark" });
const page = await ctx.newPage();
const logs = [];
page.on("console", m => { if (m.type() === "error" || m.type() === "warning") logs.push(`console.${m.type()}: ${m.text()}`); });
page.on("pageerror", e => logs.push(`pageerror: ${e.message} ${(e.stack ?? "").slice(0, 800)}`));
page.on("requestfailed", r => logs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
page.on("response", async r => {
  if (r.url().includes("/api/submissions")) logs.push(`api ${r.status()}: ${(await r.text().catch(() => "")).slice(0, 400)}`);
  else if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.url()}`);
});
page.on("framenavigated", f => { if (f === page.mainFrame()) logs.push(`nav: ${f.url()}`); });
await page.goto(`${base}/eventos/1`, { waitUntil: "networkidle" });
await page.fill('input[name="nome"]', "TESTE CLAUDE - PODE APAGAR");
await page.fill('input[name="email"]', `teste.diagnostico.${Date.now()}@example.com`);
await page.fill('input[name="whatsapp"]', "(85) 90000-0000");
await page.click('form.submission-form button');
await page.waitForTimeout(12000);
const info = await page.evaluate(() => ({
  url: location.href,
  bg: getComputedStyle(document.body).backgroundColor,
  text: document.body.innerText.slice(0, 1200),
}));
note(`depois do envio: ${JSON.stringify(info)}`);
note(`logs: ${logs.join(" || ")}`);
if (info.url.includes("/inscricao/")) {
  const r = await fetch(info.url);
  const t = await r.text();
  note(`fetch comprovante http=${r.status} len=${t.length} inicio=${t.replace(/\s+/g, " ").slice(0, 1500)}`);
}
await browser.close();
