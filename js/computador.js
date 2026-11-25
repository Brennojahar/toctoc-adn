// No computador, um aviso na entrada: o jogo foi feito pro celular (25/11/2026).
// Aparece uma vez por visita (some ao recarregar a página, volta numa visita nova).
const NO_COMPUTADOR = '(min-width: 761px) and (pointer: fine)';
const CHAVE = 'adn-toctoc-aviso-pc';
const LINK = 'https://brennojahar.github.io/toctoc-adn/';

export function avisoComputador() {
  if (!matchMedia(NO_COMPUTADOR).matches) return;
  try { if (sessionStorage.getItem(CHAVE)) return; } catch { /* sem armazenamento: mostra mesmo assim */ }

  const veu = document.createElement('div');
  veu.className = 'pc-entrada';
  veu.innerHTML = `<div class="pc-entrada-caixa" role="dialog" aria-modal="true" aria-labelledby="pc-entrada-titulo">
      <img class="pc-entrada-qr" src="a/qr-jogo.svg" width="176" height="176" alt="Código QR que abre o jogo no celular">
      <div class="pc-entrada-texto">
        <span class="pc-selo"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10.5 18.5h3"/></svg>Melhor no celular</span>
        <h2 id="pc-entrada-titulo">O Toc Toc, Adeneco! foi feito pro celular</h2>
        <p>Aponte a câmera do celular pro código: o jogo abre em tela cheia e você martela com o dedo.</p>
        <div class="pc-entrada-botoes">
          <button type="button" class="pc-entrada-jogar">Jogar aqui mesmo</button>
          <button type="button" class="pc-entrada-copiar">Copiar o link</button>
        </div>
      </div>
    </div>`;

  const fechar = () => {
    try { sessionStorage.setItem(CHAVE, '1'); } catch { /* tudo bem */ }
    document.removeEventListener('keydown', tecla);
    veu.classList.add('saindo');
    setTimeout(() => veu.remove(), 220);
  };
  const tecla = ev => { if (ev.key === 'Escape') fechar(); };
  veu.addEventListener('click', ev => { if (ev.target === veu) fechar(); });
  veu.querySelector('.pc-entrada-jogar').addEventListener('click', fechar);
  const copiar = veu.querySelector('.pc-entrada-copiar');
  copiar.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(LINK); copiar.textContent = 'Link copiado'; }
    catch { copiar.textContent = LINK.replace('https://', ''); }
  });
  document.addEventListener('keydown', tecla);
  document.body.append(veu);
  veu.querySelector('.pc-entrada-jogar').focus({ preventScroll: true });
}
