const palavrasGeradas = new Set(); // Usar Set para armazenar palavras já geradas
let contadorDePalavras = 1; // Iniciar gerando 1 palavra

async function obterPalavrasAleatorias() {
  // Alterna entre gerar 1, 2 ou 3 palavras
  const numeroPalavras = contadorDePalavras;
  contadorDePalavras = (contadorDePalavras % 3) + 1; // Alterna entre 1, 2 e 3 palavras

  const url = `https://random-word-form.herokuapp.com/random/noun?count=${numeroPalavras}`; // Solicitar 1, 2 ou 3 palavras
   //api reserva https://api.datamuse.com/words?ml=ringing+in+the+ears&max=4
  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados && dados.length === numeroPalavras) {
      // Verificar se as palavras já foram geradas
      const palavrasValidas = dados.filter(palavra => !palavrasGeradas.has(palavra));

      if (palavrasValidas.length !== numeroPalavras) {
        console.log("Algumas palavras já foram geradas, buscando outras...");
        return obterPalavrasAleatorias(); // Buscar novamente se houver repetidas
      }

      // Adicionar as palavras ao Set
      palavrasValidas.forEach(palavra => palavrasGeradas.add(palavra));

      // Combinar as palavras em uma string
      const palavrasCombinadas = palavrasValidas.join(' ');
      return palavrasCombinadas;
    } else {
      console.error("Não foi possível obter as palavras.");
      return "erro";
    }
  } catch (erro) {
    console.error("Erro ao obter as palavras aleatórias:", erro);
    return "erro";
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'gerarPalavra') {
    obterPalavrasAleatorias().then(palavras => {
      if (palavras !== "erro") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: digitarPalavraGradualmente,
            args: [palavras]
          });
        });
      }
    });
  }
});

function digitarPalavraGradualmente(palavras) {
  const campoPesquisa = document.querySelector('#sb_form_q');
  
  if (campoPesquisa) {
    campoPesquisa.value = ''; // Limpar o campo de pesquisa antes de começar

    let i = 0;
    
    function digitarLetra() {
      if (i < palavras.length) {
        campoPesquisa.value += palavras[i]; // Adicionar uma letra por vez
        i++;
        
        // Simular o evento de input para cada letra
        campoPesquisa.dispatchEvent(new Event('input', { bubbles: true }));

        // Continuar digitando a próxima letra após um pequeno atraso
        setTimeout(digitarLetra, Math.random() * 150 + 50); // Atraso aleatório entre 50ms e 200ms
      } else {
        // Quando todas as letras forem digitadas, simular o Enter
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13 });
        campoPesquisa.dispatchEvent(enterEvent);
      }
    }
    
    digitarLetra(); // Começar a digitar a palavra
  } else {
    console.error("Campo de pesquisa não encontrado.");
  }
}
