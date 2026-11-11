import { TOTAL_FASES } from './dados.js';

const CHAVE = 'adn-toctoc';
// Mudou o desenho da jornada: progresso de uma versão anterior não vale mais (recorde, som e ajudas ficam).
// A exceção é a versão 2 (6 etapas de 2 fases), que é convertida para a 3 (3 etapas de 2 fases): ver `daVersao2`.
const VERSAO = 3;
// `lead`: o cadastro da entrada (js/cadastro.js). `partidas` e `corretor` vão para o cadastro no banco.
// `indicacoes`: o que a pessoa fez no campo de indicações do prêmio final ({ estado: 'pulou' | 'pendente' | 'enviado', total }).
const PADRAO = () => ({ versao: VERSAO, fases: {}, premios: {}, codigo: null, recorde: 0, ajudas: { tempo: 2, martelo: 1, ouro: 3 }, som: true, jogador: null, nome: '', lead: null, partidas: 0, corretor: false, utm: null, indicacoes: null });

// Da versão 2 para a 3, cada etapa antiga (2 fases no mesmo cenário) virou uma fase:
// quem tinha fechado a etapa antiga k já tem a fase k, com a melhor nota das duas.
// Uma etapa de agora vale como ganha quando as duas fases dela estão feitas.
function daVersao2(antigo, novo) {
  const fases = antigo.fases || {};
  const premios = antigo.premios || {};
  for (let n = 1; n <= 6; n++) {
    const a = fases[2 * n - 1];
    const b = fases[2 * n];
    if (!a || !b) break; // as fases abrem em ordem
    novo.fases[n] = Math.max(a, b);
  }
  for (let k = 1; k <= 3; k++) {
    if (novo.fases[2 * k - 1] && novo.fases[2 * k]) novo.premios[k] = premios[2 * k] || premios[2 * k - 1] || Date.now();
  }
}

export function ler() {
  const p = PADRAO();
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) || '{}');
    const junto = { ...p, ...s, ajudas: { ...p.ajudas, ...(s.ajudas || {}) } };
    if (s.versao !== VERSAO) {
      junto.versao = VERSAO;
      junto.fases = {};
      junto.premios = {};
      if (s.versao === 2) daVersao2(s, junto);
    }
    return junto;
  } catch {
    return p;
  }
}

export function gravar(s) {
  try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch {}
}

// A próxima fase que falta completar.
export function faseAtual(s = ler()) {
  let n = 1;
  while (s.fases[n] && n < TOTAL_FASES) n++;
  return n;
}

// Um uuid aleatório. O randomUUID só existe em https e localhost; pelo Wi-Fi (http://192.168…) monta à mão.
export function novoId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Cada aparelho é um jogador no ranking: um identificador aleatório criado na primeira vez.
export function idJogador(s = ler()) {
  if (!s.jogador) {
    s.jogador = novoId();
    gravar(s);
  }
  return s.jogador;
}

// Código que o jogador mostra ao corretor no prêmio final. Sem letras que se confundem (0/O, 1/I).
export function codigoPremio(s = ler()) {
  if (!s.codigo) {
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    s.codigo = 'TOCTOC-' + Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join('');
    gravar(s);
  }
  return s.codigo;
}
