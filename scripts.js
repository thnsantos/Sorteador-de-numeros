// Busca elementos do HTML para que o JavaScript possa le-los e altera-los.
// querySelector retorna o primeiro elemento que combina com o seletor CSS.
const form = document.querySelector(".number-content");
const formTitle = document.querySelector(".title-draw");
const result = document.querySelector(".draw-result");
const resultNumbers = document.querySelector(".result-numbers");
const drawAgainButton = document.querySelector(".draw-again");
// querySelectorAll retorna uma NodeList com todos os inputs encontrados.
const numberInputs = document.querySelectorAll(".field input");
const formError = document.querySelector("#form-error");

// Guarda o timer usado para liberar o botao depois das animacoes.
let revealTimer;

// Percorre cada input para registrar os eventos de interacao.
numberInputs.forEach((input) => {
  // focus acontece quando o usuario clica ou navega ate o campo.
  input.addEventListener("focus", () => {
    // A classe fica no elemento mesmo depois que outro input recebe foco.
    input.classList.add("is-selected");
  });

  // input acontece sempre que o valor do campo muda.
  input.addEventListener("input", () => {
    // Ao digitar, removemos o destaque de erro daquele campo.
    input.classList.remove("is-empty");

    // [...numberInputs] converte a NodeList em array.
    // every retorna true somente se todos os campos tiverem valor.
    if ([...numberInputs].every((numberInput) => numberInput.value.trim() !== "")) {
      formError.hidden = true;
    }
  });
});

// Cria uma lista de numeros sorteados dentro do intervalo informado.
function generateNumbers(amount, min, max, noRepeat) {
  // Array vazio que vai receber os numeros sorteados.
  const numbers = [];

  // Cria todos os numeros possiveis: de min ate max.
  // length define quantos itens serao criados.
  // index representa a posicao atual da lista.
  const availableNumbers = Array.from(
    { length: max - min + 1 },
    (_, index) => min + index,
  );

  // Continua sorteando ate atingir a quantidade solicitada.
  while (numbers.length < amount) {
    // Gera uma posicao aleatoria dentro da lista disponivel.
    const index = Math.floor(Math.random() * availableNumbers.length);

    // Com nao repeticao ativada, remove um numero da lista disponivel.
    // splice retorna um array; [0] pega o numero removido.
    // Se repeticao for permitida, sorteia diretamente entre min e max.
    const number = noRepeat
      ? availableNumbers.splice(index, 1)[0]
      : min + Math.floor(Math.random() * (max - min + 1));

    // Adiciona o numero escolhido ao resultado.
    numbers.push(number);
  }

  // Entrega a lista pronta para a funcao que atualiza a tela.
  return numbers;
}

// Recebe os numeros e troca o formulario pela tela de resultado.
function showResult(numbers) {
  // Cancela um timer anterior para evitar dois timers ativos ao mesmo tempo.
  window.clearTimeout(revealTimer);

  // Remove resultados antigos antes de criar os novos.
  resultNumbers.replaceChildren();
  result.classList.remove("is-complete");

  // Cria um quadrado para cada numero sorteado.
  numbers.forEach((number, index) => {
    const item = document.createElement("span");
    item.className = "result-number";

    // Cada quadrado espera 1900ms a mais que o anterior para animar em sequencia.
    item.style.animationDelay = `${index * 1900}ms`;

    // Cria um elemento interno para mostrar o valor sorteado.
    const value = document.createElement("span");
    value.className = "result-number-value";
    value.textContent = number;
    item.append(value);

    // animationend avisa quando a animacao CSS desse quadrado terminou.
    item.addEventListener("animationend", (event) => {
      // Ignora outros tipos de animacao que possam existir no elemento.
      if (event.animationName !== "number-reveal") {
        return;
      }

      // Para a animacao e marca o quadrado como finalizado no CSS.
      item.style.animation = "none";
      item.classList.add("is-finished");
    });

    // Coloca o quadrado pronto dentro da area de resultados.
    resultNumbers.append(item);
  });

  // Inicia a animacao de saida do titulo e do formulario.
  formTitle.classList.add("is-leaving");
  form.classList.add("is-leaving");

  // Aguarda a saida terminar antes de esconder o formulario.
  window.setTimeout(() => {
    formTitle.hidden = true;
    form.hidden = true;
    result.hidden = false;

    // Reinicia a animacao de entrada da area de resultado.
    result.classList.remove("is-entering");
    requestAnimationFrame(() => result.classList.add("is-entering"));

    // Libera o botao somente depois que todos os quadrados terminarem.
    revealTimer = window.setTimeout(() => {
      result.classList.add("is-complete");
    }, numbers.length * 1900 + 300);
  }, 280);
}

// Volta da tela de resultado para o formulario inicial.
function showForm() {
  // Cancela o timer caso o usuario volte antes do fim da animacao.
  window.clearTimeout(revealTimer);
  result.classList.remove("is-entering");
  result.classList.remove("is-complete");

  // Esconde o resultado e mostra novamente os elementos do formulario.
  result.hidden = true;
  formTitle.hidden = false;
  form.hidden = false;
  formTitle.classList.remove("is-leaving");
  form.classList.remove("is-leaving");
}

// submit acontece quando o usuario envia o formulario.
form.addEventListener("submit", (event) => {
  // Impede o navegador de recarregar a pagina.
  event.preventDefault();

  // Number converte o texto dos inputs para valores numericos.
  const amount = Number(document.querySelector("#amount").value);
  const min = Number(document.querySelector("#min").value);
  const max = Number(document.querySelector("#max").value);
  const noRepeat = document.querySelector("#no-repeat").checked;

  // filter cria uma nova lista apenas com os campos que estao vazios.
  const emptyInputs = [...numberInputs].filter((input) => input.value.trim() === "");

  // Confere se os valores sao inteiros e se o intervalo e valido.
  const fieldsAreValid = Number.isInteger(amount)
    && Number.isInteger(min)
    && Number.isInteger(max)
    && amount > 0
    && min <= max
    && (!noRepeat || amount <= max - min + 1);

  // Se alguma regra falhar, interrompe o sorteio e mostra o erro correto.
  if (!fieldsAreValid) {
    // Este caso trata especificamente os campos sem preenchimento.
    if (emptyInputs.length > 0) {
      emptyInputs.forEach((input) => input.classList.add("is-empty"));
      formError.hidden = false;
      emptyInputs[0].focus();
      return;
    }

    // Para outros erros, usa a validacao nativa e uma mensagem geral.
    form.reportValidity();
    alert("Revise os valores informados. A quantidade deve caber no intervalo quando a repeticao estiver desativada.");
    return;
  }

  // Com os dados validos, gera os numeros e mostra o resultado.
  showResult(generateNumbers(amount, min, max, noRepeat));
});

// Ao clicar, retorna para o formulario para permitir um novo sorteio.
drawAgainButton.addEventListener("click", showForm);
