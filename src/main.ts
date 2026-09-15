// imports
import "./style.css";
import { parseConfiguration } from "./configuration";
import { createDrill } from "./drill";

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

      <button type="button" id="reset-settings-button">
        Reset to Defaults
      </button>
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

    <label id="answer-label" for="answer-input">Answer:</label>
    <input
      id="answer-input"
      type="number"
      step="1"
      autocomplete="off"
    />

    <div id="drill-actions" hidden>
    <button type="button" id="replay-button">
      Play Again
    </button>

    <button type="button" id="settings-button">
      Change Settings
    </button>
    </div>
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

const resetSettingsButton = configurationForm.querySelector<HTMLButtonElement>(
  "#reset-settings-button",
);

if (!resetSettingsButton) {
  throw new Error("reset settings button not found");
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

const answerLabel = document.querySelector<HTMLLabelElement>("#answer-label");

const answerInput = document.querySelector<HTMLInputElement>("#answer-input");

const configurationError = document.querySelector<HTMLParagraphElement>(
  "#configuration-error",
);

const drillActions = document.querySelector<HTMLDivElement>("#drill-actions");

const replayButton =
  document.querySelector<HTMLButtonElement>("#replay-button");

const settingsButton =
  document.querySelector<HTMLButtonElement>("#settings-button");

if (
  !drillSection ||
  !problemDisplay ||
  !scoreDisplay ||
  !timeDisplay ||
  !drillStatus ||
  !answerLabel ||
  !answerInput ||
  !configurationError ||
  !drillActions ||
  !replayButton ||
  !settingsButton
) {
  throw new Error("drill controls not found");
}

const drill = createDrill({
  section: drillSection,
  problemDisplay,
  scoreDisplay,
  timeDisplay,
  statusDisplay: drillStatus,
  answerLabel,
  answerInput,
  actions: drillActions,
  replayButton,
});

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

// event listeners
countRadio.addEventListener("change", updateDrillModeControls);
durationRadio.addEventListener("change", updateDrillModeControls);

additionCheckbox.addEventListener("change", updateOperationControls);
subtractionCheckbox.addEventListener("change", updateOperationControls);
multiplicationCheckbox.addEventListener("change", updateOperationControls);
divisionCheckbox.addEventListener("change", updateOperationControls);

resetSettingsButton.addEventListener("click", () => {
  configurationForm.reset();

  updateOperationControls();
  updateDrillModeControls();

  configurationError.textContent = "";
});

settingsButton.addEventListener("click", () => {
  drillSection.hidden = true;
  drillActions.hidden = true;
  configurationForm.hidden = false;
});

configurationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  configurationError.textContent = "";

  const formData = new FormData(configurationForm);

  try {
    const configuration = parseConfiguration(formData);

    const started = drill.start(configuration);

    if (!started) {
      configurationError.textContent =
        "no valid problems can be generated from this configuration";

      return;
    }

    configurationForm.hidden = true;
  } catch (error) {
    configurationError.textContent =
      error instanceof Error ? error.message : "unable to start drill";
  }
});

// initialization
updateOperationControls();
updateDrillModeControls();
