import type { Metadata } from "next";
import { PageHero } from "../../components/PageHero";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = { title: "Quem Somos", description: "A história da Comunidade Cristã Visão Profética: o que começou em uma garagem se tornou uma comunidade de fé, uma família e uma igreja com uma visão." };

type Photo = { src: string; alt: string; width: number; height: number };
type Chapter = { number: string; title: string; paragraphs: string[]; highlight?: string; photos: Photo[]; caption: string };

const chapters: Chapter[] = [
  {
    number: "01",
    title: "Começamos em uma garagem.",
    paragraphs: [
      "A história da Comunidade Cristã Visão Profética começou assim: com uma palavra no coração, uma visão e a coragem de acreditar que Deus poderia fazer algo grande a partir de um começo pequeno.",
      "Não começamos em um grande templo. Não tínhamos uma grande estrutura, nem todos os recursos que hoje podemos imaginar.",
      "Era um lugar simples, mas carregava algo extraordinário: pessoas reunidas pela fé, corações dispostos a servir e a certeza de que Deus havia colocado uma visão em nossos corações.",
      "Ali, naquele espaço pequeno, começaram os primeiros cultos, as primeiras orações, as primeiras palavras e os primeiros passos de uma história que ainda estava apenas começando.",
      "Talvez, para quem olhasse de fora, fosse apenas uma garagem.",
    ],
    highlight: "Mas nós enxergávamos uma igreja.",
    photos: [
      { src: "/historia/garagem-culto.webp", alt: "Irmãos reunidos em culto na garagem", width: 1050, height: 1400 },
      { src: "/historia/garagem-oracao.webp", alt: "Momento de oração com a igreja em pé na garagem", width: 1050, height: 1400 },
    ],
    caption: "Os primeiros cultos na garagem.",
  },
  {
    number: "02",
    title: "Nesse “sim”, a Visão Profética começou a crescer.",
    paragraphs: [
      "Vieram os primeiros membros. Vieram famílias. Vieram líderes. Vieram pessoas com histórias diferentes, necessidades diferentes e sonhos diferentes. Algumas chegaram procurando respostas. Outras chegaram precisando de acolhimento. Outras simplesmente decidiram acreditar naquilo que Deus estava fazendo.",
      "E, pouco a pouco, aquela garagem foi ficando pequena para tudo aquilo que Deus estava construindo. A igreja cresceu.",
      "Mas, acima do crescimento numérico, Deus começou a construir algo ainda mais importante: uma família. Uma comunidade de pessoas que poderiam pertencer, crescer e viver o sobrenatural de Deus.",
      "Ao longo dessa caminhada, passamos por desafios, mudanças, processos e dias que exigiram fé. Houve momentos em que foi necessário continuar acreditando mesmo quando ainda não conseguíamos enxergar o próximo passo. Mas em cada etapa aprendemos uma coisa:",
    ],
    highlight: "Deus sempre foi fiel.",
    photos: [
      { src: "/historia/reuniao-corredor.webp", alt: "Irmãos sentados lado a lado em uma reunião da igreja", width: 720, height: 1280 },
      { src: "/historia/oracao-noite.webp", alt: "Irmãos em círculo de oração à noite", width: 720, height: 1280 },
    ],
    caption: "Reuniões, orações e comunhão ao longo da caminhada.",
  },
  {
    number: "03",
    title: "Quem somos e para que existimos.",
    paragraphs: [
      "Somos uma igreja fundamentada na Palavra de Deus, cheia do Espírito Santo e dos dons espirituais. Uma igreja que acredita na unidade e no amor. Uma igreja que não quer viver de aparência ou religiosidade, mas de verdade e relacionamento com Deus.",
      "Somos uma igreja missionária e acolhedora. Uma igreja que acredita que pessoas podem ser restauradas, famílias podem ser transformadas, dons podem ser despertados e histórias podem ganhar um novo capítulo.",
      "Por isso, nossa caminhada também passou a envolver discipulado, células, cuidado, serviço, comunhão e missão. Porque não queríamos apenas reunir pessoas em um culto.",
      "Queríamos que aqueles que chegassem encontrassem um lugar para pertencer, crescer e descobrir o propósito de Deus para suas vidas.",
    ],
    highlight: "Queríamos formar pessoas.",
    photos: [
      { src: "/historia/culto-galpao.webp", alt: "Igreja reunida em culto em um espaço maior", width: 954, height: 1256 },
    ],
    caption: "Uma igreja que continua crescendo.",
  },
];

const values = ["Pertencer", "Honrar", "Servir"];

function ChapterPhotos({ photos, caption }: { photos: Photo[]; caption: string }) {
  return <figure className="story-photos">
    <div className={photos.length > 1 ? "story-photo-pair" : undefined}>
      {photos.map(photo => <img key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />)}
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export default function QuemSomosPage() {
  return <SiteShell>
    <PageHero eyebrow="Nossa história" title="Toda história que Deus escreve começa com um chamado." description="O que começou em uma garagem se tornou uma comunidade de fé, uma família e uma igreja que carrega uma visão." />

    <section className="content-section"><div className="container-shell">
      <div className="story-intro">
        <p className="eyebrow text-zinc-500">Comunidade Cristã Visão Profética</p>
        <p className="story-lead">Deus não precisa de grandes estruturas para começar grandes coisas. Ele procura pessoas dispostas a dizer <strong>sim</strong>.</p>
      </div>

      <div className="story-chapters">
        {chapters.map((chapter, index) => <article key={chapter.number} className={`story-chapter${index % 2 ? " is-reversed" : ""}`}>
          <div className="story-text">
            <p className="story-number">{chapter.number}</p>
            <h2>{chapter.title}</h2>
            {chapter.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {chapter.highlight && <p className="story-highlight">{chapter.highlight}</p>}
          </div>
          <ChapterPhotos photos={chapter.photos} caption={chapter.caption} />
        </article>)}
      </div>
    </div></section>

    <section className="story-vision"><div className="container-shell">
      <p className="eyebrow">Nossa visão</p>
      <h2>Ser um lugar para</h2>
      <ul>{values.map(value => <li key={value}>{value}</li>)}</ul>
    </div></section>

    <section className="content-section"><div className="container-shell story-closing">
      <p className="story-number">04</p>
      <h2>A garagem foi apenas o começo. A visão era maior.</h2>
      <p>Hoje, quando olhamos para trás, lembramos daquela garagem. Lembramos dos primeiros passos. Lembramos de quando tudo ainda era pequeno. E entendemos que o tamanho do começo nunca determinou o tamanho do que Deus faria.</p>
      <p>Ainda existem vidas para alcançar, famílias para cuidar, pessoas para discipular, lugares para alcançar e muitas coisas que Deus ainda colocou diante de nós. Por isso, não olhamos apenas para aquilo que já vivemos. Continuamos olhando para frente. Continuamos acreditando. Continuamos servindo. Continuamos dizendo “sim”.</p>
      <p>Porque a Comunidade Cristã Visão Profética não nasceu simplesmente de um projeto humano. Nasceu de um chamado. E se Deus fez tudo isso a partir de uma garagem, nós sabemos que aquilo que Ele ainda pode fazer é muito maior do que aquilo que já conseguimos enxergar.</p>
      <blockquote>
        <p>A história começou pequena.</p>
        <p>O chamado nunca foi pequeno.</p>
        <p>E a história ainda está sendo escrita.</p>
      </blockquote>
    </div></section>

    <section className="content-section bg-white"><div className="container-shell"><p className="eyebrow text-zinc-500">Nossa liderança</p><h2 className="section-title mt-5 max-w-3xl">Pessoas que servem e cuidam.</h2><div className="mt-10 grid gap-0 border-y border-zinc-300 md:grid-cols-3">{["Pastor presidente", "Liderança ministerial", "Liderança de células"].map((item,index) => <article key={item} className={`${index ? "border-t md:border-l md:border-t-0" : ""} border-zinc-300`}><div className="aspect-[4/3] bg-zinc-200"/><div className="p-6"><p className="eyebrow text-zinc-400">{item}</p><h3 className="mt-3 text-xl font-semibold">Nome a confirmar</h3><p className="mt-3 text-sm leading-7 text-zinc-500">A apresentação da liderança será publicada após a confirmação da igreja.</p></div></article>)}</div></div></section>
  </SiteShell>;
}
