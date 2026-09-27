import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import { PhoneArt } from "../../components/PhoneArt";
import { RaffleForm } from "../../components/RaffleForm";
import { formatDate } from "../../lib/content";
import { RAFFLE_MAX_AMOUNT, RAFFLE_NUMBER_PRICE, RAFFLE_PACKAGES, formatMoney, formatNumber, raffleSettings, raffleStats, raffleWinner } from "../../lib/raffle";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Rifa solidária do iPhone 17", description: "Concorra a um iPhone 17 e ajude a Comunidade Cristã Visão Profética a comprar o telão da igreja."};

export default async function RafflePage() {
  let data;
  try {
    const settings = await raffleSettings();
    data = settings.published ? {settings, stats: await raffleStats(), winner: settings.result ? await raffleWinner(settings.result) : null} : null;
  } catch (error) {
    console.error("Raffle unavailable", error);
    return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Rifa temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível carregar a rifa agora. Tente novamente em instantes.</p></div></section></SiteShell>;
  }
  if (!data) notFound();
  const {settings, stats, winner} = data;
  const raised = stats.paid_cents / 100;
  const progress = settings.goal > 0 ? Math.min(100, (raised / settings.goal) * 100) : 0;
  const open = settings.open && !settings.result;
  const drawDate = settings.draw_date ? formatDate(settings.draw_date) : "data a confirmar";
  const steps = [
    ["Escolha o valor", `Cada número custa ${formatMoney(RAFFLE_NUMBER_PRICE * 100)}. Escolha um pacote ou coloque o seu valor.`],
    ["Pague com Pix", "Na tela seguinte aparecem o QR code e o Pix copia e cola já com o valor certo."],
    ["Envie o comprovante", "Mande o comprovante pelo WhatsApp da igreja. Quando o pagamento é confirmado, seus números passam a valer."],
    ["Acompanhe o sorteio", `O resultado sai pela Loteria Federal de ${drawDate}.`],
  ];
  return <SiteShell>
    <section className="raffle-hero">
      <div className="container-shell raffle-hero-inner">
        <div>
          <p className="eyebrow">Rifa solidária · Telão da igreja</p>
          <h1 className="display-title mt-5">Concorra a um {settings.prize} e ajude a levantar o nosso telão.</h1>
          <p className="raffle-hero-copy">Todo o valor arrecadado vai para a compra do telão da Comunidade Cristã Visão Profética, para que a Palavra, os louvores e os avisos cheguem com clareza a todos que estiverem no culto.</p>
          <div className="raffle-hero-actions">
            {open ? <a href="#comprar" className="btn-light">Quero meus números</a> : <span className="event-status is-closed">Vendas encerradas</span>}
            <span>A partir de <strong>{formatMoney(RAFFLE_NUMBER_PRICE * 100)}</strong> · Sorteio em {drawDate}</span>
          </div>
        </div>
        <PhoneArt className="raffle-hero-art"/>
      </div>
    </section>

    <section className="content-section">
      <div className="container-shell">
        {winner && <div className="panel raffle-winner" role="status"><p className="eyebrow text-zinc-500">Resultado do sorteio</p><h2>Número sorteado: <span className="font-mono">{formatNumber(winner.number)}</span></h2><p className="body-copy">Parabéns, <strong>{winner.order.name.split(/\s+/)[0]}</strong>! Loteria Federal, 1º prêmio: {settings.result}. A equipe da igreja vai entrar em contato para a entrega do {settings.prize}.</p></div>}
        {settings.result && !winner && <div className="panel raffle-winner" role="status"><p className="eyebrow text-zinc-500">Resultado do sorteio</p><h2>Loteria Federal: {settings.result}</h2><p className="body-copy">A equipe está conferindo o número vencedor e publica o resultado em breve.</p></div>}

        <div className="panel raffle-progress">
          <div className="raffle-progress-head">
            <div><p className="eyebrow text-zinc-500">Meta do telão</p><p className="raffle-raised">{formatMoney(stats.paid_cents)} <span>de {formatMoney(settings.goal * 100)}</span></p></div>
            <p className="raffle-progress-meta"><strong>{stats.paid_numbers.toLocaleString("pt-BR")}</strong> números confirmados</p>
          </div>
          <div className="raffle-bar" role="progressbar" aria-label="Arrecadação para o telão" aria-valuemin={0} aria-valuemax={settings.goal} aria-valuenow={Math.round(raised)}><span style={{width: `${progress}%`}}/></div>
          <p className="raffle-progress-note">Conta somente os pagamentos já confirmados pela equipe.</p>
        </div>

        <div className="raffle-layout">
          <div>
            <h2 className="raffle-heading">Como participar</h2>
            <ol className="raffle-steps">{steps.map(([title, text], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>

            <h2 className="raffle-heading mt-14">Como é feito o sorteio</h2>
            <div className="registration-about">
              <p>Os números vão de <strong>00000</strong> a <strong>99999</strong> e são distribuídos automaticamente, sem repetição. O ganhador é definido pelo <strong>1º prêmio da Loteria Federal</strong> de {drawDate}: ganha quem tiver exatamente esse número.</p>
              <p>Se o número sorteado não tiver sido vendido, ganha o próximo número vendido acima dele (depois do 99999, a contagem volta para o 00000). Assim sempre há um ganhador, e o resultado pode ser conferido por qualquer pessoa no site da Caixa.</p>
              <p>Participam do sorteio apenas os números com pagamento confirmado. Reservas sem pagamento em até {settings.expire_hours} horas são liberadas automaticamente.</p>
              <p className="registration-about-closing">Obrigado por semear neste projeto. Cada número ajuda a levantar o telão da nossa casa.</p>
            </div>
          </div>
          <aside className="raffle-aside" id="comprar">
            {open ? <div className="panel event-registration"><div className="registration-intro"><span className="event-status is-open">Vendas abertas</span><h2 className="mt-4">Garanta seus números</h2><p>Depois de reservar, você vai para a página de pagamento com o Pix da igreja.</p></div><RaffleForm packages={RAFFLE_PACKAGES} price={RAFFLE_NUMBER_PRICE} max={RAFFLE_MAX_AMOUNT}/></div>
              : <div className="panel p-8"><span className="event-status is-closed">Vendas encerradas</span><h2 className="mt-4 text-2xl font-bold">Vendas encerradas</h2><p className="body-copy mt-4">A venda de números não está disponível no momento. Se você já comprou, abra o link que enviamos para o seu e-mail para ver seus números.</p></div>}
          </aside>
        </div>
      </div>
    </section>
  </SiteShell>;
}
