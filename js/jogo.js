// A partida: buracos, aparições, marteladas, combo, poderes do Tijolo e da Gaia, fim.
import { configFase, etapaDaFase, numEtapa, fasesDaEtapa, ETAPAS, COMBOS, estrelas, TOTAL_FASES, AJUDAS } from './dados.js';
import { efeito, vibrar, tocarMusica, pararMusica } from './som.js';
import { ler, gravar } from './salvo.js';
import { el, img, botao, IMG } from './util.js';
import { caixaRanking } from './ranking.js';
import { atualizarLead } from './cadastro.js';

const CHANCE_ADENECO = 0.28;
const PAUSA_BONUS = 8000; // ms mínimos entre um cachorro e outro
const multCombo = c => (c >= 10 ? 3 : c >= 5 ? 2 : 1);

export function partida(raiz, { fase, ajudas = [], ir }) {
  const rapida = fase === 'rapida';
  const cfg = configFase(rapida ? 15 : fase, rapida);
  const etapa = rapida ? ETAPAS[Math.floor(Math.random() * ETAPAS.length)] : etapaDaFase(cfg.n);
  const tem = id => ajudas.includes(id);
  const duracao = cfg.tempo + (tem('tempo') ? 5 : 0);
  const limitePressa = rapida ? 10 : 5; // a partir daqui a música acelera e o relógio pisca

  const E = {
    buracos: Array(9).fill(null),
    pontos: 0, acertos: 0, combo: 0, melhor: 0,
    resta: duracao, segundos: 0,
    estado: 'conta', pausa: false, pausaDesde: 0,
    poderAte: 0, superAte: 0, ultimoBonus: 0, gaiaVeio: false, levouCapacete: false,
  };
  let seq = 1;
  const timers = new Set();
  const depois = (ms, fn) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

  // ---------- DOM ----------
  const pagina = el('div', { class: 'pagina partida' });
  pagina.style.setProperty('--anel', etapa.anel);
  pagina.style.setProperty('--borda', etapa.borda);
  const grade = el('div', { class: 'grade' });
  const celulas = Array.from({ length: 9 }, (_, i) => {
    const c = el('button', { class: 'celula', 'aria-label': `Buraco ${i + 1}`, tabindex: '0' }, [
      el('i', { class: 'buraco' }),
      el('span', { class: 'mascara' }),
    ]);
    c.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tocar(i, true); }
    });
    grade.append(c);
    return c;
  });
  const mascaras = celulas.map(c => c.querySelector('.mascara'));
  pagina.append(el('div', { class: 'cena' }, [el('div', { class: 'palco' }, [img(`fundo-${etapa.id}`, 'palco-img'), grade])]));

  const relogio = el('div', { class: 'relogio' }, [el('b')]);
  const placar = el('div', { class: 'placar' }, [el('small'), el('b')]);
  const combo = el('div', { class: 'combo' }, [el('small'), el('b')]);
  const btPausa = botao([], 'redondo', pausar, 'Pausar');
  btPausa.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>';
  pagina.append(el('header', { class: 'hud' }, [btPausa, relogio, placar, combo]));
  const medidor = el('div', { class: 'medidor', hidden: '' }, [el('i'), el('small')]);
  const estado = el('div', { class: 'estado', hidden: '' });
  pagina.append(medidor, estado);
  raiz.append(pagina);

  // ---------- HUD ----------
  function hud() {
    const agora = Date.now();
    const parado = agora < E.superAte;
    relogio.style.setProperty('--p', Math.max(0, E.resta) / duracao);
    relogio.classList.toggle('pressa', E.estado === 'jogo' && E.resta <= limitePressa && !parado);
    relogio.classList.toggle('parado', parado);
    relogio.firstChild.textContent = `0:${String(Math.max(0, E.resta)).padStart(2, '0')}`;
    placar.firstChild.textContent = rapida ? 'Pontos' : `Monstrinhos · ${E.pontos} pts`;
    placar.lastChild.innerHTML = rapida ? `${E.pontos}` : `${E.acertos}<em> / ${cfg.meta}</em>`;
    const m = multCombo(E.combo);
    combo.firstChild.textContent = `Combo${m > 1 ? ' · x' + m : ''}`;
    combo.lastChild.textContent = E.combo;
    combo.classList.toggle('quente', E.combo >= 3);
    combo.classList.toggle('fogo', E.combo >= 10);
    if (E.combo >= 3) {
      medidor.hidden = false;
      medidor.firstChild.style.width = Math.min(100, (E.combo / 10) * 100) + '%';
      medidor.lastChild.textContent = E.combo >= 10 ? 'Modo fogo · pontos x3'
        : E.combo >= 5 ? `x2 pontos · faltam ${10 - E.combo} para x3` : `faltam ${5 - E.combo} para x2`;
    } else medidor.hidden = true;
    const poder = agora < E.poderAte;
    estado.hidden = !(parado || poder);
    estado.className = 'estado ' + (parado ? 'super' : 'poder');
    estado.textContent = parado ? 'Aprovado: relógio parado · x3' : 'Tijolo turbinado · x2';
    pagina.classList.toggle('fogo', E.combo >= 10 && !poder && !parado);
    pagina.classList.toggle('poder', poder && !parado);
    pagina.classList.toggle('super', parado);
  }
  const animarCombo = () => { combo.style.animation = 'none'; void combo.offsetWidth; combo.style.animation = ''; };

  function banner(txt, sub, tipo = '') {
    pagina.querySelector('.banner')?.remove();
    const b = el('div', { class: 'banner ' + tipo }, [el('b', { text: txt }), sub ? el('small', { text: sub }) : null]);
    pagina.append(b);
    depois(1150, () => b.remove());
  }

  // efeitos presos a uma célula
  function efeitoNa(i, node, ms) {
    celulas[i].append(node);
    depois(ms, () => node.remove());
  }
  const pop = (i, txt, tipo = '') => efeitoNa(i, el('em', { class: 'pop ' + tipo, text: txt }), 760);
  function faiscas(i, tipo) {
    const n = tipo === 'nuvem' ? 5 : 6;
    const f = el('span', { class: 'faiscas ' + tipo });
    for (let k = 0; k < n; k++) {
      const p = tipo === 'chave' ? img('chave') : el('i');
      p.style.setProperty('--k', k);
      f.append(p);
    }
    efeitoNa(i, f, 680);
  }

  // ---------- aparições ----------
  function sair(i, ms = 160) {
    const b = E.buracos[i];
    if (!b) return;
    E.buracos[i] = null;
    b.el.classList.add('desce');
    celulas[i].querySelector('.puxe')?.remove();
    depois(ms, () => b.el.remove());
  }

  function aparecer() {
    if (E.estado !== 'jogo' || E.pausa) return;
    const agora = Date.now();
    const emSuper = agora < E.superAte;
    E.buracos.forEach((b, i) => { if (b && b.ate < agora) (b.batido || b.coletado ? limpar(i) : sair(i)); });
    const livres = E.buracos.map((b, i) => (b ? -1 : i)).filter(i => i >= 0);
    let quantos = emSuper ? 3 : livres.length > 6 ? 2 : 1;
    const temCachorro = E.buracos.some(b => b && (b.tipo === 'tijolo' || b.tipo === 'gaia'));
    let apareceu = false;
    while (quantos-- > 0 && livres.length) {
      const i = livres.splice(Math.floor(Math.random() * livres.length), 1)[0];
      const podeBonus = !emSuper && !temCachorro && !apareceu && agora - E.ultimoBonus > PAUSA_BONUS;
      const pGaia = podeBonus && !E.gaiaVeio && E.segundos >= duracao * 0.35 ? 0.025 : 0;
      const pTijolo = podeBonus ? (tem('ouro') ? 0.08 : 0.035) : 0;
      const r = Math.random();
      const tipo = r < pGaia ? 'gaia' : r < pGaia + pTijolo ? 'tijolo'
        : !emSuper && r < pGaia + pTijolo + CHANCE_ADENECO ? 'adeneco' : 'monstro';
      if (tipo === 'gaia') E.gaiaVeio = true;
      if (tipo === 'gaia' || tipo === 'tijolo') E.ultimoBonus = agora;
      const monstro = tipo === 'monstro' ? cfg.monstros[Math.floor(Math.random() * cfg.monstros.length)] : null;
      const vida = cfg.vivo * (tipo === 'gaia' ? 1.9 : tipo === 'tijolo' ? 1.7 : 1) * (emSuper ? 0.85 : 1);
      const elImg = img(monstro ? `m-${monstro}` : tipo, `sai ${tipo}${monstro ? ' m-' + monstro : ''}`);
      elImg.decoding = 'sync';
      mascaras[i].append(elImg);
      E.buracos[i] = { id: seq++, tipo, monstro, ate: agora + vida, el: elImg };
      if (tipo === 'tijolo' || tipo === 'gaia') {
        celulas[i].append(el('span', { class: 'puxe' + (tipo === 'gaia' ? ' lilas' : ''), html: '<i>↑</i>Puxe!' }));
      }
      apareceu = true;
    }
    if (apareceu) efeito('pop');
  }

  function limpar(i) {
    const b = E.buracos[i];
    if (!b) return;
    E.buracos[i] = null;
    b.el.remove();
    celulas[i].querySelector('.puxe')?.remove();
  }

  function cicloAparicoes() {
    if (E.estado !== 'jogo') return;
    aparecer();
    const emSuper = Date.now() < E.superAte;
    depois(emSuper ? cfg.ritmo * 0.55 : cfg.ritmo, cicloAparicoes);
  }

  // ---------- toques ----------
  function fatorPoder() {
    const agora = Date.now();
    const martelo = tem('martelo') && E.segundos < 10 ? 2 : 1;
    return (agora < E.superAte ? 3 : agora < E.poderAte ? 2 : 1) * martelo;
  }

  function martelar(i, erro = false) {
    // na coluna da direita o martelo vem do outro lado, para não sair da tela
    efeitoNa(i, i % 3 === 2 ? img('martelo-esq', 'martelada esq') : img('martelo', 'martelada'), 470);
    efeitoNa(i, el('i', { class: 'impacto' + (erro ? ' erro' : '') }), 400);
    grade.classList.remove('treme');
    void grade.offsetWidth;
    grade.classList.add('treme');
  }

  // `direto`: teclado, que não arrasta. Cachorro pelo teclado é coletado com Enter.
  function tocar(i, direto = false) {
    const b = E.buracos[i];
    if (E.estado !== 'jogo' || E.pausa) return;
    if (!b || b.batido || b.coletado) {
      martelar(i);
      efeito('toc');
      return;
    }
    if (b.tipo === 'tijolo' || b.tipo === 'gaia') {
      if (direto) coletar(i);
      return;
    }
    if (b.tipo === 'monstro') return baterMonstro(i);
    baterAdeneco(i);
  }

  function baterMonstro(i) {
    const b = E.buracos[i];
    b.batido = true;
    b.ate = Date.now() + 380;
    b.el.classList.add('batido');
    martelar(i);
    E.combo += 1;
    E.melhor = Math.max(E.melhor, E.combo);
    E.acertos += 1;
    const ganho = multCombo(E.combo) * fatorPoder();
    E.pontos += ganho;
    faiscas(i, 'nuvem');
    faiscas(i, 'estrela');
    pop(i, '+' + ganho);
    efeito('bonk');
    depois(30, () => efeito('monstro'));
    if (E.combo >= 3) efeito('combo', E.combo);
    vibrar(15);
    const c = COMBOS[E.combo];
    if (c) banner(c[0], c[1]);
    animarCombo();
    hud();
    checarMeta();
  }

  function baterAdeneco(i) {
    const b = E.buracos[i];
    b.batido = true;
    b.ate = Date.now() + 460;
    b.el.src = IMG('adeneco-tonto');
    b.el.classList.add('batido');
    martelar(i, true);
    const perdeu = E.combo >= 3;
    E.pontos = Math.max(0, E.pontos - 3);
    E.combo = 0;
    pop(i, '−3', 'ruim');
    if (!E.levouCapacete) {
      E.levouCapacete = true;
      efeitoNa(i, el('span', { class: 'balao', text: 'Ainda bem que eu tava de capacete!' }), 1650);
    }
    if (perdeu) banner('Combo perdido!', 'Não bata no Adeneco', 'ruim');
    pagina.classList.add('flash');
    depois(260, () => pagina.classList.remove('flash'));
    efeito('bonk');
    efeito('erro');
    vibrar([40, 30, 60]);
    hud();
  }

  function espantarMonstros(carimbo) {
    const alvos = E.buracos.map((b, i) => (b && b.tipo === 'monstro' && !b.batido ? i : -1)).filter(i => i >= 0);
    const bonus = carimbo ? 3 : 2;
    alvos.forEach(i => {
      const b = E.buracos[i];
      b.batido = true;
      b.ate = Date.now() + 380;
      b.el.classList.add('batido');
      faiscas(i, 'nuvem');
      pop(i, '+' + bonus);
      if (carimbo) efeitoNa(i, el('span', { class: 'carimbo', text: 'APROVADO' }), 900);
    });
    E.pontos += alvos.length * bonus;
    E.acertos += alvos.length;
    E.combo += alvos.length;
    E.melhor = Math.max(E.melhor, E.combo);
    return alvos.length;
  }

  function coletar(i) {
    const b = E.buracos[i];
    if (!b || b.coletado || E.estado !== 'jogo') return;
    b.coletado = true;
    b.ate = Date.now() + 1000;
    b.el.classList.add('coletado');
    celulas[i].querySelector('.puxe')?.remove();
    const gaia = b.tipo === 'gaia';
    efeitoNa(i, el('i', { class: 'aura' + (gaia ? ' lilas' : '') }), 1000);
    faiscas(i, gaia ? 'brilho' : 'chave');
    vibrar([20, 30, 20]);
    if (gaia) {
      const ganho = 20 * fatorPoder();
      E.pontos += ganho;
      E.superAte = Date.now() + 5000;
      const n = espantarMonstros(true);
      pop(i, `+${ganho}`, 'bom');
      banner('Aprovado.', `relógio parado e pontos x3 por 5 s${n ? ` · ${n} monstrinho${n > 1 ? 's' : ''} aprovado${n > 1 ? 's' : ''}` : ''}`, 'super');
      efeito('gaia');
    } else {
      const ganho = 10 * fatorPoder();
      E.pontos += ganho;
      E.resta += 3;
      E.poderAte = Date.now() + 5000;
      const n = espantarMonstros(false);
      pop(i, `+${ganho} · +3 s`, 'bom');
      banner('Tijolo turbinado!', `+${ganho} e +3 s · ${n ? `${n} monstrinho${n > 1 ? 's' : ''} espantado${n > 1 ? 's' : ''} · ` : ''}pontos em dobro por 5 s`, 'ouro');
      efeito('tijolo');
    }
    animarCombo();
    hud();
    checarMeta();
  }

  // na fase, bater a meta não encerra: dá para buscar mais estrelas até o tempo acabar
  let avisouMeta = false;
  function checarMeta() {
    if (rapida || avisouMeta || E.acertos < cfg.meta) return;
    avisouMeta = true;
    banner('Meta batida!', 'Continue para ganhar mais estrelas');
  }

  // A célula sob o dedo: o boneco sai do buraco para cima, então a área de toque sobe junto.
  function celulaNoPonto(x, y, soOcupadas = true) {
    let melhor = -1;
    let dist = Infinity;
    celulas.forEach((c, i) => {
      const b = E.buracos[i];
      if (soOcupadas && (!b || b.batido || b.coletado)) return;
      const r = c.getBoundingClientRect();
      const folga = r.width * 0.1;
      const topo = r.top - r.width * 0.55;
      if (x < r.left - folga || x > r.right + folga || y < topo || y > r.bottom + folga) return;
      const cx = r.left + r.width / 2;
      const cy = (topo + r.bottom) / 2;
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d < dist) { dist = d; melhor = i; }
    });
    return melhor;
  }

  let arrasto = null;
  grade.addEventListener('pointerdown', ev => {
    if (E.estado !== 'jogo' || E.pausa) return;
    let i = celulaNoPonto(ev.clientX, ev.clientY);
    if (i < 0) {
      i = celulaNoPonto(ev.clientX, ev.clientY, false);
      if (i >= 0) tocar(i);
      return;
    }
    const b = E.buracos[i];
    if (b.tipo === 'tijolo' || b.tipo === 'gaia') {
      arrasto = { i, y: ev.clientY, id: b.id };
      grade.setPointerCapture?.(ev.pointerId);
      return;
    }
    tocar(i);
  });
  grade.addEventListener('pointermove', ev => {
    if (!arrasto || arrasto.y - ev.clientY < 26) return;
    const { i, id } = arrasto;
    arrasto = null;
    if (E.buracos[i]?.id === id) coletar(i);
  });
  const soltou = () => {
    if (!arrasto) return;
    const { i, id } = arrasto;
    arrasto = null;
    const b = E.buracos[i];
    if (!b || b.id !== id || b.coletado) return;
    pop(i, 'Arraste pra cima!', 'bom');
    efeito('bip');
  };
  grade.addEventListener('pointerup', soltou);
  grade.addEventListener('pointercancel', soltou);

  // ---------- relógio, pausa, contagem ----------
  let tique = null;
  function relogioRoda() {
    tique = setInterval(() => {
      if (E.estado !== 'jogo' || E.pausa) return;
      if (Date.now() < E.superAte) return hud();
      E.resta -= 1;
      E.segundos += 1;
      if (E.resta === limitePressa) tocarMusica('fase', true);
      if (E.resta <= 0) return fim();
      hud();
    }, 1000);
  }

  function pausar() {
    if (E.estado !== 'jogo' || E.pausa) return;
    E.pausa = true;
    E.pausaDesde = Date.now();
    pararMusica();
    const veu = el('div', { class: 'veu' }, [
      el('div', { class: 'folha pausa' }, [
        el('i', { class: 'pegador' }),
        el('b', { text: 'Pausa' }),
        botao('Continuar', 'btn azul grande bloco', () => { veu.remove(); continuar(); }),
        botao('Sair da partida', 'btn branco bloco', () => ir(rapida ? '#/rapida' : '#/jornada')),
      ]),
    ]);
    pagina.append(veu);
  }
  function continuar() {
    const parado = Date.now() - E.pausaDesde;
    E.buracos.forEach(b => { if (b) b.ate += parado; });
    if (E.poderAte) E.poderAte += parado;
    if (E.superAte) E.superAte += parado;
    E.pausa = false;
    tocarMusica('fase', E.resta <= limitePressa);
  }
  // sair do app no meio (trocar de aba, bloquear a tela) pausa a partida
  const aoEsconder = () => { if (document.hidden) pausar(); };
  document.addEventListener('visibilitychange', aoEsconder);

  function contagem(n) {
    pagina.querySelector('.conta')?.remove();
    const aviso = rapida ? 'Faça o máximo em 60 segundos' : `Acerte ${cfg.meta} monstrinhos · não bata no Adeneco`;
    const c = el('div', { class: 'conta' }, [el('b', { text: n || 'Já!' }), el('small', { text: aviso })]);
    pagina.append(c);
    if (n === 0) {
      efeito('largada');
      depois(420, () => c.remove());
      E.estado = 'jogo';
      relogioRoda();
      cicloAparicoes();
      hud();
      return;
    }
    efeito('bip');
    depois(650, () => contagem(n - 1));
  }

  // ---------- fim ----------
  function fim() {
    E.estado = 'fim';
    E.resta = 0;
    clearInterval(tique);
    pararMusica();
    hud();
    const s = ler();
    let recorde = false;
    let premio = null;
    let etapaNova = 0; // a etapa que esta fase acabou de concluir, com prêmio novo
    const est = rapida ? 0 : estrelas(E.acertos, cfg.meta);
    const passou = rapida || est > 0;
    if (rapida) {
      if (E.pontos > s.recorde) { s.recorde = E.pontos; recorde = E.pontos > 0; }
    } else if (passou) {
      const antes = s.fases[cfg.n] || 0;
      s.fases[cfg.n] = Math.max(antes, est);
      if (est === 3 && antes < 3) {
        const a = AJUDAS[Math.floor(Math.random() * AJUDAS.length)];
        s.ajudas[a.id] = (s.ajudas[a.id] || 0) + 1;
        premio = a.nome;
      }
      const k = numEtapa(cfg.n);
      if (!s.premios[k] && fasesDaEtapa(k).every(f => s.fases[f])) {
        s.premios[k] = Date.now();
        etapaNova = k;
      }
    }
    s.partidas = (s.partidas || 0) + 1;
    gravar(s);
    atualizarLead();
    efeito(passou ? 'fanfarra' : 'derrota');
    // o cenário da fase desfoca e some o placar; depois da vinheta entra a música do menu
    pagina.classList.add('acabou');
    depois(1300, () => tocarMusica('menu'));

    const numeros = rapida
      ? [[E.pontos, 'pontos'], [E.acertos, 'monstrinhos'], ['x' + E.melhor, 'melhor combo']]
      : [[`${E.acertos}/${cfg.meta}`, 'monstrinhos'], [E.pontos, 'pontos'], ['x' + E.melhor, 'melhor combo']];
    const titulo = rapida ? (recorde ? 'Novo recorde!' : 'Fim da partida') : passou ? 'Fase completa!' : 'Quase!';
    const frase = !passou ? 'Faltou pouco!' : est === 3 || recorde ? 'Você mandou muito bem!' : 'Você mandou bem!';
    const botoes = [];
    // fechou a etapa: o botão principal leva para a página de parabéns e o prêmio
    if (etapaNova) botoes.push(botao('Receber meu prêmio', 'btn amarelo grande bloco pulsa', () => ir(`#/parabens/${etapaNova}`)));
    else if (!rapida && passou && cfg.n < TOTAL_FASES) botoes.push(botao('Próxima fase', 'btn azul grande bloco pulsa', () => ir(`#/jornada/${cfg.n + 1}`)));
    botoes.push(botao('Jogar de novo', `btn ${!rapida && passou ? 'branco' : 'azul grande pulsa'} bloco`,
      () => ir(`#/partida/${rapida ? 'rapida' : cfg.n}?${Date.now()}`)));
    // stop motion: o Adeneco alterna entre os braços para cima e apontando para o jogador
    const heroi = passou
      ? el('div', { class: 'res-heroi alterna' }, [img('adeneco-festa', 'quadro a'), img('adeneco-aponta', 'quadro b')])
      : el('div', { class: 'res-heroi' }, [img('adeneco-tonto', 'quadro')]);
    const veu = el('div', { class: 'veu' }, [
      el('div', { class: 'folha resultado' }, [
        heroi,
        etapaNova ? el('span', { class: 'chip-ouro res-chip', text: etapaNova === ETAPAS.length ? 'JORNADA CONCLUÍDA!' : `ETAPA ${etapaNova} CONCLUÍDA!` }) : null,
        el('b', { class: 'res-tit', text: titulo }),
        el('small', { class: 'res-frase', text: frase }),
        rapida ? null : el('div', { class: 'res-estrelas' }, [1, 2, 3].map(k => {
          const e = el('i', { class: k <= est ? 'on' : '', text: '★' });
          e.style.setProperty('--k', k);
          return e;
        })),
        el('div', { class: 'res-numeros' }, numeros.map(([v, t]) => el('span', {}, [el('b', { text: String(v) }), el('small', { text: t })]))),
        premio ? el('div', { class: 'premio', text: `3 estrelas! Você ganhou uma ajuda: ${premio}` }) : null,
        // partida rápida: entra no ranking compartilhado (pede o nome na primeira vez)
        rapida ? caixaRanking(el('div', { class: 'res-ranking' })) : null,
        !rapida && !passou ? el('div', { class: 'premio', text: `Faltaram ${cfg.meta - E.acertos} monstrinhos para passar de fase` }) : null,
        ...botoes,
        el('div', { class: 'res-links' }, [
          botao(rapida ? 'Ver ranking' : 'Jornada', 'link', () => ir(rapida ? '#/ranking' : '#/jornada')),
          botao('Início', 'link', () => ir('#/')),
        ]),
      ]),
    ]);
    depois(500, () => pagina.append(veu));
  }

  hud();
  // a música da fase entra junto com a contagem, não depois dela
  tocarMusica('fase');
  depois(150, () => contagem(3));

  // limpeza quando a rota muda
  return () => {
    E.estado = 'fim';
    clearInterval(tique);
    timers.forEach(clearTimeout);
    timers.clear();
    pararMusica('fase');
    document.removeEventListener('visibilitychange', aoEsconder);
  };
}
