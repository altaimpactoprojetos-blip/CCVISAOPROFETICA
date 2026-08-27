import Link from "next/link";
import { ArrowIcon } from "../components/icons";
import { SiteShell } from "../components/SiteShell";

const heroImage = "https://images.unsplash.com/photo-1748180446698-6b0c5af79bd7?auto=format&fit=crop&fm=jpg&q=82&w=2400";

const quickLinks = [
  { title: "Cultos", text: "Confira nossa programação.", href: "/programacao" },
  { title: "Células", text: "Encontre uma célula perto de você.", href: "/celulas" },
  { title: "Cursos", text: "Cresça através do conhecimento da Palavra.", href: "/cursos" },
  { title: "Eventos", text: "Veja o que está acontecendo na Visão Profética.", href: "/eventos" },
];

export default function Home() {
  return (
    <SiteShell>
      <section className="relative min-h-[76vh] overflow-hidden bg-black text-white">
        <img src={heroImage} alt="Pessoas reunidas em um momento de adoração" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.88)_0%,rgba(0,0,0,.48)_58%,rgba(0,0,0,.3)_100%)]" />
        <div className="container-shell relative flex min-h-[76vh] items-end py-14 sm:items-center sm:py-20">
          <div className="max-w-4xl">
            <p className="eyebrow text-zinc-300">Comunidade Cristã Visão Profética</p>
            <h1 className="display-title mt-5 max-w-3xl">Uma igreja para chamar de casa.</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg">
              Um lugar para adorar a Deus, aprender a Palavra e caminhar ao lado de pessoas de verdade.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/fazer-parte" className="btn-light">Quero fazer parte <ArrowIcon className="h-4 w-4"/></Link>
              <Link href="/programacao" className="rounded-sm border border-white/50 px-6 py-4 text-center text-sm font-semibold transition hover:bg-white hover:text-black">Ver programação</Link>
            </div>
          </div>
        </div>
        <p className="absolute bottom-4 right-5 text-[.65rem] text-white/55">Imagem de ambientação; fotos da igreja serão adicionadas em breve.</p>
      </section>

      <section className="border-b border-zinc-200 bg-white py-16">
        <div className="container-shell grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
          <div>
            <p className="eyebrow text-zinc-500">Encontre seu caminho</p>
            <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight tracking-[-.03em]">Por onde você quer começar?</h2>
          </div>
          <div className="border-t border-zinc-300">
            {quickLinks.map((item, index) => {
              return <Link key={item.title} href={item.href} className="group grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-zinc-300 py-5">
                <span className="text-xs text-zinc-400">0{index + 1}</span>
                <span><strong className="block text-base font-semibold">{item.title}</strong><span className="mt-1 block text-sm text-zinc-500">{item.text}</span></span>
                <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1"/>
              </Link>;
            })}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container-shell grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-end">
          <div><p className="eyebrow text-zinc-500">Nossa igreja</p><h2 className="section-title mt-5">Fé se vive em comunhão.</h2></div>
          <div>
            <p className="body-copy max-w-xl">A igreja é feita de encontros: com Deus, com a Palavra e com pessoas. Queremos receber você com simplicidade e caminhar junto em cada nova etapa.</p>
            <p className="mt-5 border-l-2 border-zinc-300 pl-4 text-sm leading-7 text-zinc-500">A história completa e a apresentação da liderança serão publicadas após a validação da igreja.</p>
            <Link href="/quem-somos" className="btn-primary mt-7">Conhecer a igreja <ArrowIcon className="h-4 w-4"/></Link>
          </div>
        </div>
      </section>

      <section className="bg-black py-20 text-white">
        <div className="container-shell">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="eyebrow text-zinc-500">Seu próximo passo</p><h2 className="section-title mt-5">Chegue como você está.</h2></div>
            <p className="max-w-xl text-base leading-8 text-zinc-400 lg:justify-self-end">Você pode começar com uma visita, uma conversa ou uma célula. Não precisa saber tudo antes de chegar.</p>
          </div>
          <div className="mt-14 border-t border-white/25">
            {[
              ["01", "Venha a um culto", "Veja a programação e escolha o melhor dia para sua visita.", "/programacao"],
              ["02", "Conecte-se a uma célula", "Conte seu bairro e nossa equipe ajuda você a encontrar um grupo.", "/celulas"],
              ["03", "Encontre onde servir", "Conheça os ministérios e descubra onde seus dons podem ajudar.", "/ministerios"],
            ].map(([number, title, copy, href]) => (
              <Link key={number} href={href} className="group grid gap-4 border-b border-white/25 py-7 sm:grid-cols-[48px_1fr_1fr_auto] sm:items-center">
                <span className="text-xs text-zinc-600">{number}</span><h3 className="text-xl font-semibold">{title}</h3><p className="text-sm leading-7 text-zinc-500">{copy}</p><ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1"/>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section bg-white">
        <div className="container-shell grid gap-10 border-y border-zinc-300 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="eyebrow text-zinc-500">Vamos conversar?</p><h2 className="section-title mt-4 max-w-3xl">Queremos conhecer você.</h2><p className="body-copy mt-5 max-w-2xl">Se esta é sua primeira visita ou se você quer fazer parte da comunidade, deixe uma mensagem. Alguém da nossa equipe vai falar com você.</p></div>
          <Link href="/fazer-parte" className="btn-primary">Falar com a equipe <ArrowIcon className="h-4 w-4"/></Link>
        </div>
      </section>
    </SiteShell>
  );
}
