import { TOTAL_FASES } from './dados.js';

const CHAVE = 'adn-toctoc';
// Mudou o número de fases por etapa: progresso de uma versão anterior não vale mais (recorde, som e ajudas ficam).
const VERSAO = 2;
const PADRAO = () => ({ versao: VERSAO, fases: {}, premios: {}, codigo: null, recorde: 0, ajudas: { tempo: 2, martelo: 1, ouro: 3 }, som: true, jogador: null, nome: '' });

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

// Cada aparelho é um jogador no ranking: um identificador aleatório criado na primeira vez.
export function idJogador(s = ler()) {
  if (!s.jogador) {
    s.jogador = crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 3) | 8).toString(16);
      });
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
