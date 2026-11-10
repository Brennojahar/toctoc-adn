// Prêmios da jornada: as figurinhas do WhatsApp de cada etapa, o desconto no fim (depois das indicações), a página de parabéns e o álbum.
import { ETAPAS, FIGURINHAS, WHATSAPP_CORRETOR, mensagemCorretor, fasesDaEtapa, DESCONTO, MAX_INDICACOES } from './dados.js';
import { ler, gravar, codigoPremio } from './salvo.js';
import { atualizarLead, enviarIndicacoes, mascara, digitos } from './cadastro.js';
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
  const indicados = ler().indicacoes?.total || 0;
  const href = `https://wa.me/${WHATSAPP_CORRETOR}?text=${encodeURIComponent(mensagemCorretor(codigoPremio(), indicados))}`;
  const a = el('a', { class: 'btn whats grande bloco pulsa', href, target: '_blank', rel: 'noopener', html: `${ICONES.whatsapp}<span>Falar com um corretor</span>` });
  a.addEventListener('click', () => {
    efeito('confirma');
    // o cadastro no banco fica marcado: esta pessoa chamou o corretor
    const s = ler();
    s.corretor = true;
    gravar(s);
    atualizarLead();
  });
  return a;
}

// O prêmio final: antes do desconto vem o campo de indicações (opcional, com "pular"); depois, o desconto.
function premioFinal() {
  const caixa = el('div', { class: 'premio-final' });
  const mostrar = () => caixa.replaceChildren(ler().indicacoes ? desconto() : indicacoes(mostrar));
  mostrar();
  return caixa;
}

function indicacoes(pronto) {
  const linhas = el('div', { class: 'ind-linhas' });
  const erro = el('small', { class: 'cad-erro', role: 'alert' });
  const mais = botao('+ Indicar mais um', 'link ind-mais', () => {
    novaLinha();
    linhas.lastChild.querySelector('input').focus();
  });
  mais.type = 'button';
  function novaLinha() {
    const n = linhas.children.length + 1;
    const nome = el('input', { type: 'text', maxlength: '60', placeholder: 'Nome', autocomplete: 'off', enterkeyhint: 'next', 'aria-label': `Nome da indicação ${n}` });
    const whats = el('input', { type: 'tel', inputmode: 'numeric', placeholder: 'WhatsApp com DDD', autocomplete: 'off', enterkeyhint: 'done', 'aria-label': `WhatsApp da indicação ${n}` });
    whats.addEventListener('input', () => { whats.value = mascara(whats.value); });
    linhas.append(el('div', { class: 'ind-linha' }, [el('b', { text: String(n) }), nome, whats]));
    mais.hidden = linhas.children.length >= MAX_INDICACOES;
  }
  const form = el('form', { class: 'ind-form', novalidate: '' }, [
    linhas, mais, erro,
    el('button', { class: 'btn amarelo grande bloco', type: 'submit', text: 'Indicar e ver meu desconto' }),
  ]);
  form.addEventListener('input', () => {
    erro.textContent = '';
    form.querySelectorAll('.invalido').forEach(x => x.classList.remove('invalido'));
  });
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const lista = [];
    let falha = null;
    for (const linha of linhas.children) {
      const [nome, whats] = linha.querySelectorAll('input');
      const n = nome.value.replace(/\s+/g, ' ').trim();
      const w = digitos(whats.value);
      if (!n && !w) continue;
      if (n.length < 2 || !/\p{L}/u.test(n)) falha = falha || [nome, 'Escreva o nome de quem você está indicando.'];
      else if (!/^\d{10,11}$/.test(w)) falha = falha || [whats, 'Confira o WhatsApp, com o DDD.'];
      else if (!lista.some(x => x.whatsapp === w)) lista.push({ nome: n, whatsapp: w });
    }
    if (!falha && !lista.length) falha = [linhas.querySelector('input'), 'Preencha pelo menos uma indicação, ou toque em "Pular".'];
    if (falha) {
      falha[0].classList.add('invalido');
      falha[0].focus();
      erro.textContent = falha[1];
      efeito('bip');
      return;
    }
    const s = ler();
    s.indicacoes = { estado: 'pendente', total: lista.length, lista };
    gravar(s);
    enviarIndicacoes();
    efeito('premio');
    pronto();
  });
  const pular = botao('Pular e ver meu desconto', 'link ind-pular', () => {
    const s = ler();
    s.indicacoes = { estado: 'pulou', total: 0 };
    gravar(s);
    pronto();
  });
  novaLinha();
  return el('div', { class: 'premio-bloco final indicar' }, [
    el('small', { class: 'premio-tit', text: 'Antes do seu desconto' }),
    el('b', { class: 'premio-grande', text: 'Quem mais sonha com o primeiro apê?' }),
    el('p', { class: 'ind-texto', text: `Indique até ${MAX_INDICACOES} amigos ou parentes. Um corretor da ADN vai falar com eles só sobre o primeiro apê.` }),
    form,
    el('small', { class: 'como', text: 'Indique só quem você conhece e que gostaria de receber esse contato.' }),
    pular,
  ]);
}

function desconto() {
  const total = ler().indicacoes?.total || 0;
  return el('div', { class: 'premio-bloco final' }, [
    el('small', { class: 'premio-tit', text: 'Seu prêmio' }),
    el('b', { class: 'premio-grande', html: `<em>${DESCONTO}</em> de desconto no seu apê ADN` }),
    total ? el('small', { class: 'ind-ok', text: total > 1 ? `Obrigado pelas ${total} indicações!` : 'Obrigado pela indicação!' }) : null,
    el('div', { class: 'codigo' }, [el('small', { text: 'Seu código' }), el('b', { text: codigoPremio() })]),
    botaoCorretor(),
    el('small', { class: 'como', text: 'A mensagem já vai pronta: o corretor fica sabendo do seu desconto e explica as condições.' }),
  ]);
}

function confete() {
  const c = el('div', { class: 'confete', 'aria-hidden': 'true' });
  const cores = ['#ffd200', '#0070b8', '#38b2e8', '#f7ad00', '#ffffff', '#00306d'];
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
      final ? premioFinal() : figurinhasDoPremio(et.premio),
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
        tem ? premioFinal() : el('p', { class: 'album-final', text: `Conclua a jornada inteira para ganhar ${DESCONTO} de desconto no seu apê ADN.` }),
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
      : [el('b', { text: `${DESCONTO} de desconto` })]),
    ganho ? botao('Ver prêmio', 'mini-bt', () => ir(`#/parabens/${k}`)) : null,
  ]);
}
