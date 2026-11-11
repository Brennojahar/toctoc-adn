// Elenco, cenários, etapas da jornada e regras de cada fase.

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
  // os engraçados (pedido da ADN em 10/11/2026)
  sogra: {
    nome: 'Casa da Sogra', vence: 'Casa própria',
    atrapalha: 'Tem regra pra tudo: hora de chegar, jeito de lavar a louça e até o canal da TV.',
    ajuda: 'No seu apê ADN, a casa é sua e as regras também. A sogra vem só de visita.',
  },
  banheiro: {
    nome: 'Fila do Banheiro', vence: 'Banheiro só seu',
    atrapalha: 'Um banheiro só para a família inteira, e sempre tem alguém lá dentro.',
    ajuda: 'No seu apê, o banheiro é da sua família. E sem fila de manhã.',
  },
  solteiro: {
    nome: 'Quarto de Solteiro', vence: 'Dois dormitórios',
    atrapalha: 'Você cresceu, mas a cama continua de solteiro e o pôster da adolescência continua na parede.',
    ajuda: 'Com dois dormitórios, dá para ter o seu quarto e ainda sobrar um para o que vier.',
  },
  goteira: {
    nome: 'Goteira', vence: 'Apê novinho',
    atrapalha: 'Toda chuva é a mesma coisa: balde no chão, pingo na cama, e o dono da casa nunca vem arrumar.',
    ajuda: 'Apê novo, com o selo de qualidade PBQP-H nível A: a chuva fica do lado de fora.',
  },
  cunhado: {
    nome: 'Cunhado Folgado', vence: 'Seu cantinho',
    atrapalha: 'Veio passar uma semana e já faz um ano. Dorme no sofá, come a última fatia e ainda pega o controle.',
    ajuda: 'No seu apê, visita é sempre bem-vinda. E tem hora para ir embora.',
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
  tijolo: {
    nome: 'Tijolo', papel: 'O malandro do condomínio',
    quem: 'O vira-lata caramelo mais folgado do pedaço. Descobriu o pet place e agora jura que o lugar é dele.',
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

// Os 6 cenários da jornada, na ordem: cada fase acontece em um.
// `monstros`: quem aparece ali. `anel` é a borda do buraco (o chão cortado) e `borda` o tom escuro logo dentro dele.
export const CENARIOS = [
  { id: 'casa',     nome: 'Casa alugada',        monstros: ['aluguel', 'goteira'],            anel: '#937462', borda: '#43342b' },
  { id: 'plantao',  nome: 'Plantão de vendas',   monstros: ['juros', 'solteiro', 'sogra'],    anel: '#e5d2c0', borda: '#6b6259' },
  { id: 'obra',     nome: 'Canteiro de obras',   monstros: ['juros', 'obra', 'banheiro'],     anel: '#d38653', borda: '#633d24' },
  { id: 'decorado', nome: 'Apê decorado',        monstros: ['apertado', 'longe', 'banheiro'], anel: '#b8997d', borda: '#554638' },
  { id: 'chaves',   nome: 'Entrega das chaves',  monstros: ['obra', 'longe', 'apertado', 'cunhado'], anel: '#876e64', borda: '#3d312c' },
  { id: 'festa',    nome: 'Festa no condomínio', monstros: ['juros', 'aluguel', 'obra', 'longe', 'apertado', 'sogra', 'banheiro', 'solteiro', 'goteira', 'cunhado'], anel: '#dfcab7', borda: '#695e55' },
];

// A jornada do primeiro apê: 3 etapas, 2 fases em cada (pedido do Breno em 11/11/2026).
// Eram 6 etapas e 12 fases, muito para chegar ao fim. Cada etapa de agora junta duas das antigas:
// os dois cenários (um por fase), os monstrinhos e os prêmios delas.
// `premio`: as figurinhas que a etapa dá ao ser concluída. `desconto`: a etapa também dá os R$ 5 mil (depois das indicações).
// `parabens`: a página de parabéns da etapa. Nomes e textos de rascunho: a ADN aprova antes de publicar.
export const ETAPAS = [
  { nome: 'Adeus, aluguel', sub: 'Da casa alugada ao plantão de vendas',
    premio: ['aluguel', 'goteira', 'sogra', 'juros', 'solteiro', 'banheiro'],
    parabens: { tit: 'Você deu adeus ao aluguel!',
      texto: 'Chega de pagar o apê dos outros. Você saiu da casa alugada, passou no plantão de vendas e, com um corretor da ADN do seu lado, o seu primeiro apê já está no papel.' } },
  { nome: 'Apê a caminho', sub: 'Do canteiro de obras ao decorado',
    premio: ['tijolo', 'obra', 'cunhado', 'gaia', 'apertado', 'longe'],
    parabens: { tit: 'O seu apê está saindo do chão!',
      texto: 'Tijolo por tijolo, a obra anda firme, com o selo de qualidade PBQP-H nível A. E no decorado você já viu cada cantinho: planta inteligente, ambientes integrados e varanda gourmet.' } },
  { nome: 'Chave na mão', sub: 'Da entrega das chaves à festa no condomínio',
    premio: ['adeneco-festa', 'adeneco-aponta'], desconto: true,
    parabens: { tit: 'Você concluiu a jornada!',
      texto: 'Do aluguel até a festa com os vizinhos, você venceu todos os monstrinhos. A chave é sua, e agora o prêmio é de verdade: R$ 5 mil de desconto no seu apê ADN.' } },
];

// Figurinhas para o WhatsApp: PNG 1024 × 1024 com fundo transparente em a/figurinhas/<id>.png
export const FIGURINHAS = {
  aluguel: 'Aluguel',
  goteira: 'Goteira',
  sogra: 'Casa da Sogra',
  juros: 'Juros',
  solteiro: 'Quarto de Solteiro',
  banheiro: 'Fila do Banheiro',
  tijolo: 'Tijolo',
  obra: 'Obra Atrasada',
  cunhado: 'Cunhado Folgado',
  gaia: 'Gaia',
  apertado: 'Apê Apertado',
  longe: 'Longe de Tudo',
  'adeneco-festa': 'Adeneco comemorando',
  'adeneco-aponta': 'Adeneco: mandou bem!',
};

// Cadastro na entrada (captação de leads, js/cadastro.js): o que se pergunta antes da primeira partida.
// Os aceites repetem os do formulário do site da ADN, com o "18 anos ou mais" a mais. Rascunho: o jurídico da ADN aprova.
// O banco recebe o valor da esquerda de cada opção; a ADN pode trocar as faixas e as opções aqui.
export const CADASTRO = {
  politica: 'https://adnconstrutora.com.br/politicas/',
  aviso: 'Versão de demonstração: os dados ficam numa tabela de teste e são apagados.',
  // as cidades com empreendimento no site da ADN (conferido em 28/10/2026)
  cidades: ['Araraquara', 'Araras', 'Campinas', 'Catanduva', 'Franca', 'Hortolândia', 'Ourinhos', 'Piracicaba',
    'Ribeirão Preto', 'Rio Claro', "Santa Bárbara d'Oeste", 'São Carlos', 'São José do Rio Preto', 'Sorocaba'],
  perguntas: [
    { id: 'moradia', titulo: 'Onde você mora hoje?', opcoes: [['aluguel', 'De aluguel'], ['familia', 'Com a família'], ['propria', 'Em casa própria']] },
    // as faixas do formulário "Fale com um corretor" do site da ADN (conferidas em 10/11/2026)
    { id: 'renda', titulo: 'Renda da família por mês', opcoes: [['ate-2800', 'Até R$ 2.800'], ['2800-3200', 'R$ 2.800 a 3.200'], ['3200-5000', 'R$ 3.200 a 5.000'], ['5000-9600', 'R$ 5.000 a 9.600'], ['9600-mais', 'Acima de R$ 9.600']] },
    { id: 'fgts', titulo: 'Tem FGTS para usar?', opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['nao-sei', 'Não sei']] },
    { id: 'prazo', titulo: 'Quando pensa em comprar?', opcoes: [['agora', 'Agora'], ['6-meses', 'Em até 6 meses'], ['1-ano', 'Em até 1 ano'], ['pesquisando', 'Só pesquisando']] },
  ],
};

// Quem termina o jogo fala com este número (DDI + DDD + número, só dígitos).
// É o WhatsApp de vendas do site da ADN, (16) 99963-6497: o do topo e o do botão flutuante (conferido em 28/10/2026).
// Vazio, o WhatsApp abre com a mensagem pronta e pede para escolher o contato.
export const WHATSAPP_CORRETOR = '5516999636497';
// O prêmio final (pedido da ADN em 10/11/2026). As condições do desconto ficam com o corretor.
export const DESCONTO = 'R$ 5 mil';
export const mensagemCorretor = (codigo, indicados = 0) =>
  `Oi! Acabei de concluir o jogo Toc Toc, Adeneco! e ganhei ${DESCONTO} de desconto no meu apê. Meu código é ${codigo}.`
  + (indicados ? ` Também indiquei ${indicados === 1 ? 'um amigo' : `${indicados} amigos`} no jogo.` : '');

// Antes do desconto, a pessoa pode indicar até 3 amigos (js/premios.js, supabase/indicacoes.sql). É opcional.
export const MAX_INDICACOES = 3;

export const FASES_POR_ETAPA = 2;
export const TOTAL_FASES = ETAPAS.length * FASES_POR_ETAPA;

// o cenário de cada fase: a fase 1 é o primeiro, a 2 o segundo, e assim até a última
export const cenarioDaFase = n => CENARIOS[Math.min(CENARIOS.length - 1, Math.max(0, n - 1))];
// número da etapa (1 a 3) e as fases dela
export const numEtapa = n => Math.min(ETAPAS.length, Math.floor((n - 1) / FASES_POR_ETAPA) + 1);
export const fasesDaEtapa = k => Array.from({ length: FASES_POR_ETAPA }, (_, j) => (k - 1) * FASES_POR_ETAPA + j + 1);

// A velocidade vai de 1 a 30 e a meta de 9 a 20 ao longo da jornada, seja qual for o número de fases:
// com 6 fases, cada uma tem a velocidade e a meta que as fases pares (2, 4, ... 12) tinham na jornada de 12.
// A partida rápida fica no meio (15), com todos os monstrinhos.
export function configFase(n, rapida = false) {
  const nivel = rapida ? 15 : Math.round((n * 30) / TOTAL_FASES);
  return {
    n,
    rapida,
    meta: rapida ? 0 : 7 + Math.round((n * 13.2) / TOTAL_FASES),
    tempo: rapida ? 60 : 15,
    monstros: rapida ? Object.keys(MONSTROS) : [...cenarioDaFase(n).monstros],
    ritmo: Math.max(420, 900 - nivel * 16), // ms entre uma leva de aparições e a próxima
    vivo: Math.max(650, 1300 - nivel * 22), // ms que cada um fica fora do buraco
  };
}

export const estrelas = (acertos, meta) => (acertos >= meta * 1.6 ? 3 : acertos >= meta * 1.3 ? 2 : acertos >= meta ? 1 : 0);

export const AJUDAS = [
  { id: 'tempo',   nome: '+5 segundos',     img: 'relogio', desc: 'A partida dura 5 segundos a mais' },
  { id: 'martelo', nome: 'Martelo duplo',   img: 'martelo', desc: 'Pontos em dobro nos primeiros 10 segundos' },
  { id: 'ouro',    nome: 'Mais Tijolo',     img: 'tijolo', desc: 'O Tijolo dourado aparece mais vezes' },
];

export const COMBOS = {
  3: ['Combo!', '3 seguidos'],
  5: ['x2 pontos!', '5 seguidos'],
  10: ['Pegando fogo!', 'x3 pontos'],
  15: ['Imparável!', '15 seguidos'],
  20: ['Lendário!', '20 seguidos'],
  30: ['Mestre de obras!', '30 seguidos'],
};

