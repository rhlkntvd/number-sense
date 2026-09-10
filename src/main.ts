// imports
import "./style.css";

import { parseConfiguration, type Configuration } from "./configuration";

import { generateProblem, type Problem } from "./problem";

// initial markup
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("app element not found");
}

app.innerHTML = `
  <main>
    <h1>Number Sense</h1>
    <p class="subtitle">an arithmetic game</p>

    <form id="configuration-form">

      <fieldset>
        <legend>Operations</legend>

        <fieldset>
          <legend>(+/-)</legend>

          <label>
            <input type="checkbox" name="addition" checked />
            Addition
          </label>

          <label>
            <input type="checkbox" name="subtraction" checked />
            Subtraction
          </label>

          <p>Shared Ranges</p>

          <div>
            <span>(</span>

            <input
              type="number"
              name="additive-left-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="additive first number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="additive-left-max"
              value="100"
              min="0"
              step="1"
              required
              aria-label="additive first number maximum"
            />

            <span>) + (</span>

            <input
              type="number"
              name="additive-right-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="additive second number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="additive-right-max"
              value="100"
              min="0"
              step="1"
              required
              aria-label="additive second number maximum"
            />

            <span>)</span>
          </div>
          <p>Subtraction reverses problems generated from these ranges.</p>
        </fieldset>

        <fieldset>
          <legend>(x/÷)</legend>

          <label>
            <input type="checkbox" name="multiplication" checked />
            Multiplication
          </label>

          <label>
            <input type="checkbox" name="division" checked />
            Division
          </label>

          <p>Shared Ranges</p>

          <div>
            <span>(</span>

            <input
              type="number"
              name="multiplicative-left-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="multiplicative first number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="multiplicative-left-max"
              value="12"
              min="0"
              step="1"
              required
              aria-label="multiplicative first number maximum"
            />

            <span>) x (</span>

            <input
              type="number"
              name="multiplicative-right-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="multiplicative second number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="multiplicative-right-max"
              value="100"
              min="0"
              step="1"
              required
              aria-label="multiplicative second number maximum"
            />

            <span>)</span>
          </div>
          <p>Division reverses problems generated from these ranges.</p>
        </fieldset>
      </fieldset>

      <fieldset>
        <legend>Drill Mode</legend>

        <label>
          <input
            type="radio"
            name="drill-mode"
            value="count"
            checked
          />
          Count
        </label>

          <select name="count" aria-label="count">
            <option value="10">10 questions</option>
            <option value="25" selected>25 questions</option>
            <option value="50">50 questions</option>
            <option value="75">75 questions</option>
            <option value="100">100 questions</option>
          </select>

        <label>
          <input
            type="radio"
            name="drill-mode"
            value="duration"
          />
          Duration
        </label>

          <select name="duration" aria-label="duration">
            <option value="30">30 seconds</option>
            <option value="60">60 seconds</option>
            <option value="120" selected>120 seconds</option>
            <option value="180">180 seconds</option>
            <option value="300">300 seconds</option>
          </select>
      </fieldset>

      <p id="configuration-error" role="alert"></p>

      <button type="submit">Start</button>

    </form>

    <section id="drill" class="drill" hidden>
    <p>
      Score:
      <span id="score">0</span>
    </p>

    <p>
      Time:
      <span id="time">0.0</span>s
    </p>

    <p id="drill-status"></p>

    <p id="problem"></p>

    <label for="answer-input">Answer</label>
    <input
      id="answer-input"
      type="number"
      step="1"
      autocomplete="off"
    />
    </section>
  </main>
`;

// configuration DOM
const configurationForm = document.querySelector<HTMLFormElement>(
  "#configuration-form",
);

if (!configurationForm) {
  throw new Error("configuration form not found");
}

const countRadio = configurationForm.querySelector<HTMLInputElement>(
  'input[name="drill-mode"][value="count"]',
);

const durationRadio = configurationForm.querySelector<HTMLInputElement>(
  'input[name="drill-mode"][value="duration"]',
);

const countSelect = configurationForm.querySelector<HTMLSelectElement>(
  'select[name="count"]',
);

const durationSelect = configurationForm.querySelector<HTMLSelectElement>(
  'select[name="duration"]',
);

if (!countRadio || !durationRadio || !countSelect || !durationSelect) {
  throw new Error("drill mode controls not found");
}

const additionCheckbox = configurationForm.querySelector<HTMLInputElement>(
  'input[name="addition"]',
);

const subtractionCheckbox = configurationForm.querySelector<HTMLInputElement>(
  'input[name="subtraction"]',
);

const multiplicationCheckbox =
  configurationForm.querySelector<HTMLInputElement>(
    'input[name="multiplication"]',
  );

const divisionCheckbox = configurationForm.querySelector<HTMLInputElement>(
  'input[name="division"]',
);

if (
  !additionCheckbox ||
  !subtractionCheckbox ||
  !multiplicationCheckbox ||
  !divisionCheckbox
) {
  throw new Error("operation controls not found");
}

const additiveRangeInputs =
  configurationForm.querySelectorAll<HTMLInputElement>(
    'input[name^="additive-"]',
  );

const multiplicativeRangeInputs =
  configurationForm.querySelectorAll<HTMLInputElement>(
    'input[name^="multiplicative-"]',
  );

// drill DOM
const drillSection = document.querySelector<HTMLElement>("#drill");

const problemDisplay = document.querySelector<HTMLParagraphElement>("#problem");

const scoreDisplay = document.querySelector<HTMLSpanElement>("#score");

const timeDisplay = document.querySelector<HTMLSpanElement>("#time");

const drillStatus =
  document.querySelector<HTMLParagraphElement>("#drill-status");

const answerInput = document.querySelector<HTMLInputElement>("#answer-input");

const configurationError = document.querySelector<HTMLParagraphElement>(
  "#configuration-error",
);

if (
  !drillSection ||
  !problemDisplay ||
  !scoreDisplay ||
  !timeDisplay ||
  !drillStatus ||
  !answerInput ||
  !configurationError
) {
  throw new Error("drill controls not found");
}

// state variables
let currentConfiguration: Configuration | null = null;
let currentProblem: Problem | null = null;
let drillStartTime: number | null = null;
let drillEndTime: number | null = null;
let timerId: number | null = null;
let score = 0;

// UI helpers
const updateDrillModeControls = () => {
  countSelect.disabled = !countRadio.checked;
  durationSelect.disabled = !durationRadio.checked;
};

const updateOperationControls = () => {
  const additiveEnabled =
    additionCheckbox.checked || subtractionCheckbox.checked;

  const multiplicativeEnabled =
    multiplicationCheckbox.checked || divisionCheckbox.checked;

  additiveRangeInputs.forEach((input) => {
    input.disabled = !additiveEnabled;
  });

  multiplicativeRangeInputs.forEach((input) => {
    input.disabled = !multiplicativeEnabled;
  });
};

const formatTime = (milliseconds: number, precision: number): string => {
  return (milliseconds / 1000).toFixed(precision);
};

const updateElapsedTime = () => {
  if (drillStartTime === null) {
    return;
  }

  const elapsed = performance.now() - drillStartTime;

  timeDisplay.textContent = formatTime(elapsed, 1);
};

const updateRemainingTime = () => {
  if (drillEndTime === null) {
    return;
  }

  const remaining = Math.max(0, drillEndTime - performance.now());

  timeDisplay.textContent = formatTime(remaining, 1);

  if (remaining <= 0) {
    finishDrill();
  }
};

const getOperationSymbol = (operation: Problem["operation"]): string => {
  switch (operation) {
    case "addition":
      return "+";

    case "subtraction":
      return "-";

    case "multiplication":
      return "x";

    case "division":
      return "÷";
  }
};

const displayProblem = (problem: Problem) => {
  const symbol = getOperationSymbol(problem.operation);
  problemDisplay.textContent = `${problem.left} ${symbol} ${problem.right} =`;
};

const formatQuestionCount = (count: number): string => {
  return `${count} ${count === 1 ? "question" : "questions"}`;
};

// game actions
const startCountTimer = () => {
  drillStartTime = performance.now();
  drillEndTime = null;

  updateElapsedTime();

  timerId = window.setInterval(updateElapsedTime, 100);
};

const startDurationTimer = (durationSeconds: number) => {
  drillStartTime = performance.now();

  drillEndTime = drillStartTime + durationSeconds * 1000;

  updateRemainingTime();

  timerId = window.setInterval(updateRemainingTime, 100);
};

const stopTimer = () => {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
};

const startDrill = (configuration: Configuration): boolean => {
  const problem = generateProblem(configuration);

  if (!problem) {
    return false;
  }

  stopTimer();

  currentConfiguration = configuration;
  currentProblem = problem;
  score = 0;

  scoreDisplay.textContent = "0";
  timeDisplay.textContent = "0.0";
  drillStatus.textContent = "";

  answerInput.value = "";
  answerInput.disabled = false;

  configurationForm.hidden = true;
  drillSection.hidden = false;

  displayProblem(problem);

  if (configuration.drillMode.type === "count") {
    startCountTimer();
  } else {
    startDurationTimer(configuration.drillMode.duration);
  }

  answerInput.focus();

  return true;
};

const finishDrill = () => {
  if (!currentConfiguration) {
    return;
  }

  stopTimer();

  answerInput.disabled = true;
  problemDisplay.textContent = "";

  if (currentConfiguration.drillMode.type === "count") {
    const elapsed =
      drillStartTime === null ? 0 : performance.now() - drillStartTime;

    const formattedTime = formatTime(elapsed, 2);

    timeDisplay.textContent = formattedTime;

    drillStatus.textContent = `${formatQuestionCount(score)} completed in ${formattedTime} seconds`;
  } else {
    timeDisplay.textContent = "0.0";

    drillStatus.textContent = `${formatQuestionCount(score)} completed in ${currentConfiguration.drillMode.duration} seconds`;
  }

  currentProblem = null;
  currentConfiguration = null;
  drillStartTime = null;
  drillEndTime = null;
};

// event listeners
countRadio.addEventListener("change", updateDrillModeControls);
durationRadio.addEventListener("change", updateDrillModeControls);

additionCheckbox.addEventListener("change", updateOperationControls);
subtractionCheckbox.addEventListener("change", updateOperationControls);
multiplicationCheckbox.addEventListener("change", updateOperationControls);
divisionCheckbox.addEventListener("change", updateOperationControls);

configurationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  configurationError.textContent = "";

  const formData = new FormData(configurationForm);

  try {
    const configuration = parseConfiguration(formData);

    const started = startDrill(configuration);

    if (!started) {
      configurationError.textContent =
        "no valid problems can be generated from this configuration.";
    }
  } catch (error) {
    configurationError.textContent =
      error instanceof Error ? error.message : "Unable to start drill.";
  }
});

answerInput.addEventListener("input", () => {
  if (!currentProblem || !currentConfiguration) {
    return;
  }

  if (
    currentConfiguration.drillMode.type === "duration" &&
    drillEndTime !== null &&
    performance.now() >= drillEndTime
  ) {
    finishDrill();
    return;
  }

  const value = answerInput.value.trim();

  if (value === "") {
    return;
  }

  const answer = Number(value);

  if (!Number.isSafeInteger(answer)) {
    return;
  }

  if (answer !== currentProblem.answer) {
    return;
  }

  score += 1;
  scoreDisplay.textContent = String(score);

  if (
    currentConfiguration.drillMode.type === "count" &&
    score >= currentConfiguration.drillMode.count
  ) {
    finishDrill();
    return;
  }

  const nextProblem = generateProblem(currentConfiguration);

  if (!nextProblem) {
    return;
  }

  currentProblem = nextProblem;

  answerInput.value = "";

  displayProblem(nextProblem);
});

// initialization
updateOperationControls();
updateDrillModeControls();
