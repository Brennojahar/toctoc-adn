import { inicio, jornada, rapida, ranking } from './telas.js';
import { partida } from './jogo.js';
import { parabens, album } from './premios.js';
import { destravar, tocarMusica } from './som.js';
import { IMG } from './util.js';

const tela = document.getElementById('tela');
let limpar = null;

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
// o áudio só é liberado depois do primeiro toque (o iPhone só aceita no fim do toque ou no clique)
['pointerdown', 'touchend', 'click'].forEach(ev => window.addEventListener(ev, destravar, { passive: true }));

// carrega as imagens antes de abrir, para nada piscar no meio da partida
const IMAGENS = [
  'adeneco', 'adeneco-tonto', 'adeneco-festa', 'adeneco-aponta', 'herois', 'caramelo', 'gaia', 'martelo', 'martelo-esq', 'chave',
  'm-juros', 'm-aluguel', 'm-obra', 'm-longe', 'm-apertado',
  'fundo-casa', 'fundo-plantao', 'fundo-obra', 'fundo-decorado', 'fundo-chaves', 'fundo-festa',
  ...['aluguel', 'juros', 'obra', 'apertado', 'longe', 'caramelo', 'gaia', 'adeneco-festa', 'adeneco-aponta'].flatMap(id => [`figurinhas/${id}-mini`, `figurinhas/${id}-bloqueada`]),
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
