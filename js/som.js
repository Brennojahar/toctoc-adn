// Efeitos sintetizados na hora (WebAudio) e duas musiquinhas 8-bit em loop: a do menu e a da fase.
import { ler, gravar } from './salvo.js';

let ctx = null;
let mestre = null;
let ligado = ler().som;
let liberado = false; // o navegador só libera o áudio depois do primeiro toque
let desejada = null; // a trilha que deveria estar tocando agora, para retomar quando o áudio liberar

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    mestre = ctx.createGain();
    mestre.gain.value = 0.9;
    mestre.connect(ctx.destination);
    carregarAmostras();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Sons gravados (Seed Audio): o latido do Tijolo e o "Aprovado." na voz da Gaia.
const AMOSTRAS = { latido: 'a/sons/latido.mp3', aprovado: 'a/sons/gaia-aprovado.mp3' };
const buffers = {};
function carregarAmostras() {
  Object.entries(AMOSTRAS).forEach(([nome, url]) => {
    fetch(url)
      .then(r => r.arrayBuffer())
      .then(b => new Promise((ok, erro) => ctx.decodeAudioData(b, ok, erro)))
      .then(buf => { buffers[nome] = buf; })
      .catch(() => {});
  });
}

// Toca uma amostra no instante t e devolve a duração (0 se ainda não carregou).
function amostra(nome, t, vol = 1) {
  const buf = buffers[nome];
  if (!buf) return 0;
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = vol;
  s.connect(g).connect(mestre);
  s.start(t);
  return buf.duration;
}

// Abaixa a música enquanto uma fala ou um latido toca.
function abafar(seg) {
  if (!musica) return;
  const g = musica.saida.gain;
  const v = musica.tr.volume;
  const t = ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(v * 0.25, t + 0.06);
  g.setValueAtTime(v * 0.25, t + seg);
  g.linearRampToValueAtTime(v, t + seg + 0.35);
}

export function destravar() {
  if (!ligado || !audio()) return;
  liberado = true;
  if (desejada && !musica) iniciar(desejada.nome, desejada.pressa);
}

export const somLigado = () => ligado;

export function alternarSom() {
  ligado = !ligado;
  const s = ler();
  s.som = ligado;
  gravar(s);
  if (ligado) destravar();
  else parar();
  return ligado;
}

function tom(freq, t, dur, tipo = 'square', vol = 0.1, freqFim, destino = mestre) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(destino);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let bufRuido = null;
function ruido(t, dur, vol, freq, tipoFiltro = 'bandpass', destino = mestre, q = 1) {
  if (!bufRuido || bufRuido.sampleRate !== ctx.sampleRate) {
    bufRuido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = bufRuido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource();
  s.buffer = bufRuido;
  const f = ctx.createBiquadFilter();
  f.type = tipoFiltro;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(destino);
  s.start(t);
  s.stop(t + dur + 0.02);
}

// Um "au!" curtinho: tom que cai + sopro filtrado.
function latido(t, alt = 1) {
  tom(520 * alt, t, 0.12, 'sawtooth', 0.09, 190 * alt);
  tom(260 * alt, t, 0.1, 'square', 0.05, 120 * alt);
  ruido(t, 0.09, 0.35, 900 * alt, 'bandpass', mestre, 2);
}

export function efeito(nome, n = 0) {
  if (!ligado) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  switch (nome) {
    case 'clique':
      tom(620, t, 0.05, 'sine', 0.12, 940);
      tom(1240, t + 0.012, 0.035, 'triangle', 0.04);
      break;
    case 'confirma':
      tom(660, t, 0.07, 'triangle', 0.11);
      tom(990, t + 0.06, 0.12, 'triangle', 0.11);
      break;
    case 'abre':
      tom(420, t, 0.14, 'sine', 0.09, 840);
      tom(1260, t + 0.08, 0.08, 'triangle', 0.04);
      break;
    case 'pop':
      tom(340, t, 0.08, 'sine', 0.1, 720);
      break;
    case 'toc':
      // martelada no chão, sem ninguém no buraco
      tom(820, t, 0.05, 'sine', 0.16, 420);
      ruido(t, 0.035, 0.35, 1300, 'bandpass', mestre, 3);
      break;
    case 'bonk':
      tom(240, t, 0.11, 'square', 0.16, 75);
      ruido(t, 0.05, 0.45, 1900);
      tom(950, t + 0.01, 0.05, 'triangle', 0.08);
      break;
    case 'monstro':
      tom(170, t + 0.03, 0.24, 'sawtooth', 0.1, 85);
      ruido(t + 0.03, 0.2, 0.3, 520, 'lowpass');
      break;
    case 'combo': {
      const base = 523 * 1.06 ** Math.min(n, 24);
      [1, 1.25, 1.5].forEach((m, i) => tom(base * m, t + i * 0.045, 0.15, 'square', 0.06));
      break;
    }
    case 'erro':
      tom(130, t, 0.34, 'sawtooth', 0.18, 98);
      ruido(t, 0.1, 0.45, 320, 'lowpass');
      [[330, 0.38], [311, 0.56], [294, 0.74]].forEach(([f, d]) => tom(f, t + d, 0.16, 'square', 0.07, f * 0.97));
      tom(262, t + 0.92, 0.45, 'square', 0.08, 220);
      break;
    case 'tijolo': {
      // latido feliz de verdade; se o arquivo ainda não carregou, vai o latido sintetizado
      const d = amostra('latido', t);
      if (!d) { latido(t); latido(t + 0.16, 1.08); }
      [988, 1319, 1568, 1976].forEach((f, i) => tom(f, t + 0.28 + i * 0.05, 0.2, 'triangle', 0.06));
      abafar(Math.max(d, 0.5));
      break;
    }
    case 'gaia': {
      // carimbo seco, a Gaia diz "Aprovado." e um acorde abre depois da fala
      tom(90, t, 0.18, 'sine', 0.35, 45);
      ruido(t, 0.08, 0.6, 700, 'lowpass');
      const d = amostra('aprovado', t + 0.12);
      const depois = t + 0.12 + (d || 0.04);
      [[523, 659, 784], [587, 740, 880], [659, 831, 988]].forEach((ac, i) =>
        ac.forEach(f => tom(f, depois + i * 0.12, i === 2 ? 0.7 : 0.14, 'triangle', 0.05)));
      abafar((d || 0) + 0.5);
      break;
    }
    case 'bip':
      tom(660, t, 0.12, 'square', 0.09);
      break;
    case 'largada':
      tom(990, t, 0.3, 'square', 0.11);
      break;
    case 'premio':
      // fanfarra com brilho por cima
      [523, 659, 784, 1047].forEach((f, i) => tom(f, t + i * 0.1, i === 3 ? 0.6 : 0.14, 'square', 0.08));
      [1568, 1976, 2349, 2637, 3136].forEach((f, i) => tom(f, t + 0.42 + i * 0.06, 0.25, 'triangle', 0.045));
      break;
    case 'fanfarra':
      [523, 659, 784, 1047].forEach((f, i) => tom(f, t + i * 0.11, i === 3 ? 0.5 : 0.14, 'square', 0.09));
      break;
    case 'derrota':
      [392, 370, 349, 330].forEach((f, i) => tom(f, t + i * 0.18, i === 3 ? 0.5 : 0.16, 'square', 0.07));
      break;
  }
}

export function vibrar(padrao = 12) {
  try { navigator.vibrate?.(padrao); } catch {}
}

// ---------- músicas ----------
// Colcheias. Baixo e acordes andam por compasso (8 colcheias); a melodia tem o próprio tamanho.
const TRILHAS = {
  // fase: Dó, Lá menor, Fá, Sol, rápida e com pulso de 8-bit
  fase: {
    bpm: 132, bpmPressa: 152, volume: 0.45,
    lead: ['square', 0.032], acordes: ['square', 0.022], baixo: ['triangle', 0.15],
    baixoNas: { 0: 1, 2: 1, 4: 2, 6: 1 }, acordeNas: [2, 6],
    notasBaixo: [131, 110, 87, 98],
    notasAcorde: [[262, 330, 392], [220, 262, 330], [175, 220, 262], [196, 247, 294]],
    melodia: [
      659, 784, 1047, 784, 659, 784, 880, 784,
      659, 0, 880, 1047, 988, 880, 659, 0,
      698, 880, 1047, 880, 784, 698, 659, 587,
      587, 784, 988, 1175, 1047, 988, 784, 0,
    ],
  },
  // menu: Fá, Ré menor, Si bemol, Dó, mais calma, com baixo de bossa
  menu: {
    bpm: 104, volume: 0.42,
    lead: ['triangle', 0.07], acordes: ['sine', 0.035], baixo: ['sine', 0.17],
    baixoNas: { 0: 1, 3: 1.5, 4: 1, 6: 1.5 }, acordeNas: [1, 3, 5],
    notasBaixo: [175, 147, 117, 131],
    notasAcorde: [[349, 440, 523], [294, 349, 440], [233, 294, 349], [262, 330, 392]],
    melodia: [
      523, 0, 440, 523, 698, 0, 659, 523,
      587, 0, 698, 0, 880, 784, 698, 587,
      466, 587, 698, 587, 784, 698, 587, 466,
      523, 659, 784, 0, 659, 0, 523, 0,
      440, 523, 698, 880, 784, 698, 523, 0,
      587, 698, 880, 698, 659, 587, 440, 0,
      466, 0, 587, 698, 932, 880, 784, 698,
      659, 784, 1047, 0, 784, 659, 523, 0,
    ],
  },
};

let musica = null;

export function tocarMusica(nome = 'fase', pressa = false) {
  desejada = { nome, pressa };
  if (!ligado || !liberado) return;
  if (musica && musica.nome === nome) {
    musica.pressa = pressa;
    return;
  }
  iniciar(nome, pressa);
}

function iniciar(nome, pressa) {
  const a = audio();
  if (!a) return;
  if (musica) parar(0.12);
  const tr = TRILHAS[nome];
  const saida = a.createGain();
  // começa no volume cheio, na hora: sem rampa de entrada, que soava como atraso
  saida.gain.setValueAtTime(tr.volume, a.currentTime);
  saida.connect(mestre);
  musica = { nome, tr, saida, passo: 0, prox: a.currentTime + 0.03, pressa, timer: null };
  const m = musica;
  const agendar = () => {
    if (musica !== m) return;
    const colcheia = 60 / (m.pressa && tr.bpmPressa ? tr.bpmPressa : tr.bpm) / 2;
    while (m.prox < a.currentTime + 0.25) {
      const compasso = Math.floor(m.passo / 8) % tr.notasBaixo.length;
      const p = m.passo % 8;
      const t = m.prox;
      const mb = tr.baixoNas[p];
      if (mb) tom(tr.notasBaixo[compasso] * mb, t, colcheia * 0.9, tr.baixo[0], tr.baixo[1], undefined, saida);
      if (tr.acordeNas.includes(p)) tr.notasAcorde[compasso].forEach(f => tom(f * 2, t, colcheia * 0.8, tr.acordes[0], tr.acordes[1], undefined, saida));
      const nota = tr.melodia[m.passo % tr.melodia.length];
      if (nota) tom(nota, t, colcheia * 0.85, tr.lead[0], tr.lead[1], undefined, saida);
      ruido(t, 0.03, p % 2 ? 0.05 : 0.025, 8000, 'highpass', saida);
      m.passo++;
      m.prox += colcheia;
    }
    m.timer = setTimeout(agendar, 60);
  };
  agendar();
}

function parar(fade = 0.3) {
  if (!musica || !ctx) return;
  const m = musica;
  musica = null;
  clearTimeout(m.timer);
  m.saida.gain.cancelScheduledValues(ctx.currentTime);
  m.saida.gain.setValueAtTime(m.saida.gain.value, ctx.currentTime);
  m.saida.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fade);
  setTimeout(() => m.saida.disconnect(), fade * 1000 + 120);
}

// `so`: para só se for essa trilha (sair da partida não corta a música do menu que já está tocando)
export function pararMusica(so) {
  if (so && (musica?.nome ?? desejada?.nome) !== so) return;
  desejada = null;
  parar();
}
