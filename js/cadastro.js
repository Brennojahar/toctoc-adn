// Cadastro na entrada (captação de leads): antes da primeira partida, a pessoa deixa nome, WhatsApp, e-mail e cidade,
// escolhe o monstrinho que mais atrapalha e responde perguntas de um toque. Tudo vai para o banco (supabase/leads.sql).
// Depois de enviado, o aparelho guarda só o id secreto do cadastro e o primeiro nome (sugerido no ranking).
// O jogo também conta ao banco o que a pessoa fez: etapas, fases, recorde, partidas e o clique no corretor.
import { CADASTRO, MONSTROS, cenarioDaFase } from './dados.js';
import { ler, gravar, faseAtual, idJogador, novoId } from './salvo.js';
import { chamar } from './banco.js';
import { efeito } from './som.js';
import { el, img, botao, ICONES } from './util.js';

export const precisaCadastro = () => !ler().lead;

// De qual anúncio a pessoa veio (?utm_source=… no link do jogo). Vale o da primeira visita.
export function guardarOrigem() {
  const q = new URLSearchParams(location.search);
  const utm = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) if (q.get(k)) utm[k] = q.get(k).slice(0, 100);
  const s = ler();
  if (!s.utm && Object.keys(utm).length) {
    s.utm = utm;
    gravar(s);
  }
}

// Manda o cadastro ao banco. Sem internet, ele espera no aparelho e vai na próxima vez que o jogo abrir.
export async function enviarLead() {
  const s = ler();
  const lead = s.lead;
  if (!lead || lead.enviado || !lead.dados) return;
  const utm = s.utm || {};
  try {
    await chamar('registrar_lead_adn', {
      p_id: lead.id,
      p_jogador: idJogador(s),
      ...lead.dados,
      p_utm_source: utm.utm_source || null,
      p_utm_medium: utm.utm_medium || null,
      p_utm_campaign: utm.utm_campaign || null,
    });
  } catch {
    return;
  }
  const s2 = ler();
  s2.lead = { id: lead.id, primeiroNome: lead.primeiroNome, enviado: true };
  gravar(s2);
  atualizarLead();
  enviarIndicacoes();
}

// Manda as indicações do prêmio final (supabase/indicacoes.sql). Sem internet, ou com o cadastro ainda na fila,
// elas esperam no aparelho. Depois de enviadas, os nomes e telefones saem do aparelho e fica só a conta.
export async function enviarIndicacoes() {
  const s = ler();
  const ind = s.indicacoes;
  if (ind?.estado !== 'pendente' || !s.lead?.enviado) return;
  try {
    await chamar('registrar_indicacoes_adn', { p_lead: s.lead.id, p_indicacoes: ind.lista });
  } catch {
    return;
  }
  const s2 = ler();
  s2.indicacoes = { estado: 'enviado', total: ind.lista.length };
  gravar(s2);
}

// Conta ao banco o que a pessoa fez no jogo (no fim de cada partida e no clique no corretor).
export function atualizarLead() {
  const s = ler();
  if (!s.lead?.enviado) return;
  chamar('atualizar_lead_adn', {
    p_id: s.lead.id,
    p_etapas: Object.keys(s.premios).length,
    p_fases: Object.values(s.fases).filter(Boolean).length,
    p_recorde: s.recorde,
    p_partidas: s.partidas,
    p_corretor: s.corretor,
  }).catch(() => {});
}

export const digitos = txt => (txt || '').replace(/\D/g, '');
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// (16) 99999-9999 enquanto digita.
export function mascara(txt) {
  const d = digitos(txt).slice(0, 11);
  if (d.length < 3) return d.length ? `(${d}` : '';
  const n = d.slice(2);
  const corte = n.length > 8 ? 5 : 4;
  return `(${d.slice(0, 2)}) ${n.length > corte ? `${n.slice(0, corte)}-${n.slice(corte)}` : n}`;
}

// ---------- as três telas do cadastro ----------
export function cadastro(raiz, { ir, depois }) {
  if (!precisaCadastro()) {
    location.replace(depois());
    return;
  }
  const r = {}; // as respostas, já com os nomes dos parâmetros da função do banco
  let passo = 1;
  const p = el('div', { class: 'pagina cadastro' });
  const contador = el('span', { class: 'chip' });
  const corpo = el('section', { class: 'card cad-card' });
  const voltar = botao([], 'redondo', () => (passo > 1 ? mostrar(passo - 1) : ir('#/')), 'Voltar');
  voltar.innerHTML = ICONES.voltar;
  p.append(
    img(`fundo-${cenarioDaFase(faseAtual()).id}`, 'fundo-cheio borrado'),
    el('header', { class: 'topo' }, [voltar, contador]),
    corpo,
  );
  raiz.append(p);

  function mostrar(n) {
    passo = n;
    contador.textContent = `${n} de 3`;
    corpo.replaceChildren(img('adeneco', 'topete'), ...[quem, monstro, perguntas][n - 1]().filter(Boolean));
    p.scrollTop = 0;
  }

  // 1 · quem vai jogar
  function quem() {
    const campo = (rotulo, attrs, valor) => {
      const input = el('input', attrs);
      input.value = valor || '';
      return el('label', { class: 'campo' }, [el('span', { text: rotulo }), input]);
    };
    const nome = campo('Seu nome', { type: 'text', autocomplete: 'name', maxlength: '60', enterkeyhint: 'next' }, r.p_nome);
    const whats = campo('WhatsApp com DDD', { type: 'tel', autocomplete: 'tel-national', inputmode: 'numeric', placeholder: '(16) 99999-9999', enterkeyhint: 'next' }, mascara(r.p_whatsapp));
    const email = campo('E-mail', { type: 'email', autocomplete: 'email', maxlength: '120', placeholder: 'voce@email.com', enterkeyhint: 'next' }, r.p_email);
    const lista = el('select', {}, [
      el('option', { value: '', text: 'Escolha a cidade' }),
      ...CADASTRO.cidades.map(c => el('option', { value: c, text: c })),
      el('option', { value: 'Outra', text: 'Outra cidade' }),
    ]);
    lista.value = r.p_cidade || '';
    const cidade = el('label', { class: 'campo' }, [el('span', { text: 'Em que cidade quer morar?' }), lista]);
    const aceite = (conteudo, marcado) => {
      const caixa = el('input', { type: 'checkbox' });
      caixa.checked = Boolean(marcado);
      return el('label', { class: 'aceite' }, [caixa, el('span', {}, conteudo)]);
    };
    const politica = el('a', { href: CADASTRO.politica, target: '_blank', rel: 'noopener', text: 'Política de Privacidade' });
    const privacidade = aceite(['Concordo com a ', politica, ' e tenho 18 anos ou mais.'], r.p_aceite_privacidade);
    const novidades = aceite(['Desejo receber novidades ADN.'], r.p_aceite_novidades);
    const erro = el('small', { class: 'cad-erro', role: 'alert' });
    const form = el('form', { class: 'cad-form', novalidate: '' }, [
      nome, whats, email, cidade, privacidade, novidades, erro,
      el('button', { class: 'btn azul grande bloco', type: 'submit', text: 'Continuar' }),
    ]);
    const entrada = rotulo => rotulo.querySelector('input, select');
    entrada(whats).addEventListener('input', ev => { ev.target.value = mascara(ev.target.value); });
    // corrigiu um campo: a mensagem passa para o próximo que falta (ou some)
    const desmarcar = ev => {
      ev.target.closest('.invalido')?.classList.remove('invalido');
      erro.textContent = form.querySelector('.invalido')?.dataset.erro || '';
    };
    form.addEventListener('input', desmarcar);
    form.addEventListener('change', desmarcar);
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      Object.assign(r, {
        p_nome: entrada(nome).value.replace(/\s+/g, ' ').trim(),
        p_whatsapp: digitos(entrada(whats).value),
        p_email: entrada(email).value.trim().toLowerCase(),
        p_cidade: lista.value,
        p_aceite_privacidade: entrada(privacidade).checked,
        p_aceite_novidades: entrada(novidades).checked,
      });
      const falhas = [
        [nome, r.p_nome.length < 2 || !/\p{L}/u.test(r.p_nome), 'Escreva o seu nome.'],
        [whats, !/^\d{10,11}$/.test(r.p_whatsapp), 'Confira o WhatsApp, com o DDD.'],
        [email, !EMAIL.test(r.p_email), 'Confira o e-mail.'],
        [cidade, !r.p_cidade, 'Escolha a cidade.'],
        [privacidade, !r.p_aceite_privacidade, 'Para jogar, marque o aceite da Política de Privacidade.'],
      ].filter(([, falhou]) => falhou);
      form.querySelectorAll('.invalido').forEach(x => x.classList.remove('invalido'));
      if (falhas.length) {
        falhas.forEach(([rotulo, , msg]) => {
          rotulo.classList.add('invalido');
          rotulo.dataset.erro = msg;
        });
        erro.textContent = falhas[0][2];
        efeito('bip');
        entrada(falhas[0][0]).focus();
        return;
      }
      erro.textContent = '';
      efeito('confirma');
      mostrar(2);
    });
    return [
      el('span', { class: 'chip-ouro', text: 'ANTES DE JOGAR' }),
      el('h1', { text: 'Quem vai jogar?' }),
      el('p', { text: 'Preencha para entrar no jogo. É rapidinho.' }),
      form,
      CADASTRO.aviso ? el('small', { class: 'cad-aviso', text: CADASTRO.aviso }) : null,
    ];
  }

  // 2 · o monstrinho que mais atrapalha
  function monstro() {
    let escolheu = false;
    const grade = el('div', { class: 'cad-monstros' }, Object.entries(MONSTROS).map(([id, m]) => {
      const b = botao([img(`m-${id}`), el('small', { text: m.nome })], 'cad-monstro' + (r.p_monstro === id ? ' on' : ''), () => {
        if (escolheu) return;
        escolheu = true;
        r.p_monstro = id;
        grade.querySelectorAll('.on').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        setTimeout(() => passo === 2 && mostrar(3), 320);
      }, m.nome);
      return b;
    }));
    return [
      el('span', { class: 'chip-ouro', text: 'TOQUE EM UM' }),
      el('h1', { text: 'Qual desses monstrinhos mais te atrapalha hoje?' }),
      grade,
    ];
  }

  // 3 · perguntas de um toque
  function perguntas() {
    const erro = el('small', { class: 'cad-erro', role: 'alert' });
    const blocos = CADASTRO.perguntas.map(q => {
      const chave = `p_${q.id}`;
      const opcoes = el('div', { class: 'opcoes', role: 'radiogroup', 'aria-label': q.titulo });
      const bloco = el('div', { class: 'pergunta' }, [el('b', { text: q.titulo }), opcoes]);
      bloco.dataset.chave = chave;
      q.opcoes.forEach(([valor, texto]) => {
        const b = botao(texto, 'opcao' + (r[chave] === valor ? ' on' : ''), () => {
          r[chave] = valor;
          for (const x of opcoes.children) {
            x.classList.toggle('on', x === b);
            x.setAttribute('aria-checked', String(x === b));
          }
          bloco.classList.remove('falta');
          if (!blocos.some(x => x.classList.contains('falta'))) erro.textContent = '';
        });
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(r[chave] === valor));
        opcoes.append(b);
      });
      return bloco;
    });
    const entrar = botao('Começar a jogar', 'btn azul grande bloco pulsa', () => {
      const faltam = blocos.filter(b => !r[b.dataset.chave]);
      if (faltam.length) {
        faltam.forEach(b => b.classList.add('falta'));
        erro.textContent = faltam.length > 1 ? `Faltam ${faltam.length} respostas.` : 'Falta uma resposta.';
        efeito('bip');
        faltam[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }
      concluir();
    });
    return [
      el('span', { class: 'chip-ouro', text: `SÓ MAIS ${CADASTRO.perguntas.length} TOQUES` }),
      el('h1', { text: 'Pra gente te conhecer melhor' }),
      ...blocos,
      erro,
      entrar,
    ];
  }

  function concluir() {
    const s = ler();
    s.lead = { id: novoId(), primeiroNome: r.p_nome.split(' ')[0].slice(0, 20), enviado: false, dados: { ...r } };
    gravar(s);
    enviarLead();
    location.replace(depois());
  }

  mostrar(1);
}
