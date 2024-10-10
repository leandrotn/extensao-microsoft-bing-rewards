document.getElementById('gerar-palavra').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'gerarPalavra' });
});
