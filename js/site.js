// O jogo mora dentro do site da ADN (25/11/2026): em todo lugar há um jeito de voltar à navegação normal do site.
// Para onde volta: a página do site de onde a pessoa veio; quem chegou por link direto ou compartilhado vai à página inicial.
// Os botões são links de verdade com target="_top": se o jogo estiver num iframe, sai a página inteira, não só o quadro.
import { el, img } from './util.js';
import { efeito } from './som.js';

const SITE_ADN = 'https://adnconstrutora.com.br/';
const DO_SITE = /(^|\.)adnconstrutora\.com\.br$/i;
const NUM_IFRAME = (() => { try { return window.top !== window.self; } catch { return true; } })();

// a página de onde veio só vale se for do site da ADN e se o jogo não estiver num iframe
// (no iframe, a página "de onde veio" é a própria página que mostra o jogo)
let destino = SITE_ADN;
try {
  const r = new URL(document.referrer);
  if (!NUM_IFRAME && DO_SITE.test(r.hostname) && r.href.split('#')[0] !== location.href.split('#')[0]) destino = r.href;
} catch { /* sem referência: página inicial do site */ }

const ROTULO_SITE = 'Voltar ao site da ADN';
const SETA = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';

export function linkSite(classe, conteudo) {
  const a = el('a', { class: classe, href: destino, target: '_top' });
  if (typeof conteudo === 'string') a.textContent = conteudo;
  else {
    // só ícone e logo: o nome vem do rótulo
    a.setAttribute('aria-label', ROTULO_SITE);
    a.append(...[].concat(conteudo));
  }
  a.addEventListener('click', () => efeito('clique'));
  return a;
}

// o logo da ADN no topo da capa, com a setinha: o mesmo lugar onde o logo já estava
export function botaoSiteCapa() {
  const a = linkSite('site-adn', [el('span', { class: 'site-adn-seta', html: SETA }), img('logo-adn-branco', 'topo-logo')]);
  a.title = ROTULO_SITE;
  return a;
}

// o link fixo da página no computador (está no index.html, fora do celular): só recebe o destino certo
export function ligarLinksDoSite() {
  document.querySelectorAll('[data-site-adn]').forEach(a => { a.href = destino; a.target = '_top'; });
}
