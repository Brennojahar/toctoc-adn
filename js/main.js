import { inicio, jornada, rapida, ranking } from './telas.js';
import { partida } from './jogo.js';
import { parabens, album } from './premios.js';
import { cadastro, precisaCadastro, guardarOrigem, enviarLead, enviarIndicacoes } from './cadastro.js';
import { destravar, tocarMusica } from './som.js';
import { IMG } from './util.js';
import { MONSTROS, FIGURINHAS } from './dados.js';
import { ligarBlack } from './black.js';
import { ligarNatal, natalAtivo, IMAGENS_NATAL } from './natal.js';

ligarNatal(); // Natal ADN: troca as artes e veste as telas (vem antes de tudo, porque muda as imagens que serão carregadas)
ligarBlack(); // Black Friday ADN: de 09 a 26/11 o jogo veste o tema da campanha

const tela = document.getElementById('tela');
let limpar = null;

// Para jogar, antes vem o cadastro (uma vez por aparelho). Início, ranking e figurinhas ficam abertos.
const PEDE_CADASTRO = /^#\/(jornada|rapida|partida)\b/;
let depoisDoCadastro = '#/';

const ir = destino => {
  if (location.hash === destino) render();
  else location.hash = destino;
};

const ROTAS = [
  [/^#\/?$/, () => inicio(tela, { ir })],
  [/^#\/jornada(?:\/(\d+))?$/, m => jornada(tela, { ir, abrir: m[1] ? Number(m[1]) : 0 })],
  [/^#\/rapida$/, () => rapida(tela, { ir })],
  [/^#\/ranking$/, () => ranking(tela, { ir })],
  [/^#\/figurinhas$/, () => album(tela, { ir })],
  [/^#\/parabens\/(\d)$/, m => parabens(tela, { ir, k: Number(m[1]) })],
  [/^#\/cadastro$/, () => cadastro(tela, { ir, depois: () => depoisDoCadastro })],
  [/^#\/partida\/(rapida|\d+)(?:\/([a-z,]+))?(?:\?.*)?$/, m => partida(tela, {
    fase: m[1] === 'rapida' ? 'rapida' : Number(m[1]),
    ajudas: m[2] ? m[2].split(',') : [],
    ir,
  })],
];

function render() {
  if (typeof limpar === 'function') limpar();
  limpar = null;
  tela.replaceChildren();
  const hash = location.hash || '#/';
  if (PEDE_CADASTRO.test(hash) && precisaCadastro()) {
    depoisDoCadastro = hash;
    location.replace('#/cadastro');
    return;
  }
  for (const [re, fn] of ROTAS) {
    const m = hash.match(re);
    if (!m) continue;
    limpar = fn(m);
    // fora da partida toca a música do menu (a partida cuida da dela)
    if (!hash.startsWith('#/partida')) tocarMusica('menu');
    return;
  }
  location.hash = '#/';
}

window.addEventListener('hashchange', render);
guardarOrigem();
enviarLead(); // um cadastro que ficou sem internet vai agora
enviarIndicacoes(); // e as indicações que ficaram esperando
// o áudio só é liberado depois do primeiro toque (o iPhone só aceita no fim do toque ou no clique)
['pointerdown', 'touchend', 'click'].forEach(ev => window.addEventListener(ev, destravar, { passive: true }));

// carrega as imagens antes de abrir, para nada piscar no meio da partida
const IMAGENS = [
  'adeneco', 'adeneco-tonto', 'adeneco-festa', 'adeneco-aponta', 'tijolo', 'gaia', 'martelo', 'martelo-esq', 'chave', 'logo-adn-branco',
  ...Object.keys(MONSTROS).flatMap(id => [`m-${id}`, `m-${id}-sai`, `m-${id}-tonto`]),
  ...(natalAtivo() ? IMAGENS_NATAL : []),
  'capa', 'logo-3d', 'fundo-casa', 'fundo-plantao', 'fundo-obra', 'fundo-decorado', 'fundo-chaves', 'fundo-festa',
  ...Object.keys(FIGURINHAS).flatMap(id => [`figurinhas/${id}-mini`, `figurinhas/${id}-bloqueada`]),
];
const cache = [];
let prontas = 0;
const carregar = nome => new Promise(ok => {
  const i = new Image();
  i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(ok) : ok());
  i.src = IMG(nome);
  cache.push(i);
}).then(() => {
  prontas += 1;
  barra.style.setProperty('--p', `${Math.round(6 + 94 * prontas / IMAGENS.length)}%`);
});

// A capa de carregamento: a arte nova, o logo do jogo em 3D e a barra, que anda conforme as imagens chegam.
// Ela fica pelo menos 2,2 s na tela, para dar tempo de ver; se a internet estiver lenta, o jogo abre em 6 s de qualquer jeito.
const TEMPO_DA_CAPA = 2200;
const capa = document.createElement('div');
capa.className = 'carregando';
capa.innerHTML = `<img class="carga-fundo" src="${IMG('capa-loading')}" alt=""><i class="carga-veu"></i>
  <img class="carga-logo" src="${IMG('logo-3d')}" alt="Toc Toc, Adeneco!">
  <div class="carga-rodape"><div class="txt">Carregando…</div><div class="barra"><i><b></b></i></div></div>
  <img class="carga-adn" src="${IMG('logo-adn-branco')}" alt="ADN Construtora">`;
const barra = capa.querySelector('.barra b');
tela.append(capa);
const espera = ms => new Promise(ok => setTimeout(ok, ms));
Promise.all([Promise.race([Promise.all(IMAGENS.map(carregar)), espera(6000)]), espera(TEMPO_DA_CAPA)]).then(() => {
  barra.style.setProperty('--p', '100%');
  render();
  tela.append(capa);
  setTimeout(() => {
    capa.style.opacity = '0';
    setTimeout(() => capa.remove(), 420);
  }, 260);
});
