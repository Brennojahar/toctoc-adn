import { TOTAL_FASES } from './dados.js';

const CHAVE = 'adn-toctoc';
// Mudou o número de fases por etapa: progresso de uma versão anterior não vale mais (recorde, som e ajudas ficam).
const VERSAO = 2;
// `lead`: o cadastro da entrada (js/cadastro.js). `partidas` e `corretor` vão para o cadastro no banco.
// `indicacoes`: o que a pessoa fez no campo de indicações do prêmio final ({ estado: 'pulou' | 'pendente' | 'enviado', total }).
const PADRAO = () => ({ versao: VERSAO, fases: {}, premios: {}, codigo: null, recorde: 0, ajudas: { tempo: 2, martelo: 1, ouro: 3 }, som: true, jogador: null, nome: '', lead: null, partidas: 0, corretor: false, utm: null, indicacoes: null });

export function ler() {
  const p = PADRAO();
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) || '{}');
    const junto = { ...p, ...s, ajudas: { ...p.ajudas, ...(s.ajudas || {}) } };
    if (s.versao !== VERSAO) {
      junto.versao = VERSAO;
      junto.fases = {};
      junto.premios = {};
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
