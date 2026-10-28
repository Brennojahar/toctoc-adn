// Elenco, etapas da jornada e regras de cada fase.

// `atrapalha` e `ajuda` aparecem no card de cada monstrinho. Textos de rascunho: a ADN aprova antes de publicar.
export const MONSTROS = {
  juros: {
    nome: 'Juros', vence: 'Ajuda no financiamento',
    atrapalha: 'Faz a parcela crescer e deixa o sonho com cara de impossível.',
    ajuda: 'Com o Minha Casa, Minha Vida e um corretor da ADN do seu lado, o financiamento fica simples de entender.',
  },
  aluguel: {
    nome: 'Aluguel', vence: 'O primeiro apê',
    atrapalha: 'Todo mês ele volta, e o dinheiro vai embora sem virar nada seu.',
    ajuda: 'A ADN te ajuda a sair do aluguel e conquistar o seu primeiro apê.',
  },
  obra: {
    nome: 'Obra Atrasada', vence: '+8 mil apês entregues',
    atrapalha: 'Comprar na planta e não saber quando a chave chega tira o sono de qualquer um.',
    ajuda: 'A ADN já entregou mais de 8 mil apartamentos e tem o selo de qualidade PBQP-H nível A.',
  },
  longe: {
    nome: 'Longe de Tudo', vence: 'Localização estratégica',
    atrapalha: 'Apê longe de tudo cobra caro em tempo e em condução.',
    ajuda: 'Os empreendimentos da ADN ficam em localização estratégica, perto de comércio e serviços.',
  },
  apertado: {
    nome: 'Apê Apertado', vence: 'Planta inteligente',
    atrapalha: 'Espaço mal aproveitado aperta a rotina da família inteira.',
    ajuda: 'As plantas da ADN aproveitam cada metro, com ambientes integrados e varanda gourmet.',
  },
};

// Os heróis: o card de cada um na tela inicial.
export const HEROIS = {
  adeneco: {
    nome: 'Adeneco', papel: 'O mascote da ADN',
    quem: 'O vizinho gente boa que entende de apê. Ele está aqui para te ajudar a conquistar a casa própria.',
    blocoTit: 'Sobre a ADN',
    bloco: 'A ADN nasceu para transformar vidas e realizar sonhos: são mais de 8 mil lares entregues no interior de São Paulo, com lazer completo e o melhor custo-benefício.',
    jogo: 'Ele está do seu lado. Não vale martelar!',
  },
  caramelo: {
    nome: 'Caramelo', papel: 'O malandro do condomínio',
    quem: 'O vira-lata mais folgado do pedaço. Descobriu o pet place e agora jura que o lugar é dele.',
    blocoTit: 'No jogo',
    bloco: 'Quando ele aparecer com a chave na boca, puxe pra cima: o latido espanta os monstrinhos e seus pontos dobram.',
    jogo: 'Cachorro não se martela, se puxa!',
  },
  gaia: {
    nome: 'Gaia', papel: 'A que já viu de tudo',
    quem: 'Já visitou muito apartamento na vida e quase nada impressiona. Olha localização, lazer e custo-benefício, e só depois dá o veredito.',
    blocoTit: 'No jogo',
    bloco: 'É super rara. Se aparecer, puxe pra cima: ela diz "Aprovado." e o relógio para.',
    jogo: 'Ela não se empolga. Mas aprova.',
  },
};

// A jornada do primeiro apê: 6 etapas, 2 fases em cada.
// `anel` é a borda do buraco (o chão cortado) e `borda` o tom escuro logo dentro dele.
// `premio`: as figurinhas que a etapa dá ao ser concluída ('condicao' na última: a condição especial com o corretor).
// `parabens`: a página de parabéns da etapa. Textos de rascunho: a ADN aprova antes de publicar.
export const ETAPAS = [
  { id: 'casa',     nome: 'Casa alugada',        sub: 'Onde tudo começa',          monstros: ['aluguel'],
    anel: '#b47b47', borda: '#53371e', premio: ['aluguel', 'juros'],
    parabens: { tit: 'Você saiu da casa alugada!',
      texto: 'Chega de pagar o apê dos outros. Aluguel é dinheiro que vai embora todo mês, e a ADN está aqui para te ajudar a trocar isso por um lar para chamar de seu.' } },
  { id: 'plantao',  nome: 'Plantão de vendas',   sub: 'Hora de conhecer o apê',    monstros: ['aluguel', 'juros'],
    anel: '#e9e2da', borda: '#6f6a66', premio: ['obra', 'apertado', 'longe'],
    parabens: { tit: 'Você saiu do plantão de vendas!',
      texto: 'E agora está rumo à sua nova casa. Com um corretor da ADN do seu lado, cada passo do financiamento fica claro, e o seu sonho sai do plantão já no papel.' } },
  { id: 'obra',     nome: 'Canteiro de obras',   sub: 'Subindo tijolo por tijolo', monstros: ['juros', 'obra'],
    anel: '#f0b463', borda: '#7d582a', premio: ['caramelo'],
    parabens: { tit: 'A sua obra começou a todo vapor!',
      texto: 'Tijolo por tijolo, o seu apê está saindo do chão. A ADN constrói com o selo de qualidade PBQP-H nível A, para a obra andar firme até a entrega.' } },
  { id: 'decorado', nome: 'Apê decorado',        sub: 'Visita ao decorado',        monstros: ['apertado', 'longe'],
    anel: '#f3c68c', borda: '#7d603d', premio: ['gaia'],
    parabens: { tit: 'Você já conhece o seu apê!',
      texto: 'No decorado dá para ver cada cantinho: planta inteligente, ambientes integrados e varanda gourmet. Agora é só escolher onde vai ficar o sofá.' } },
  { id: 'chaves',   nome: 'Entrega das chaves',  sub: 'O apê é seu',               monstros: ['obra', 'longe', 'apertado'],
    anel: '#f1d3ae', borda: '#78644d', premio: ['adeneco-festa', 'adeneco-aponta'],
    parabens: { tit: 'A chave é sua!',
      texto: 'Esse é o dia que a família inteira espera. A ADN já entregou mais de 8 mil apês, e agora chegou a sua vez de abrir a porta.' } },
  { id: 'festa',    nome: 'Festa no condomínio', sub: 'Lazer completo',            monstros: ['juros', 'aluguel', 'obra', 'longe', 'apertado'],
    anel: '#7b5531', borda: '#2e1d0f', premio: 'condicao',
    parabens: { tit: 'Você concluiu a jornada!',
      texto: 'Do aluguel até a festa com os vizinhos, você venceu todos os monstrinhos. Agora o prêmio é de verdade: fale com um dos nossos corretores e ganhe uma condição especial.' } },
];

// Figurinhas para o WhatsApp: PNG 1024 × 1024 com fundo transparente em a/figurinhas/<id>.png
export const FIGURINHAS = {
  aluguel: 'Aluguel',
  juros: 'Juros',
  obra: 'Obra Atrasada',
  apertado: 'Apê Apertado',
  longe: 'Longe de Tudo',
  caramelo: 'Caramelo',
  gaia: 'Gaia',
  'adeneco-festa': 'Adeneco comemorando',
  'adeneco-aponta': 'Adeneco: mandou bem!',
};

// Quem termina o jogo fala com este número (DDI + DDD + número, só dígitos).
// É o WhatsApp de vendas do site da ADN, (16) 99963-6497: o do topo e o do botão flutuante (conferido em 28/10/2026).
// Vazio, o WhatsApp abre com a mensagem pronta e pede para escolher o contato.
export const WHATSAPP_CORRETOR = '5516999636497';
export const mensagemCorretor = codigo =>
  `Oi! Acabei de concluir o jogo Toc Toc, Adeneco! e desbloqueei a minha condição especial. Meu código é ${codigo}.`;

export const FASES_POR_ETAPA = 2;
export const TOTAL_FASES = ETAPAS.length * FASES_POR_ETAPA;

export const etapaDaFase = n => ETAPAS[Math.min(ETAPAS.length - 1, Math.floor((n - 1) / FASES_POR_ETAPA))];
// número da etapa (1 a 6) e as fases dela
export const numEtapa = n => Math.min(ETAPAS.length, Math.floor((n - 1) / FASES_POR_ETAPA) + 1);
export const fasesDaEtapa = k => Array.from({ length: FASES_POR_ETAPA }, (_, j) => (k - 1) * FASES_POR_ETAPA + j + 1);

// A velocidade vai de 1 a 30 ao longo da jornada; a partida rápida fica no meio (15), com todos os monstrinhos.
export function configFase(n, rapida = false) {
  const nivel = rapida ? 15 : Math.round((n * 30) / TOTAL_FASES);
  return {
    n,
    rapida,
    meta: rapida ? 0 : 7 + Math.round(n * 1.1),
    tempo: rapida ? 60 : 15,
    monstros: rapida ? Object.keys(MONSTROS) : [...etapaDaFase(n).monstros],
    ritmo: Math.max(420, 900 - nivel * 16), // ms entre uma leva de aparições e a próxima
    vivo: Math.max(650, 1300 - nivel * 22), // ms que cada um fica fora do buraco
  };
}

export const estrelas = (acertos, meta) => (acertos >= meta * 1.6 ? 3 : acertos >= meta * 1.3 ? 2 : acertos >= meta ? 1 : 0);

export const AJUDAS = [
  { id: 'tempo',   nome: '+5 segundos',     img: 'relogio', desc: 'A partida dura 5 segundos a mais' },
  { id: 'martelo', nome: 'Martelo duplo',   img: 'martelo', desc: 'Pontos em dobro nos primeiros 10 segundos' },
  { id: 'ouro',    nome: 'Mais Caramelo',   img: 'caramelo', desc: 'O Caramelo dourado aparece mais vezes' },
];

export const COMBOS = {
  3: ['Combo!', '3 seguidos'],
  5: ['x2 pontos!', '5 seguidos'],
  10: ['Pegando fogo!', 'x3 pontos'],
  15: ['Imparável!', '15 seguidos'],
  20: ['Lendário!', '20 seguidos'],
  30: ['Mestre de obras!', '30 seguidos'],
};

