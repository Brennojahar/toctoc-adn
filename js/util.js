import { efeito } from './som.js';

export const IMG = nome => `a/${nome}.webp`;

export function el(tag, props = {}, filhos = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const f of [].concat(filhos)) if (f) e.append(f);
  return e;
}

export function img(nome, classe = '') {
  const i = new Image();
  i.src = IMG(nome);
  i.alt = '';
  i.draggable = false;
  if (classe) i.className = classe;
  return i;
}

// Todo botão faz barulho: os de ação principal (azul) confirmam, os outros dão um clique.
export function botao(conteudo, classe, fn, rotulo) {
  const b = el('button', { class: classe, 'aria-label': rotulo });
  if (typeof conteudo === 'string') b.textContent = conteudo;
  else b.append(...[].concat(conteudo));
  b.addEventListener('click', ev => {
    efeito(/\b(azul|amarelo)\b/.test(b.className) ? 'confirma' : 'clique');
    fn(ev);
  });
  return b;
}

export const ICONES = {
  voltar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  somOn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  somOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="m17 9 5 6M22 9l-5 6"/></svg>',
  tranca: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="11" rx="3" fill="currentColor"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  whatsapp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 3.9 3.5 1.5.6 2 .7 2.7.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>',
  relogio: '<svg viewBox="0 0 48 48"><circle cx="24" cy="26" r="17" fill="#fff" stroke="#1f5bd6" stroke-width="5"/><path d="M24 17v10l6 4" fill="none" stroke="#12317a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="19" y="3" width="10" height="6" rx="2" fill="#ffc72c"/></svg>',
};
