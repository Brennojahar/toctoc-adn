// Ranking compartilhado da partida rápida, guardado no banco (js/banco.js, supabase/ranking.sql).
// Qualquer um lê a tabela; só a função registrar_pontos escreve, conferindo o nome e a pontuação.
import { ler, gravar, idJogador } from './salvo.js';
import { pedir } from './banco.js';
import { efeito } from './som.js';
import { el } from './util.js';

export async function listarRanking(limite = 50) {
  const r = await pedir(`ranking?select=jogador,nome,pontos&order=pontos.desc,atualizado.asc&limit=${limite}`);
  return r.json();
}

// Guarda a pontuação; o banco fica com a melhor de cada jogador.
export async function registrarPontos({ jogador, nome, pontos }) {
  await pedir('rpc/registrar_pontos', {
    method: 'POST',
    body: JSON.stringify({ p_jogador: jogador, p_nome: nome, p_pontos: pontos }),
  });
}

// Lugar de quem tem estes pontos: 1 + quantos jogadores têm mais.
export async function posicao(pontos) {
  const r = await pedir(`ranking?select=jogador&pontos=gt.${pontos}`, { headers: { Prefer: 'count=exact', Range: '0-0' } });
  const total = Number((r.headers.get('content-range') || '').split('/')[1]);
  return Number.isFinite(total) ? total + 1 : null;
}

// Nome como vai aparecer: sem espaços sobrando, até 20 letras.
export const limparNome = txt => (txt || '').replace(/\s+/g, ' ').trim().slice(0, 20);
export const nomeValido = txt => limparNome(txt).length >= 2;

// Campo para digitar o nome do ranking, usado na tela do ranking e no fim da partida rápida.
export function formNome({ texto = 'Como você quer aparecer no ranking?', botaoTexto = 'Salvar', aoSalvar }) {
  const campo = el('input', {
    type: 'text', maxlength: '20', placeholder: 'Seu nome ou apelido',
    autocomplete: 'nickname', enterkeyhint: 'done', 'aria-label': 'Seu nome no ranking',
  });
  // sem nome no ranking ainda, sugere o primeiro nome do cadastro (a pessoa confirma antes de aparecer)
  const s = ler();
  campo.value = s.nome || s.lead?.primeiroNome || '';
  const erro = el('small', { class: 'nome-erro' });
  const form = el('form', { class: 'form-nome' }, [
    el('b', { text: texto }),
    el('div', { class: 'nome-linha' }, [campo, el('button', { class: 'btn azul', type: 'submit', text: botaoTexto })]),
    erro,
  ]);
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const nome = limparNome(campo.value);
    if (!nomeValido(nome)) {
      erro.textContent = 'Use pelo menos 2 letras.';
      efeito('bip');
      return;
    }
    efeito('confirma');
    const s = ler();
    s.nome = nome;
    gravar(s);
    campo.blur();
    aoSalvar?.(nome);
  });
  return form;
}

// Manda o melhor resultado do jogador e mostra o lugar dele (no fim da partida rápida).
export function caixaRanking(caixa) {
  const enviar = async () => {
    const s = ler();
    if (!s.recorde) {
      caixa.replaceChildren(el('small', { text: 'Faça pontos para entrar no ranking.' }));
      return;
    }
    caixa.replaceChildren(el('small', { text: 'Enviando para o ranking…' }));
    try {
      await registrarPontos({ jogador: idJogador(s), nome: s.nome, pontos: s.recorde });
      const pos = await posicao(s.recorde);
      caixa.replaceChildren(el('b', { text: pos ? `Você está em ${pos}º lugar no ranking` : 'Pontos enviados ao ranking' }));
    } catch {
      caixa.replaceChildren(el('small', { text: 'Não deu para enviar ao ranking agora. Confira a internet.' }));
    }
  };
  if (ler().nome) enviar();
  else caixa.replaceChildren(formNome({ texto: 'Coloque seu nome no ranking', botaoTexto: 'Entrar', aoSalvar: enviar }));
  return caixa;
}
