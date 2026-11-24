// Natal ADN (publicado em 24/11/2026, junto com o visual novo). Tudo o que é do Natal fica aqui e no natal.css.
// Fora do período o jogo volta sozinho ao visual normal: nenhuma outra parte do código precisa mudar.
// Identidade aprovada pelo Breno em 18/11 (prancha em arte/natal/identidade-natal.jpg, que fica só no Mac):
// "Natal de chave na mão". Noite no azul da ADN, luzes em amarelo, a fita do manual virando laço vermelho, sem neve.
// O Adeneco fica de gorro, sem capacete, em todos os bonecos, com o logo da ADN na barra branca.
import { el, img, trocarImagens } from './util.js';
import { efeito } from './som.js';
import { DESCONTO } from './dados.js';

export const NATAL = {
  // datas do Breno (24/11/2026): o Natal entra já, no dia da publicação, e fica até o Dia de Reis.
  // Enquanto o Natal vale, a Black Friday (que ia até 26/11) fica desligada. Depois de 06/01, o jogo volta sozinho ao visual novo sem enfeites.
  inicio: '2026-11-24T00:00:00-03:00',
  fim: '2027-01-06T23:59:59-03:00',
  // textos do cartão: rascunho, a ADN aprova antes de publicar
  rotulo: 'Natal ADN',
  chamada: ['Neste ', 'Natal', ', o presente é a chave do seu apê'],
  texto: `Conclua a jornada e ganhe ${DESCONTO} de desconto no seu primeiro apê.`,
  botao: 'Quero meu presente',
};

// Para conferir em qualquer data: ?natal=1 liga e ?natal=0 desliga. Com ?black=1, quem aparece é a Black Friday.
const busca = new URLSearchParams(location.search);
const forcar = busca.get('natal');
export function natalAtivo() {
  if (forcar === '1') return true;
  if (forcar === '0' || busca.get('black') === '1') return false;
  const agora = Date.now();
  return agora >= Date.parse(NATAL.inicio) && agora <= Date.parse(NATAL.fim);
}

// As artes de Natal (pasta a/natal) entram no lugar das normais. As poses do Adeneco têm o mesmo enquadramento.
const ARTES = {
  capa: 'natal/capa-natal',
  'capa-loading': 'natal/capa-loading-natal',
  'logo-3d': 'natal/logo-3d-natal',
  adeneco: 'natal/adeneco',
  'adeneco-tonto': 'natal/adeneco-tonto',
  'adeneco-festa': 'natal/adeneco-festa',
  'adeneco-aponta': 'natal/adeneco-aponta',
};
// o que o main.js carrega junto com o resto, antes de abrir
export const IMAGENS_NATAL = ['natal/chave', 'natal/laco'];

// As luzes: amarelo-Alegria, vermelho do laço, creme e azul-Céu. O fio faz barrigas e cada barriga tem três lâmpadas.
// O desenho é refeito quando a largura de onde ele está pendurado muda.
const CORES = ['#ffd200', '#ff4d5e', '#fff6dc', '#38b2e8'];
function desenhar(p) {
  const w = Math.round(p.clientWidth);
  if (w < 60 || p.dataset.w === String(w)) return;
  p.dataset.w = String(w);
  const vao = w / Math.max(2, Math.round(w / 86));
  const amp = 8;
  let d = 'M0,5';
  let luzes = '';
  let k = 0;
  for (let x = 0; x < w - 1; x += vao) {
    d += ` Q${(x + vao / 2).toFixed(1)},${5 + amp * 2} ${(x + vao).toFixed(1)},5`;
    for (const t of [0.2, 0.5, 0.8]) {
      const lx = Number((x + vao * t).toFixed(1));
      const ly = 5 + 4 * amp * t * (1 - t);
      const c = CORES[k % CORES.length];
      luzes += `<g class="luz${k % 2 ? ' b' : ''}"><circle class="halo" cx="${lx}" cy="${ly + 8}" r="11" fill="${c}" filter="url(#pisca-borra)"/>`
        + `<rect x="${lx - 2.5}" y="${ly - 1}" width="5" height="4.5" rx="1" fill="#0b2f2a"/>`
        + `<ellipse cx="${lx}" cy="${ly + 8.5}" rx="4.6" ry="6" fill="${c}"/><ellipse cx="${lx - 1.4}" cy="${ly + 6.5}" rx="1.3" ry="2" fill="#fff" opacity=".75"/></g>`;
      k += 1;
    }
  }
  p.innerHTML = `<svg viewBox="0 0 ${w} 34" aria-hidden="true"><defs><filter id="pisca-borra" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter></defs><path class="fio" d="${d}"/>${luzes}</svg>`;
}
const medidor = 'ResizeObserver' in window ? new ResizeObserver(lista => lista.forEach(x => desenhar(x.target))) : null;
function pisca(onde, classe = '') {
  if (onde.querySelector(':scope > .pisca')) return;
  const p = el('div', { class: `pisca ${classe}`.trim() });
  onde.append(p);
  desenhar(p);
  medidor?.observe(p);
}

// O cartão de Natal da tela inicial, no lugar do cartão da Black Friday: o presente é a chave.
function cartaoNatal() {
  const [antes, destaque, depois] = NATAL.chamada;
  const botao = el('a', { class: 'btn principal bloco', href: '#/jornada', text: NATAL.botao });
  botao.addEventListener('click', () => efeito('confirma'));
  return el('section', { class: 'natal-card' }, [
    el('i', { class: 'recorte' }, [el('i', { class: 'fita-canto' })]),
    img('natal/chave', 'natal-chave'),
    el('small', { class: 'rotulo', text: NATAL.rotulo }),
    el('h3', {}, [antes, el('em', { text: destaque }), depois]),
    el('p', { text: NATAL.texto }),
    botao,
  ]);
}

// Veste o que aparece na tela: luzes, cartão e laço. Cada coisa é enfeitada uma vez só.
const uma = (no, fn) => { if (no && !no.dataset.natal) { no.dataset.natal = '1'; fn(no); } };
const COM_LUZ_NA_BORDA = '.hud, .painel, .parabens-card, .rapida-card';
function enfeitar(tela) {
  // capa de carregamento e páginas de dentro: luzes no topo
  tela.querySelectorAll('.carregando, .capa-cena, .jornada, .ranking, .album').forEach(p => uma(p, () => pisca(p)));
  // tela inicial: o cartão de Natal logo depois dos botões
  uma(tela.querySelector('.inicio .botoes'), botoes => {
    const c = cartaoNatal();
    botoes.after(c);
    pisca(c, 'borda');
  });
  // placar da partida, painéis e cartões: luzes penduradas na borda de cima
  tela.querySelectorAll(COM_LUZ_NA_BORDA).forEach(c => uma(c, () => pisca(c, 'borda')));
  // prêmio: o laço de presente (no bloco das figurinhas e no canto do painel que traz um prêmio)
  tela.querySelectorAll('.premio-bloco').forEach(b => uma(b, () => b.append(img('natal/laco', 'natal-laco'))));
  tela.querySelectorAll('.painel').forEach(p => {
    if (p.querySelector('.pop-figs, .ganho') && !p.querySelector(':scope > .natal-laco')) p.append(img('natal/laco', 'natal-laco'));
  });
}

// Liga o tema: a classe no <html> é o que o natal.css espera. Chamado no começo do main.js, antes de carregar as imagens.
export function ligarNatal() {
  if (!natalAtivo()) return;
  document.documentElement.classList.add('natal');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a2452');
  trocarImagens(ARTES);
  const tela = document.getElementById('tela');
  let marcado = false;
  // a tela muda o tempo todo durante a partida: os enfeites são conferidos uma vez por quadro, não a cada mudança
  new MutationObserver(() => {
    if (marcado) return;
    marcado = true;
    requestAnimationFrame(() => { marcado = false; enfeitar(tela); });
  }).observe(tela, { childList: true, subtree: true });
  enfeitar(tela);
}
