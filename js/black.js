// Black Friday ADN (pedido de 11/11/2026). Tudo o que é da campanha fica aqui e no black.css.
// Fora do período, o jogo volta sozinho ao visual normal: nenhuma outra parte do código precisa mudar.
// Fonte: a peça da campanha que a ADN mandou. Só o que está escrito nela entra no jogo.
import { el, img, ICONES } from './util.js';
import { efeito } from './som.js';
import { WHATSAPP_CORRETOR } from './dados.js';

export const BLACK = {
  // "09 até 26/11", no horário de Brasília
  inicio: '2026-11-09T00:00:00-03:00',
  fim: '2026-11-26T23:59:59-03:00',
  periodo: '09 até 26/11',
  chamada: 'Compre seu apê em novembro e concorra a',
  premio: 'R$ 50 mil em desconto',
  certificado: 'Número do Certificado de Autorização: 06.053949/2026',
  mensagem: 'Oi! Vi a Black Friday da ADN no jogo Toc Toc, Adeneco! e quero saber como concorrer a R$ 50 mil em desconto.',
  // vai no fim da mensagem de quem ganhou o desconto do jogo
  mensagemPremio: ' Quero saber também da Black Friday ADN.',
};

// Para conferir os dois visuais em qualquer data: ?black=1 liga e ?black=0 desliga.
const forcar = new URLSearchParams(location.search).get('black');
export function blackAtiva() {
  if (forcar === '1') return true;
  if (forcar === '0') return false;
  const agora = Date.now();
  return agora >= Date.parse(BLACK.inicio) && agora <= Date.parse(BLACK.fim);
}

// O ícone oficial da ADN (GERAL/MARCAS/ADN/LOGO/ADN_ICONE_NEGATIVO_BRANCO.svg), na cor do texto.
const ICONE = '<svg viewBox="457.704 145.56 73.655 65.344" aria-hidden="true"><path fill="currentColor" d="M508.328 207.719c1.488 2.738 2.738 4.379 7.442 1.664 7.21-4.168 19.613-14.008 14.293-23.711l-18.93-33.953c-4.727-8.406-16.141-7.93-20.66-.172-.79 1.351-32.77 59.258-32.77 59.258l28.16.082c4.785.012 4.664-.149 14.332-17.367Zm-4.348-16.41s4.469-9.125 13.07-8.582c1.375.09 2.711.512 3.914 1.191 2.774 1.567 7.403 5.27 4.121 11.375 0 0-1.75 3.922-8.183 7.965-.332.207-.664.422-.988.645-.961.652-3.668 2.191-4.84-.254Z"/></svg>';

// Liga o tema: a classe no <html> é o que o black.css espera.
export function ligarBlack() {
  if (!blackAtiva()) return;
  document.documentElement.classList.add('black');
  // a fonte da peça (Montserrat) só é pedida enquanto a campanha vale
  document.head.append(el('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,500;0,800;1,800&display=swap' }));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#020f21');
  // painel do lado (computador): logo branco e as condições da campanha
  const lado = document.querySelector('.lado');
  if (!lado) return;
  lado.querySelector('.lado-marca source')?.remove();
  lado.querySelector('.lado-marca img')?.setAttribute('src', 'a/logo-adn-branco.webp');
  lado.querySelector('h1')?.after(el('div', { class: 'lado-black' }, [
    el('b', { text: `Black Friday ADN · ${BLACK.periodo}` }),
    el('p', { text: `${BLACK.chamada} ${BLACK.premio}.` }),
    el('small', { text: BLACK.certificado }),
  ]));
}

// As duas fitas amarelas cruzadas no topo da capa, como na peça.
export function fitas() {
  const fita = classe => {
    const trecho = () => el('span', { html: Array(8).fill(`${ICONE}<b>BLACK FRIDAY</b>`).join('') });
    return el('div', { class: `fita ${classe}` }, [el('div', { class: 'fita-corre' }, [trecho(), trecho()])]);
  };
  return el('div', { class: 'fitas', 'aria-hidden': 'true' }, [fita('tras'), fita('frente')]);
}

// O letreiro BLACK FRIDAY medido na peça: Montserrat ExtraBold com as letras juntas, inclinado 4,3°,
// "BLACK" cheio em branco e "FRIDAY" só no contorno azul, as duas palavras com a mesma largura.
// O contorno tem espessura fixa na tela (1,7 px por fora), para não afinar demais em tela pequena.
const LETREIRO = `<svg class="black-letreiro" viewBox="0 0 500 230" role="img" aria-label="Black Friday">
  <g transform="translate(8.6 0) skewX(-4.3)" font-family="Montserrat, Inter, sans-serif" font-weight="800" font-size="142.86">
    <text x="-3" y="100" textLength="504" fill="#fff">BLACK</text>
    <text x="-3" y="230" textLength="507" fill="#03315f" stroke="#6cc6ff" stroke-width="3.4" vector-effect="non-scaling-stroke" stroke-linejoin="round" paint-order="stroke">FRIDAY</text>
  </g>
</svg>`;

// Diagramação da primeira versão (ele pediu para voltar em 11/11): o letreiro em cima e o logo da ADN embaixo, centrados.
const letreiro = () => el('span', { class: 'black-letreiro-caixa', html: LETREIRO });
const logoAdn = () => img('logo-adn-branco', 'black-logo');

const periodo = () => el('b', { class: 'black-data', text: BLACK.periodo.toUpperCase() });
const certificado = () => el('small', { class: 'black-cert', text: BLACK.certificado });

function chamada() {
  return el('p', { class: 'black-chamada', text: BLACK.chamada }, [el('em', { text: BLACK.premio })]);
}

// O cartão da campanha na capa: as condições e o caminho para o corretor.
export function cartaoBlack() {
  const href = `https://wa.me/${WHATSAPP_CORRETOR}?text=${encodeURIComponent(BLACK.mensagem)}`;
  const a = el('a', { class: 'btn azul bloco', href, target: '_blank', rel: 'noopener', html: `${ICONES.whatsapp}<span>Quero saber da Black Friday</span>` });
  a.addEventListener('click', () => efeito('confirma'));
  return el('section', { class: 'black-card', 'aria-label': 'Black Friday ADN' }, [letreiro(), logoAdn(), periodo(), chamada(), a, certificado()]);
}

// A mesma chamada, pequena, junto do desconto do fim da jornada.
export function faixaBlack() {
  return el('div', { class: 'black-faixa' }, [
    el('small', { class: 'black-faixa-tit', text: `Black Friday ADN · ${BLACK.periodo}` }),
    chamada(),
    certificado(),
  ]);
}
