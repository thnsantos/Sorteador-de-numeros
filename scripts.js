const form = document.querySelector(".number-content");
const formTitle = document.querySelector(".title-draw");
const result = document.querySelector(".draw-result");
const resultNumbers = document.querySelector(".result-numbers");
const drawAgainButton = document.querySelector(".draw-again");
const numberInputs = document.querySelectorAll(".field input");
const formError = document.querySelector("#form-error");
let revealTimer;

numberInputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.classList.add("is-selected");
  });

  input.addEventListener("input", () => {
    input.classList.remove("is-empty");

    if ([...numberInputs].every((numberInput) => numberInput.value.trim() !== "")) {
      formError.hidden = true;
    }
  });
});

function generateNumbers(amount, min, max, noRepeat) {
  const numbers = [];
  const availableNumbers = Array.from(
    { length: max - min + 1 },
    (_, index) => min + index,
  );

  while (numbers.length < amount) {
    const index = Math.floor(Math.random() * availableNumbers.length);
    const number = noRepeat
      ? availableNumbers.splice(index, 1)[0]
      : min + Math.floor(Math.random() * (max - min + 1));

    numbers.push(number);
  }

  return numbers;
}

function showResult(numbers) {
  window.clearTimeout(revealTimer);
  resultNumbers.replaceChildren();
  result.classList.remove("is-complete");

  numbers.forEach((number, index) => {
    const item = document.createElement("span");
    item.className = "result-number";
    item.style.animationDelay = `${index * 1900}ms`;
    const value = document.createElement("span");
    value.className = "result-number-value";
    value.textContent = number;
    item.append(value);

    item.addEventListener("animationend", (event) => {
      if (event.animationName !== "number-reveal") {
        return;
      }

      item.style.animation = "none";
      item.classList.add("is-finished");
    });
    resultNumbers.append(item);
  });

  formTitle.classList.add("is-leaving");
  form.classList.add("is-leaving");

  window.setTimeout(() => {
    formTitle.hidden = true;
    form.hidden = true;
    result.hidden = false;
    result.classList.remove("is-entering");
    requestAnimationFrame(() => result.classList.add("is-entering"));

    revealTimer = window.setTimeout(() => {
      result.classList.add("is-complete");
    }, numbers.length * 1900 + 300);
  }, 280);
}

function showForm() {
  window.clearTimeout(revealTimer);
  result.classList.remove("is-entering");
  result.classList.remove("is-complete");
  result.hidden = true;
  formTitle.hidden = false;
  form.hidden = false;
  formTitle.classList.remove("is-leaving");
  form.classList.remove("is-leaving");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(document.querySelector("#amount").value);
  const min = Number(document.querySelector("#min").value);
  const max = Number(document.querySelector("#max").value);
  const noRepeat = document.querySelector("#no-repeat").checked;
  const emptyInputs = [...numberInputs].filter((input) => input.value.trim() === "");
  const fieldsAreValid = Number.isInteger(amount)
    && Number.isInteger(min)
    && Number.isInteger(max)
    && amount > 0
    && min <= max
    && (!noRepeat || amount <= max - min + 1);

  if (!fieldsAreValid) {
    if (emptyInputs.length > 0) {
      emptyInputs.forEach((input) => input.classList.add("is-empty"));
      formError.hidden = false;
      emptyInputs[0].focus();
      return;
    }

    form.reportValidity();
    alert("Revise os valores informados. A quantidade deve caber no intervalo quando a repeticao estiver desativada.");
    return;
  }

  showResult(generateNumbers(amount, min, max, noRepeat));
});

drawAgainButton.addEventListener("click", showForm);
