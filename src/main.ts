import "./style.css";
import { parseConfiguration } from "./configuration";
import { createDrill } from "./drill";

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
const rangeInputs = [...additiveRangeInputs, ...multiplicativeRangeInputs];

rangeInputs.forEach((input) => {
  input.addEventListener("invalid", () => {
    input.setCustomValidity("");

    if (input.validity.stepMismatch) {
      input.setCustomValidity("Value must be an integer");
    }
  });

  input.addEventListener("input", () => {
    input.setCustomValidity("");
  });
});

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
const problemRow = document.querySelector<HTMLDivElement>("#problem-row");
const siteFooter = document.querySelector<HTMLElement>("#site-footer");

if (!siteFooter) {
  throw new Error("site footer not found");
}

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
  !settingsButton ||
  !problemRow
) {
  throw new Error("drill controls not found");
}

const drill = createDrill({
  section: drillSection,
  problemRow,
  problemDisplay,
  scoreDisplay,
  timeDisplay,
  statusDisplay: drillStatus,
  answerLabel,
  answerInput,
  actions: drillActions,
  replayButton,
});

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
  siteFooter.hidden = false;
  additionCheckbox.focus();
});

configurationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  configurationError.textContent = "";

  try {
    const configuration = parseConfiguration(new FormData(configurationForm));
    const started = drill.start(configuration);

    if (!started) {
      configurationError.textContent =
        "no valid problems can be generated from this configuration";
      return;
    }

    configurationForm.hidden = true;
    siteFooter.hidden = true;
  } catch (error) {
    configurationError.textContent =
      error instanceof Error ? error.message : "unable to start drill";
  }
});

updateOperationControls();
updateDrillModeControls();
