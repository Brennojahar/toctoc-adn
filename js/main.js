import { inicio, jornada, rapida, ranking } from './telas.js';
import { partida } from './jogo.js';
import { parabens, album } from './premios.js';
import { cadastro, precisaCadastro, guardarOrigem, enviarLead, enviarIndicacoes } from './cadastro.js';
import { destravar, tocarMusica } from './som.js';
import { IMG } from './util.js';
import { MONSTROS, FIGURINHAS } from './dados.js';
import { ligarBlack } from './black.js';

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
  ...Object.keys(MONSTROS).map(id => `m-${id}`),
  'capa', 'fundo-casa', 'fundo-plantao', 'fundo-obra', 'fundo-decorado', 'fundo-chaves', 'fundo-festa',
  ...Object.keys(FIGURINHAS).flatMap(id => [`figurinhas/${id}-mini`, `figurinhas/${id}-bloqueada`]),
];
const cache = [];
const carregar = nome => new Promise(ok => {
  const i = new Image();
  i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(ok) : ok());
  i.src = IMG(nome);
  cache.push(i);
});

const capa = document.createElement('div');
capa.className = 'carregando';
capa.textContent = 'Toc toc…';
tela.append(capa);
Promise.race([Promise.all(IMAGENS.map(carregar)), new Promise(ok => setTimeout(ok, 6000))]).then(() => {
  render();
  tela.append(capa);
  void capa.offsetWidth;
  capa.style.opacity = '0';
  setTimeout(() => capa.remove(), 320);
});
