// O banco do jogo: o Supabase do projeto toctoc-adn (supabase/ranking.sql e supabase/leads.sql).
// Para ligar o jogo no banco da ADN, é trocar estes dois valores.
// A chave é a pública ("publishable"), feita para ficar no site: quem protege as tabelas é a RLS,
// e só as funções do banco escrevem, conferindo o que recebem.
const BANCO = 'https://cdhyhccfkbhrgtfmjlok.supabase.co/rest/v1';
const CHAVE = 'sb_publishable_itdPX8KdmTCo3qio7PUGTw_rbRsJAqP';

export async function pedir(caminho, opcoes = {}) {
  const r = await fetch(`${BANCO}/${caminho}`, {
    ...opcoes,
    headers: { apikey: CHAVE, 'Content-Type': 'application/json', ...(opcoes.headers || {}) },
  });
  if (!r.ok) throw new Error(`banco ${r.status}`);
  return r;
}

// Chama uma função do banco (as que gravam o ranking e o cadastro).
export const chamar = (funcao, parametros) => pedir(`rpc/${funcao}`, { method: 'POST', body: JSON.stringify(parametros) });
