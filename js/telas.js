// Telas fora da partida: início, jornada (com a folha "antes da fase"), partida rápida e ranking.
import { MONSTROS, HEROIS, ETAPAS, FASES_POR_ETAPA, TOTAL_FASES, AJUDAS, configFase, etapaDaFase } from './dados.js';
import { ler, gravar, faseAtual, idJogador } from './salvo.js';
import { listarRanking, registrarPontos, posicao, formNome } from './ranking.js';
import { alternarSom, somLigado, efeito } from './som.js';
import { el, img, botao, ICONES } from './util.js';
import { figurinhasGanhas, TOTAL_FIGURINHAS, premioDaEtapa } from './premios.js';

function voltar(ir, destino) {
  const b = botao([], 'redondo', () => ir(destino), 'Voltar');
  b.innerHTML = ICONES.voltar;
  return b;
}

function botaoSom() {
  const b = el('button', { class: 'redondo', 'aria-label': 'Som' });
  const pintar = () => {
    b.innerHTML = somLigado() ? ICONES.somOn : ICONES.somOff;
    b.setAttribute('aria-label', somLigado() ? 'Desligar som' : 'Ligar som');
  };
  b.addEventListener('click', () => { alternarSom(); pintar(); efeito('clique'); });
  pintar();
  return b;
}

const estrelasTxt = n => '★'.repeat(n) + '☆'.repeat(3 - n);

// ---------- início ----------
export function inicio(raiz, { ir }) {
  const s = ler();
  const n = faseAtual(s);
  const etapa = etapaDaFase(n);
  const p = el('div', { class: 'pagina inicio' });

  // a foto acompanha a etapa em que o jogador está
  const herois = el('div', { class: 'herois' }, [
    el('i', { class: 'herois-sombra' }),
    img('herois', 'herois-img'),
    el('i', { class: 'brilho-chave' }),
  ]);
  [['tijolo', 'Conhecer o Tijolo'], ['adeneco', 'Conhecer o Adeneco'], ['gaia', 'Conhecer a Gaia']].forEach(([id, rotulo]) =>
    herois.append(botao([], `toque-heroi ${id}`, () => abrirInfo(p, 'heroi', id), rotulo)));

  p.append(
    img(`fundo-${etapa.id}`, 'inicio-fundo'),
    el('header', { class: 'topo topo-capa' }, [botaoSom(), img('logo-adn-branco', 'topo-logo'), el('span', { class: 'chip', text: `★ Recorde ${s.recorde}` })]),
    el('div', { class: 'logo', 'aria-label': 'Toc Toc, Adeneco!' }, [el('b', { text: 'Toc Toc,' }), el('b', { text: 'Adeneco!' })]),
    herois,
    el('div', { class: 'botoes' }, [
      botao(`Jogar a jornada · Fase ${n}`, 'btn azul grande bloco pulsa', () => ir(`#/jornada/${n}`)),
      el('div', { class: 'dupla' }, [
        botao('Partida rápida', 'btn branco', () => ir('#/rapida')),
        botao('Ranking', 'btn branco', () => ir('#/ranking')),
      ]),
      botao(`Minhas figurinhas · ${figurinhasGanhas(s).length} de ${TOTAL_FIGURINHAS}`, 'btn amarelo bloco', () => ir('#/figurinhas')),
    ]),
    el('section', { class: 'card elenco' }, [
      el('b', { text: 'Acerte os monstrinhos' }),
      el('small', { text: 'Clique e conheça os motivos que te impedem de conquistar os seus sonhos.' }),
      el('div', { class: 'monstros' }, Object.entries(MONSTROS).map(([id, m], k) => {
        const b = botao([img(`m-${id}`), el('small', { text: m.nome })], 'monstro-bt', () => abrirInfo(p, 'monstro', id), `Conhecer o monstrinho ${m.nome}`);
        b.style.setProperty('--i', k);
        return b;
      })),
      el('div', { class: 'especiais' }, [
        el('b', { class: 'sub-tit', text: 'Nossos heróis · clique para conhecer' }),
        especial(p, 'adeneco', 'Não bata no Adeneco', '−3 pontos e o combo zera', 'menos'),
        especial(p, 'tijolo', 'Tijolo dourado: puxe pra cima', 'Pontos em dobro e +3 segundos', 'ouro'),
        especial(p, 'gaia', 'Gaia, a super rara: puxe pra cima', '"Aprovado." Relógio parado e pontos x3', 'super'),
      ]),
    ]),
  );
  raiz.append(p);
}

function especial(pagina, id, titulo, sub, classe) {
  return botao([img(id), el('span', {}, [el('b', { text: titulo }), el('small', { class: classe, text: sub })]), el('i', { class: 'seta', html: '›' })],
    'especial', () => abrirInfo(pagina, 'heroi', id), `Conhecer ${HEROIS[id].nome}`);
}

// ---------- card de monstrinho ou de herói ----------
function abrirInfo(pagina, tipo, id) {
  pagina.querySelector('.veu')?.remove();
  const monstro = tipo === 'monstro';
  const d = monstro ? MONSTROS[id] : HEROIS[id];
  const bloco = (titulo, texto, destaque) => el('div', { class: 'info-bloco' + (destaque ? ' destaque' : '') }, [
    el('small', { text: titulo }), el('p', { text: texto }),
  ]);
  const fechar = () => veu.remove();
  const folha = el('div', { class: 'folha info' + (monstro ? ' e-monstro' : ' e-heroi') }, [
    el('i', { class: 'pegador' }),
    img(monstro ? `m-${id}` : id, 'info-img'),
    el('span', { class: 'antes-chip', text: monstro ? 'MONSTRINHO' : 'HERÓI' }),
    el('b', { class: 'info-tit', text: d.nome }),
    monstro ? null : el('small', { class: 'info-papel', text: d.papel }),
    ...(monstro
      ? [bloco('Por que ele atrapalha', d.atrapalha), bloco('Como a ADN te ajuda a vencer', d.ajuda, true)]
      : [el('p', { class: 'info-quem', text: d.quem }), bloco(d.blocoTit, d.bloco, true), el('p', { class: 'info-jogo', text: d.jogo })]),
    botao('Entendi', 'btn azul grande bloco', fechar),
  ]);
  folha.addEventListener('click', ev => ev.stopPropagation());
  const veu = el('div', { class: 'veu' }, [folha]);
  veu.addEventListener('click', fechar);
  pagina.append(veu);
  efeito('abre');
}

// ---------- jornada ----------
export function jornada(raiz, { ir, abrir }) {
  const s = ler();
  const atual = faseAtual(s);
  const p = el('div', { class: 'pagina jornada' });
  p.append(
    el('header', { class: 'topo' }, [voltar(ir, '#/'), el('span', { class: 'chip', text: `★ ${Object.values(s.fases).reduce((a, b) => a + b, 0)} de ${TOTAL_FASES * 3}` })]),
    el('div', { class: 'jornada-cab' }, [
      el('h1', { text: 'A jornada do primeiro apê' }),
      el('p', { text: `${ETAPAS.length} etapas, ${FASES_POR_ETAPA} fases em cada. Do aluguel até a festa no condomínio.` }),
    ]),
  );
  const trilha = el('div', { class: 'trilha' });
  ETAPAS.forEach((et, k) => {
    const primeira = k * FASES_POR_ETAPA + 1;
    const fases = Array.from({ length: FASES_POR_ETAPA }, (_, j) => primeira + j);
    const feitas = fases.filter(f => s.fases[f]).length;
    const aberta = atual >= primeira;
    const aqui = aberta && atual < primeira + FASES_POR_ETAPA && !s.fases[atual];
    const completa = feitas === FASES_POR_ETAPA;
    const pips = el('div', { class: 'pips' }, fases.map(f => {
      const est = s.fases[f] || 0;
      const b = botao([el('span', { text: `Fase ${f}` }), el('em', { text: estrelasTxt(est) })],
        'pip' + (est ? ' feita' : '') + (f === atual && !est ? ' atual' : ''),
        () => abrirAntes(p, f, ir), `Fase ${f}`);
      if (f > atual) b.disabled = true;
      return b;
    }));
    const foto = el('div', { class: 'etapa-foto' }, [img(`fundo-${et.id}`)]);
    if (aqui) foto.append(img('adeneco', 'etapa-espia'));
    if (!aberta) foto.append(el('div', { class: 'etapa-tranca', html: `${ICONES.tranca}<span>Complete a etapa ${k}</span>` }));
    const txt = el('div', { class: 'etapa-txt' }, [
      el('div', { class: 'etapa-tit' }, [el('b', { text: et.nome }), el('small', { text: `${feitas} de ${FASES_POR_ETAPA} fases` })]),
      el('div', { class: 'etapa-sub', text: et.sub }),
      pips,
      premioDaEtapa(k + 1, Boolean(s.premios[k + 1]), ir),
    ]);
    if (aqui) txt.append(botao(`Continuar · Fase ${atual}`, 'btn azul bloco pulsa', () => abrirAntes(p, atual, ir)));
    trilha.append(el('div', { class: 'etapa' + (aberta ? '' : ' fechada') + (aqui ? ' aqui' : '') + (completa ? ' completa' : '') }, [
      el('span', { class: 'etapa-num', text: String(k + 1) }),
      el('div', { class: 'etapa-card' }, [foto, txt]),
    ]));
  });
  p.append(trilha);
  raiz.append(p);
  if (abrir && abrir <= atual) {
    abrirAntes(p, abrir, ir);
    // rola até a etapa da fase aberta
    const k = Math.floor((abrir - 1) / FASES_POR_ETAPA);
    trilha.children[k]?.scrollIntoView({ block: 'center' });
  }
}

// ---------- antes da fase ----------
function abrirAntes(pagina, n, ir) {
  pagina.querySelector('.veu')?.remove();
  const cfg = configFase(n);
  const et = etapaDaFase(n);
  const s = ler();
  const escolhidas = new Set();
  const fechar = () => veu.remove();

  const ajudas = el('div', { class: 'ajudas' }, AJUDAS.map(a => {
    const qtd = s.ajudas[a.id] || 0;
    const icone = a.img === 'relogio' ? el('span', { html: ICONES.relogio }).firstChild : img(a.img);
    const contador = el('em', { text: String(qtd) });
    const b = botao([contador, icone, el('small', { text: a.nome })], 'ajuda' + (qtd ? '' : ' vazia'), () => {
      if (!qtd) return aviso(folha, 'Ganhe ajudas fechando fases com 3 estrelas');
      if (escolhidas.has(a.id)) escolhidas.delete(a.id); else escolhidas.add(a.id);
      b.classList.toggle('on', escolhidas.has(a.id));
      contador.textContent = escolhidas.has(a.id) ? '✓' : String(qtd);
    }, `${a.nome}: ${a.desc}`);
    return b;
  }));

  const folha = el('div', { class: 'folha antes' }, [
    el('i', { class: 'pegador' }),
    el('span', { class: 'antes-chip', text: `ETAPA ${ETAPAS.indexOf(et) + 1} · ${et.nome.toUpperCase()}` }),
    el('b', { class: 'antes-tit', text: `Fase ${n}` }),
    el('div', { class: 'objetivo' }, [img('adeneco'), el('div', {}, [
      el('small', { text: 'Objetivo' }),
      el('b', { text: `Acerte ${cfg.meta} monstrinhos em ${cfg.tempo} segundos` }),
    ])]),
    el('b', { class: 'sub-tit', text: 'Monstrinhos desta fase' }),
    el('div', { class: 'lista-monstros' }, cfg.monstros.map(id => el('div', { class: 'linha-monstro' }, [
      img(`m-${id}`),
      el('span', {}, [el('b', { text: MONSTROS[id].nome }), el('small', { text: '+1 ponto cada' })]),
      el('span', { class: 'vence', text: `Vence com: ${MONSTROS[id].vence}` }),
    ]))),
    el('b', { class: 'sub-tit', text: 'Ajudas antes de começar' }),
    ajudas,
    botao('Jogar', 'btn azul grande bloco pulsa', () => {
      const s2 = ler();
      escolhidas.forEach(id => { s2.ajudas[id] = Math.max(0, (s2.ajudas[id] || 0) - 1); });
      gravar(s2);
      ir(`#/partida/${n}${escolhidas.size ? '/' + [...escolhidas].join(',') : ''}`);
    }),
  ]);
  folha.addEventListener('click', ev => ev.stopPropagation());
  const veu = el('div', { class: 'veu' }, [img(`fundo-${et.id}`, 'veu-fundo'), folha]);
  const x = botao([], 'redondo fechar', fechar, 'Fechar');
  x.innerHTML = '✕';
  veu.append(x);
  veu.addEventListener('click', fechar);
  pagina.append(veu);
  efeito('abre');
}

function aviso(onde, texto) {
  onde.querySelector('.premio.aviso')?.remove();
  const a = el('div', { class: 'premio aviso', text: texto });
  onde.append(a);
  setTimeout(() => a.remove(), 2200);
}

// ---------- partida rápida ----------
export function rapida(raiz, { ir }) {
  const s = ler();
  const p = el('div', { class: 'pagina rapida' });
  p.append(
    img('fundo-festa', 'fundo-cheio borrado'),
    el('header', { class: 'topo' }, [voltar(ir, '#/')]),
    el('section', { class: 'card rapida-card' }, [
      img('adeneco', 'topete'),
      el('span', { class: 'chip-ouro', text: '60 SEGUNDOS' }),
      el('h1', { text: 'Partida rápida' }),
      el('p', { text: 'Acerte o máximo de monstrinhos em 60 segundos. Sem fases, só recorde.' }),
      regra('m-juros', 'Monstrinho', '+1 ponto e soma combo', 'mais'),
      regra('adeneco', 'Adeneco (não bata!)', '−3 e zera o combo', 'menos'),
      regra('tijolo', 'Tijolo dourado: puxe pra cima', 'Pontos em dobro por 5 s e +3 s', 'ouro'),
      regra('gaia', 'Gaia, a super rara: puxe pra cima', '"Aprovado." Relógio parado e x3 por 5 s', 'super'),
      el('div', { class: 'recorde' }, [el('span', { text: 'Seu recorde' }), el('b', { text: `${s.recorde} pontos` })]),
      botao('Começar', 'btn azul grande bloco pulsa', () => ir('#/partida/rapida')),
    ]),
  );
  raiz.append(p);
}

function regra(nome, titulo, sub, classe) {
  return el('div', { class: 'regra' }, [img(nome), el('span', {}, [el('b', { text: titulo }), el('small', { class: classe, text: sub })])]);
}

// ---------- ranking (compartilhado, no Supabase) ----------
export function ranking(raiz, { ir }) {
  const eu = idJogador();
  const p = el('div', { class: 'pagina ranking' });
  const areaNome = el('div');
  const lista = el('div', { class: 'ranking-lista' });
  p.append(
    el('header', { class: 'topo' }, [voltar(ir, '#/'), el('b', { text: 'Ranking' }), el('span', { class: 'chip', text: `★ ${ler().recorde}` })]),
    el('div', { class: 'secao' }, [
      el('p', { class: 'nota', text: 'Partida rápida · o melhor resultado de cada jogador.' }),
      areaNome,
      lista,
      botao('Jogar partida rápida', 'btn azul grande bloco pulsa', () => ir('#/partida/rapida')),
    ]),
  );
  raiz.append(p);

  function mostrarNome() {
    const s = ler();
    areaNome.replaceChildren(s.nome
      ? el('div', { class: 'card nome-atual' }, [
        el('span', {}, ['Você aparece como ', el('b', { text: s.nome })]),
        botao('Trocar', 'link', () => areaNome.replaceChildren(formNome({ texto: 'Trocar o nome', aoSalvar: salvou }))),
      ])
      : formNome({ aoSalvar: salvou }));
  }

  async function salvou(nome) {
    mostrarNome();
    const s = ler();
    if (s.recorde > 0) {
      try { await registrarPontos({ jogador: eu, nome, pontos: s.recorde }); } catch {}
    }
    carregar();
  }

  const linha = (pos, nome, pontos, souEu) => el('div', { class: 'card linha-rank' + (souEu ? ' eu' : '') + (pos <= 3 ? ` podio p${pos}` : '') }, [
    el('b', { class: 'pos', text: String(pos) }),
    el('i', { text: nome.charAt(0).toUpperCase() }),
    el('span', { text: souEu ? `${nome} (você)` : nome }),
    el('b', { text: String(pontos) }),
  ]);

  async function carregar() {
    lista.replaceChildren(el('p', { class: 'nota', text: 'Carregando o ranking…' }));
    try {
      const linhas = await listarRanking();
      if (!linhas.length) {
        lista.replaceChildren(el('div', { class: 'card ranking-vazio', text: 'Ninguém no ranking ainda. Jogue uma partida rápida e seja o primeiro!' }));
        return;
      }
      lista.replaceChildren(...linhas.map((l, k) => linha(k + 1, l.nome, l.pontos, l.jogador === eu)));
      // fora dos 50 primeiros: mostra o lugar do jogador no fim da lista
      const s = ler();
      if (!linhas.some(l => l.jogador === eu) && s.nome && s.recorde > 0) {
        const pos = await posicao(s.recorde).catch(() => null);
        if (pos) lista.append(linha(pos, s.nome, s.recorde, true));
      }
    } catch {
      lista.replaceChildren(el('div', { class: 'card ranking-vazio' }, [
        el('p', { text: 'Não deu para carregar o ranking agora. Confira a internet.' }),
        botao('Tentar de novo', 'btn branco bloco', carregar),
      ]));
    }
  }

  mostrarNome();
  carregar();
}
