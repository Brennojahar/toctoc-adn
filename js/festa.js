// Peças do visual novo (publicado em 24/11/2026): o painel azul com aro dourado, as estrelas, o confete das laterais,
// os fogos e a vinheta de vitória (estouro, fogos e o logo do jogo crescendo antes do pop-up).
import { el, img, botao } from './util.js';
import { efeito } from './som.js';

const ESTRELA = 'M50 6l13.2 27.4 30 4.3-21.7 21 5.2 29.8L50 74.4 23.3 88.5l5.2-29.8L6.800 37.700l30-4.300z';
// os degradês das estrelas ficam num SVG escondido, uma vez só na página
function defs() {
  if (document.getElementById('v-defs')) return;
  document.body.insertAdjacentHTML('beforeend', `<svg id="v-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="g-ouro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset=".5" stop-color="#ffd200"/><stop offset="1" stop-color="#f39a00"/></linearGradient>
    <linearGradient id="g-apagada" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6fd0"/><stop offset="1" stop-color="#0d3f9a"/></linearGradient>
  </defs></svg>`);
}
const SVG_APAGADA = `<svg viewBox="0 0 100 100"><path d="${ESTRELA}" fill="url(#g-apagada)" stroke="#062a6a" stroke-width="6" stroke-linejoin="round"/></svg>`;
const SVG_OURO = `<svg class="ouro" viewBox="0 0 100 100"><path d="${ESTRELA}" fill="url(#g-ouro)" stroke="#8a4a00" stroke-width="6" stroke-linejoin="round"/><path d="M50 18l8.5 18.5 19 2.5" fill="none" stroke="#fffbd6" stroke-width="5" stroke-linecap="round" opacity=".9"/></svg>`;
const SVG_X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>';

// Três estrelas: as apagadas já estão lá, as ganhas caem por cima uma de cada vez (o atraso está no visual.css).
export function estrelas(n) {
  defs();
  return el('div', { class: 'estrelas' }, [1, 2, 3].map(k => {
    const e = el('span', { class: 'estrela' + (k <= n ? ' on' : ''), html: SVG_APAGADA + (k <= n ? SVG_OURO : '') });
    e.style.setProperty('--k', k);
    return e;
  }));
}

// Brilhinhos que piscam em volta do prêmio.
export function brilhos(pontos) {
  return pontos.map(([x, y, escala = 1], i) => {
    const b = el('i', { class: 'brilho' });
    b.style.cssText = `left:${x}%;top:${y}%;scale:${escala};animation-delay:${(i * -0.55).toFixed(2)}s`;
    return b;
  });
}

// O painel: faixa do título vazando por cima, X vermelho no canto, raios de luz atrás do conteúdo.
// `heroi`: o personagem que fica por cima do painel. `foco`: a altura dos raios dentro do painel (ex.: '30%').
export function painel({ faixa, aoFechar, heroi, raios = true, foco, classe = '' }, filhos) {
  const dentro = el('div', { class: 'painel-dentro' }, [
    raios ? el('i', { class: 'raios' }) : null,
    raios ? el('i', { class: 'clarao' }) : null,
    ...filhos,
  ]);
  if (foco) dentro.style.setProperty('--foco', foco);
  const p = el('div', { class: 'painel' }, [
    faixa ? el('div', { class: 'faixa' }, [el('div', {}, [el('span', { class: 'txt', text: faixa })])]) : null,
    dentro,
  ]);
  if (aoFechar) {
    const x = botao([], 'redondo painel-x', aoFechar, 'Fechar');
    x.innerHTML = SVG_X;
    p.append(x);
  }
  const pop = el('div', { class: 'popup' + (heroi ? ' com-heroi' : '') + (classe ? ' ' + classe : '') }, [heroi, p]);
  pop.addEventListener('click', ev => ev.stopPropagation());
  return pop;
}

// O véu escuro com o pop-up no centro. `fundo: false` quando a vinheta de vitória já escureceu a tela.
export function veuCentro(pop, { fundo = true, aoFundo } = {}) {
  const v = el('div', { class: 'veu centro' + (fundo ? '' : ' sem-fundo') }, [pop]);
  if (aoFundo) v.addEventListener('click', aoFundo);
  return v;
}

const CORES = ['#ffd200', '#38b2e8', '#ffffff', '#ff5d5d', '#7dea4a', '#ff9f1c'];
const semMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Confete que sai das duas laterais, sobe em arco para o meio e cai.
export function confeteLados(onde, n = 26, forca = 1) {
  if (semMovimento()) return;
  const L = onde.clientWidth;
  const A = onde.clientHeight;
  const c = el('div', { class: 'conf-lado', 'aria-hidden': 'true' });
  for (let i = 0; i < n; i++) {
    const esq = i % 2 === 0;
    const p = el('i');
    const dx = (esq ? 1 : -1) * L * (0.14 + Math.random() * 0.42) * forca;
    const sobe = A * (0.16 + Math.random() * 0.3) * forca;
    const giro = Math.random() * 720 - 360;
    p.style.cssText = `left:${esq ? -10 : L}px;top:${(A * (0.52 + Math.random() * 0.26)).toFixed(0)}px;background:${CORES[i % CORES.length]};scale:${(0.6 + Math.random() * 0.7).toFixed(2)};opacity:0`;
    p.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(.15, .7, .3, 1)' },
      { transform: `translate(${dx}px, ${-sobe}px) rotate(${giro}deg)`, opacity: 1, offset: 0.45, easing: 'cubic-bezier(.5, 0, .9, .5)' },
      { transform: `translate(${dx * 1.25}px, ${A * 0.3}px) rotate(${giro * 2}deg)`, opacity: 0 },
    ], { duration: 1100 + Math.random() * 700, delay: Math.random() * 140 });
    c.append(p);
  }
  onde.append(c);
  setTimeout(() => c.remove(), 2300);
}

// Um fogo de artifício: clarão no centro e as faíscas abrindo em roda. x e y em % da tela.
export function fogo(onde, x, y, cor) {
  if (semMovimento()) return;
  const f = el('div', { class: 'fogo' });
  f.style.cssText = `left:${x}%;top:${y}%;--c:${cor}`;
  const n = 16;
  for (let k = 0; k < n; k++) {
    const p = el('i');
    p.style.cssText = `--a:${(k * 360 / n + Math.random() * 10).toFixed(0)}deg;--d:${(58 + Math.random() * 54).toFixed(0)}px;${k % 4 ? '' : '--c:#fff'}`;
    f.append(p);
  }
  onde.append(f);
  setTimeout(() => f.remove(), 1200);
  efeito('fogo');
}

// A vinheta de vitória: estouro e confete, a tela escurece, fogos, e o logo do jogo cresce no centro.
// Uns 2,5 s depois (ou num toque, para quem tem pressa) chama `pronto`, que abre o pop-up. A camada escura fica de fundo.
export function vitoria(pagina, { depois, pronto }) {
  const cam = el('div', { class: 'vit', 'aria-hidden': 'true' }, [el('i', { class: 'vit-escuro' })]);
  pagina.append(cam);
  let aberto = false;
  const abrir = () => {
    if (aberto) return;
    aberto = true;
    cam.classList.add('fundo');
    cam.querySelectorAll('.vit-logo, .vit-raios').forEach(x => x.remove());
    pronto(cam);
  };
  efeito('vitoria');
  confeteLados(pagina, 42, 1.2);
  [[24, 22, '#ffd200'], [76, 17, '#38b2e8'], [50, 11, '#ff7a6b'], [16, 46, '#7dea4a'], [84, 44, '#ffd200'], [62, 27, '#c9a6ff']]
    .forEach(([x, y, cor], i) => depois(240 + i * 330, () => fogo(cam, x, y, cor)));
  depois(330, () => {
    if (aberto) return;
    cam.append(el('i', { class: 'vit-raios' }), img('logo-3d', 'vit-logo'));
  });
  // o toque só pula a vinheta depois do susto do estouro: quem ainda estava martelando não perde a festa
  depois(750, () => cam.addEventListener('pointerdown', abrir));
  depois(2480, abrir);
  return cam;
}

// Conta um número de 0 até o valor. O valor final é escrito antes: se a aba estiver oculta, ele já está lá.
export function contar(no, valor, ms = 650, atraso = 0) {
  no.textContent = String(valor);
  if (semMovimento() || !(valor > 0)) return;
  let inicio = 0;
  const passo = agora => {
    if (!inicio) inicio = agora + atraso;
    const p = Math.min(1, Math.max(0, (agora - inicio) / ms));
    no.textContent = String(Math.round(valor * (1 - (1 - p) ** 3)));
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}
