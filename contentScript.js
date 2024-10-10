chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "inserir_palavra") {
    const campoPesquisa = document.querySelector('input[name="q"]');
    if (campoPesquisa) {
      campoPesquisa.value = message.palavra;
      campoPesquisa.form.submit(); 
    }
  }
});
