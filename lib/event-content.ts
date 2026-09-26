export type EventContent = {
  about: string[];
  closing?: string;
  registrationTitle?: string;
  registrationText?: string;
};

const contents: {match: RegExp; content: EventContent}[] = [
  {
    match: /mulher/i,
    content: {
      about: [
        "Todos os anos, a Comunidade Cristã Visão Profética reúne mulheres de diferentes lugares para viver um tempo especial na presença de Deus. Mulheres que chegam de perto e de longe, com histórias diferentes, mas com o mesmo desejo: ouvir a voz do Senhor, ser fortalecidas e viver aquilo que Ele preparou para este tempo.",
        "A cada edição, somos conduzidas por uma mensagem específica que nasce no coração de Deus e aponta para aquilo que Ele deseja gerar em nós. E desta vez não será diferente.",
        "Estamos preparando um encontro marcado por oração, adoração, Palavra e um mover profético, onde mulheres serão chamadas a ampliar sua visão, reconhecer o propósito de Deus para suas vidas e se posicionar diante daquilo que o Senhor está fazendo.",
        "Será um tempo para sair do lugar comum, romper limites e permitir que Deus amplie nossa visão para enxergarmos além das circunstâncias, além do que já vivemos e além do que nossos olhos conseguem alcançar.",
        "Se você sente que Deus está chamando você para um novo tempo, este encontro é para você.",
      ],
      closing: "Prepare-se. Amplie a sua visão. Existe uma mensagem para este tempo.",
    },
  },
  {
    match: /batism/i,
    content: {
      about: [
        "O batismo nas águas é a declaração pública de uma decisão que já aconteceu no coração: seguir a Jesus. É o momento de testemunhar diante da igreja, da família e dos amigos que o velho ficou para trás e que uma nova vida começou.",
        "Neste culto especial, vamos celebrar juntos cada pessoa que decidiu dar esse passo de fé. Será uma noite de adoração, Palavra e alegria, marcada pelo testemunho de vidas transformadas.",
        "Se você já entregou sua vida a Cristo e deseja se batizar, faça sua inscrição. A equipe entrará em contato para orientar sobre o preparo e os detalhes da celebração. Se você vem prestigiar alguém, será uma alegria receber você e sua família.",
      ],
      closing: "Novas águas, novo eu.",
      registrationTitle: "Quero me batizar",
      registrationText: "Preencha seus dados abaixo. A confirmação aparece na hora, e a equipe vai entrar em contato pelo WhatsApp ou e-mail informado para orientar sobre o preparo.",
    },
  },
];

export function eventContent(name: string): EventContent | null {
  return contents.find(item => item.match.test(name))?.content ?? null;
}
