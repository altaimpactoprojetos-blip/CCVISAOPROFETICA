import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import { PageHero } from "../../components/PageHero";
import { RaffleForm } from "../../components/RaffleForm";
import { formatDate } from "../../lib/content";
import { RAFFLE_MAX_AMOUNT, RAFFLE_NUMBER_PRICE, RAFFLE_PACKAGES, formatMoney, formatNumber, raffleSettings, raffleStats, raffleWinner } from "../../lib/raffle";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Rifa do iPhone 17 Pro Max", description: "Concorra a um iPhone 17 Pro Max e ajude a Comunidade Cristã Visão Profética a comprar o telão da igreja."};

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
  const goal = formatMoney(settings.goal * 100);
  const drawDate = settings.draw_date ? formatDate(settings.draw_date) : "data a confirmar";
  const steps = [
    ["Escolha o valor", `Cada número custa ${formatMoney(RAFFLE_NUMBER_PRICE * 100)}. Escolha um pacote ou coloque o seu valor.`],
    ["Pague com Pix", "Na tela seguinte aparecem o QR code e o Pix copia e cola já com o valor certo."],
    ["Envie o comprovante", "Mande o comprovante pelo WhatsApp da igreja. Quando o pagamento é confirmado, seus números passam a valer."],
    ["Acompanhe o sorteio", settings.draw_date ? `O resultado sai pela Loteria Federal de ${drawDate}.` : `Ao atingir a meta de ${goal}, divulgamos a data do sorteio pela Loteria Federal.`],
  ];
  const details = [["Número", `${formatMoney(RAFFLE_NUMBER_PRICE * 100)} cada`], ["Sorteio", settings.draw_date ? `Loteria Federal, ${drawDate}` : "Loteria Federal, data a divulgar"], ["Meta", goal]];
  return <SiteShell>
    <PageHero eyebrow="Rifa Visão Profética" title={`Rifa do ${settings.prize}`} description="Cada número comprado ajuda a instalar o novo telão da nossa igreja. Você concorre e ainda abençoa a obra."/>
    <section className="content-section"><div className="container-shell event-detail">
      <div className="event-detail-main">
        {winner && <div className="panel raffle-winner" role="status"><p className="eyebrow text-zinc-500">Resultado do sorteio</p><h2>Número sorteado: <span className="font-mono">{formatNumber(winner.number)}</span></h2><p className="body-copy">Parabéns, <strong>{winner.order.name.split(/\s+/)[0]}</strong>! Loteria Federal, 1º prêmio: {settings.result}. A equipe da igreja vai entrar em contato para a entrega do {settings.prize}.</p></div>}
        {settings.result && !winner && <div className="panel raffle-winner" role="status"><p className="eyebrow text-zinc-500">Resultado do sorteio</p><h2>Loteria Federal: {settings.result}</h2><p className="body-copy">A equipe está conferindo o número vencedor e publica o resultado em breve.</p></div>}
        <img src="/eventos/rifa-iphone-17-hd.webp" width={1672} height={941} fetchPriority="high" className="event-cover event-detail-cover raffle-cover" alt={`Arte da rifa: concorra a um ${settings.prize}. Cada número comprado ajuda a instalar o novo telão da igreja.`}/>
        {open && <a href="#comprar" className="raffle-cta raffle-jump">Quero meu número <span aria-hidden="true">↓</span></a>}
        <dl className="event-facts">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>

        <div className="panel raffle-progress">
          <div className="raffle-progress-head">
            <div><p className="eyebrow text-zinc-500">Meta do telão</p><p className="raffle-raised">{formatMoney(stats.paid_cents)} <span>de {goal}</span></p></div>
            <p className="raffle-progress-meta"><strong>{stats.paid_numbers.toLocaleString("pt-BR")}</strong> números confirmados</p>
          </div>
          <div className="raffle-bar" role="progressbar" aria-label="Arrecadação para o telão" aria-valuemin={0} aria-valuemax={settings.goal} aria-valuenow={Math.round(raised)}><span style={{width: `${progress}%`}}/></div>
          <p className="raffle-progress-note">Conta somente os pagamentos já confirmados pela equipe.</p>
        </div>

        <h2 className="raffle-heading mt-12">Como participar</h2>
        <ol className="raffle-steps">{steps.map(([title, text], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>

        <div className="registration-about mt-12">
          <h2>Como será realizado o sorteio?</h2>
          <p>Os números vão de <strong>00000</strong> a <strong>99999</strong>, distribuídos automaticamente e sem repetição. O sorteio será realizado assim que a arrecadação atingir <strong>{goal}</strong> em pagamentos confirmados, valor necessário para viabilizar o projeto de aquisição do telão da nossa igreja.</p>
          <p>O ganhador será definido com base no <strong>1º prêmio da Loteria Federal</strong>, em uma data a ser divulgada após a confirmação do valor arrecadado. Ganhará quem possuir o número correspondente ao resultado oficial.</p>
          <p>Caso o número sorteado não tenha sido vendido, será considerado o próximo número vendido acima dele, seguindo a sequência até encontrar um número válido. Após o 99999, a contagem retorna ao 00000.</p>
          <p><strong>Importante:</strong> participarão do sorteio somente os números com pagamento confirmado. Reservas não pagas em até {settings.expire_hours} horas serão canceladas automaticamente, e os números voltarão a ficar disponíveis.</p>
          <p>A data do sorteio será divulgada oficialmente assim que a meta de {goal} estiver integralmente confirmada.</p>
          <p className="registration-about-closing">Obrigado por fazer parte dessa missão! ❤️ Cada contribuição é uma semente para esse projeto, ajudando a nossa igreja a conquistar o telão e a ampliar o alcance da Palavra de Deus.</p>
          <p className="registration-about-closing">Juntos, podemos transformar esse propósito em realidade!</p>
        </div>
      </div>
      <aside className="event-detail-aside" id="comprar">
        {open ? <div className="panel event-registration"><div className="registration-intro"><span className="event-status is-open">Vendas abertas</span><h2 className="mt-4">Garanta seus números</h2><p>Depois de reservar, você vai para a página de pagamento com o Pix da igreja.</p></div><RaffleForm packages={RAFFLE_PACKAGES} price={RAFFLE_NUMBER_PRICE} max={RAFFLE_MAX_AMOUNT}/></div>
          : <div className="panel p-8"><span className="event-status is-closed">Vendas encerradas</span><h2 className="mt-4 text-2xl font-bold">Vendas encerradas</h2><p className="body-copy mt-4">A venda de números não está disponível no momento. Se você já comprou, abra o link que enviamos para o seu e-mail para ver seus números.</p></div>}
      </aside>
    </div></section>
  </SiteShell>;
}
