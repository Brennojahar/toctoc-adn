// Prêmios da jornada: as figurinhas do WhatsApp de cada etapa, a página de parabéns e o álbum.
import { ETAPAS, FIGURINHAS, WHATSAPP_CORRETOR, mensagemCorretor, fasesDaEtapa } from './dados.js';
import { ler, codigoPremio } from './salvo.js';
import { efeito } from './som.js';
import { el, img, botao, ICONES } from './util.js';

const PNG = id => `a/figurinhas/${id}.png`;
const mini = (id, classe = '') => img(`figurinhas/${id}-mini`, classe);
export const TOTAL_FIGURINHAS = Object.keys(FIGURINHAS).length;

export const figurinhasGanhas = (s = ler()) =>
  ETAPAS.flatMap((et, i) => (s.premios[i + 1] && Array.isArray(et.premio) ? et.premio : []));

// Os arquivos ficam prontos antes do toque: o iPhone só abre o menu de compartilhar se for chamado na hora do toque.
const arquivos = new Map();
function preparar(ids) {
  ids.forEach(id => {
    if (arquivos.has(id)) return;
    arquivos.set(id, null);
    fetch(PNG(id))
      .then(r => r.blob())
      .then(b => arquivos.set(id, new File([b], `figurinha-toctoc-${id}.png`, { type: 'image/png' })))
      .catch(() => arquivos.delete(id));
  });
}

// No celular abre o menu de compartilhar (salvar na galeria ou mandar direto no WhatsApp); senão, baixa os arquivos.
async function baixar(ids) {
  const files = ids.map(id => arquivos.get(id)).filter(Boolean);
  if (files.length === ids.length && navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  for (const id of ids) {
    const a = el('a', { href: PNG(id), download: `figurinha-toctoc-${id}.png` });
    document.body.append(a);
    a.click();
    a.remove();
    await new Promise(r => setTimeout(r, 400));
  }
}

const COMO = 'No WhatsApp: abra uma conversa, toque em figurinhas, depois em Criar, e escolha a imagem que você salvou.';

// A figurinha de verdade (PNG 1024), solta na página: clicar e segurar abre o "salvar imagem" do celular.
function figurinhaSalvavel(id, classe) {
  const foto = new Image();
  foto.src = PNG(id);
  foto.alt = `Figurinha ${FIGURINHAS[id]}`;
  foto.loading = 'lazy';
  foto.className = 'salvavel';
  return el('div', { class: classe }, [foto]);
}

// A que ainda não foi ganha: só a silhueta, sem toque nem menu de salvar.
function figurinhaBloqueada(id, classe) {
  const sombra = img(`figurinhas/${id}-bloqueada`, 'bloqueada');
  sombra.alt = 'Figurinha bloqueada';
  sombra.addEventListener('contextmenu', ev => ev.preventDefault());
  return el('div', { class: `${classe} trancada`, html: ICONES.tranca }, [sombra]);
}

const SEGURE = 'Clique e segure na figurinha e salve no seu telefone.';

function figurinhasDoPremio(ids) {
  return el('div', { class: 'premio-bloco' }, [
    el('small', { class: 'premio-tit', text: ids.length > 1 ? `Seu prêmio: ${ids.length} figurinhas para o WhatsApp` : 'Seu prêmio: uma figurinha para o WhatsApp' }),
    el('div', { class: 'figs' }, ids.map((id, i) => {
      const f = figurinhaSalvavel(id, 'fig');
      f.style.setProperty('--i', i);
      return f;
    })),
    el('b', { class: 'segure', text: SEGURE }),
    el('small', { class: 'como', text: COMO }),
  ]);
}

function botaoCorretor() {
  const href = `https://wa.me/${WHATSAPP_CORRETOR}?text=${encodeURIComponent(mensagemCorretor(codigoPremio()))}`;
  const a = el('a', { class: 'btn whats grande bloco pulsa', href, target: '_blank', rel: 'noopener', html: `${ICONES.whatsapp}<span>Falar com um corretor</span>` });
  a.addEventListener('click', () => efeito('confirma'));
  return a;
}

function condicaoEspecial() {
  return el('div', { class: 'premio-bloco final' }, [
    el('small', { class: 'premio-tit', text: 'Seu prêmio' }),
    el('b', { class: 'premio-grande', text: 'Uma condição especial para você' }),
    el('div', { class: 'codigo' }, [el('small', { text: 'Seu código' }), el('b', { text: codigoPremio() })]),
    botaoCorretor(),
    el('small', { class: 'como', text: 'A mensagem já vai pronta: o corretor fica sabendo que você concluiu o jogo.' }),
  ]);
}

function confete() {
  const c = el('div', { class: 'confete', 'aria-hidden': 'true' });
  const cores = ['#ffc72c', '#1f5bd6', '#4a9cf0', '#ff7a45', '#ffffff', '#1d9a55'];
  for (let i = 0; i < 36; i++) {
    const p = el('i');
    p.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--d:${(Math.random() * -4).toFixed(2)}s;--t:${(2.8 + Math.random() * 2.2).toFixed(2)}s;--r:${Math.round(Math.random() * 360)}deg;--c:${cores[i % cores.length]}`;
    c.append(p);
  }
  return c;
}

// ---------- parabéns: aparece ao concluir uma etapa ----------
export function parabens(raiz, { ir, k }) {
  const s = ler();
  const et = ETAPAS[k - 1];
  if (!et || !s.premios[k]) return ir('#/jornada');
  const final = !Array.isArray(et.premio);
  const prox = ETAPAS[k];
  const p = el('div', { class: 'pagina parabens' });
  p.append(
    img(`fundo-${et.id}`, 'fundo-cheio borrado'),
    confete(),
    el('section', { class: 'card parabens-card' }, [
      el('div', { class: 'res-heroi alterna' }, [img('adeneco-festa', 'quadro a'), img('adeneco-aponta', 'quadro b')]),
      el('span', { class: 'chip-ouro', text: final ? 'JORNADA CONCLUÍDA' : `ETAPA ${k} CONCLUÍDA` }),
      el('h1', { text: 'Parabéns!' }),
      el('h2', { text: et.parabens.tit }),
      el('p', { class: 'parabens-texto', text: et.parabens.texto }),
      final ? condicaoEspecial() : figurinhasDoPremio(et.premio),
      prox ? botao(`Próxima etapa: ${prox.nome}`, 'btn azul grande bloco', () => ir(`#/jornada/${fasesDaEtapa(k + 1)[0]}`)) : null,
      el('div', { class: 'res-links' }, [
        botao('Minhas figurinhas', 'link', () => ir('#/figurinhas')),
        botao('Início', 'link', () => ir('#/')),
      ]),
    ]),
  );
  raiz.append(p);
  efeito('premio');
}

// ---------- álbum: todas as figurinhas, ganhas e por ganhar ----------
export function album(raiz, { ir }) {
  const s = ler();
  const ganhas = figurinhasGanhas(s);
  preparar(ganhas);
  const voltar = botao([], 'redondo', () => ir('#/'), 'Voltar');
  voltar.innerHTML = ICONES.voltar;
  const p = el('div', { class: 'pagina album' });
  p.append(
    el('header', { class: 'topo' }, [voltar, el('b', { text: 'Minhas figurinhas' }), el('span', { class: 'chip', text: `${ganhas.length} de ${TOTAL_FIGURINHAS}` })]),
    el('p', { class: 'nota album-nota', text: `Conclua as etapas da jornada para ganhar figurinhas do Toc Toc para usar no WhatsApp. ${ganhas.length ? SEGURE : ''}` }),
  );
  const lista = el('div', { class: 'secao' });
  ETAPAS.forEach((et, i) => {
    const k = i + 1;
    const tem = Boolean(s.premios[k]);
    const cab = el('div', { class: 'album-cab' }, [
      el('b', { text: `Etapa ${k} · ${et.nome}` }),
      el('small', { class: tem ? 'mais' : '', text: tem ? 'Ganhou!' : `Conclua a etapa ${k}` }),
    ]);
    if (!Array.isArray(et.premio)) {
      lista.append(el('section', { class: 'card album-etapa final' + (tem ? '' : ' fechada') }, [
        cab,
        tem ? condicaoEspecial() : el('p', { class: 'album-final', text: 'Conclua a jornada inteira para desbloquear uma condição especial com um corretor da ADN.' }),
      ]));
      return;
    }
    // ganha: a figurinha de verdade, que dá para segurar e salvar; não ganha: só a silhueta
    const figs = el('div', { class: 'album-figs' }, et.premio.map(id => {
      const f = tem ? figurinhaSalvavel(id, 'fig-mini') : figurinhaBloqueada(id, 'fig-mini');
      f.append(el('small', { text: tem ? FIGURINHAS[id] : '???' }));
      return f;
    }));
    lista.append(el('section', { class: 'card album-etapa' + (tem ? '' : ' fechada') }, [
      cab,
      figs,
      tem ? botao(et.premio.length > 1 ? 'Baixar estas figurinhas' : 'Baixar esta figurinha', 'btn amarelo bloco', () => baixar(et.premio)) : null,
    ]));
  });
  if (ganhas.length) lista.append(el('small', { class: 'como', text: COMO }));
  p.append(lista);
  raiz.append(p);
}

// a linha de prêmio no card de cada etapa, na jornada
export function premioDaEtapa(k, ganho, ir) {
  const et = ETAPAS[k - 1];
  return el('div', { class: 'etapa-premio' + (ganho ? ' ganho' : '') }, [
    el('small', { text: ganho ? 'Prêmio ganho' : 'Prêmio' }),
    el('span', { class: 'etapa-premio-figs' }, Array.isArray(et.premio)
      ? et.premio.map(id => (ganho ? mini(id) : img(`figurinhas/${id}-bloqueada`, 'bloqueada')))
      : [el('b', { text: 'Condição especial' })]),
    ganho ? botao('Ver prêmio', 'mini-bt', () => ir(`#/parabens/${k}`)) : null,
  ]);
}
