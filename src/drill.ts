import type { Configuration } from "./configuration";

import { generateProblem, type Problem } from "./problem";

const TIMER_UPDATE_INTERVAL = 100;

type DrillElements = {
  section: HTMLElement;
  problemDisplay: HTMLParagraphElement;
  scoreDisplay: HTMLSpanElement;
  timeDisplay: HTMLSpanElement;
  statusDisplay: HTMLParagraphElement;
  answerLabel: HTMLLabelElement;
  answerInput: HTMLInputElement;
  actions: HTMLDivElement;
  replayButton: HTMLButtonElement;
};

export function createDrill(elements: DrillElements) {
  let currentConfiguration: Configuration | null = null;
  let currentProblem: Problem | null = null;
  let score = 0;

  let drillStartTime: number | null = null;
  let drillEndTime: number | null = null;
  let timerId: number | null = null;

  const formatTime = (milliseconds: number, precision: number): string => {
    return (milliseconds / 1000).toFixed(precision);
  };

  const formatProblemCount = (count: number): string => {
    return `${count} ${count === 1 ? "problem" : "problems"}`;
  };

  const formatRightOperand = (value: number): string => {
    return value < 0 ? `(${value})` : String(value);
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

  const updateScoreDisplay = () => {
    if (!currentConfiguration) {
      return;
    }

    if (currentConfiguration.drillMode.type === "count") {
      elements.scoreDisplay.textContent = `${score}/${currentConfiguration.drillMode.count}`;
    } else {
      elements.scoreDisplay.textContent = String(score);
    }
  };

  const displayProblem = (problem: Problem) => {
    const symbol = getOperationSymbol(problem.operation);

    const right = formatRightOperand(problem.right);

    elements.problemDisplay.textContent = `${problem.left} ${symbol} ${right} =`;
  };

  const stopTimer = () => {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const resetAnswerControls = (enabled: boolean) => {
    elements.answerLabel.hidden = !enabled;
    elements.answerInput.hidden = !enabled;
    elements.answerInput.disabled = !enabled;
    elements.answerInput.value = "";
  };

  const finishDrill = () => {
    if (!currentConfiguration) {
      return;
    }

    stopTimer();

    resetAnswerControls(false);

    elements.problemDisplay.textContent = "";

    elements.actions.hidden = false;

    if (currentConfiguration.drillMode.type === "count") {
      const elapsed =
        drillStartTime === null ? 0 : performance.now() - drillStartTime;

      const formattedTime = formatTime(elapsed, 2);

      elements.timeDisplay.textContent = formattedTime;

      elements.statusDisplay.textContent = `${formatProblemCount(score)} completed in ${formattedTime} seconds`;
    } else {
      elements.timeDisplay.textContent = "0.0";

      elements.statusDisplay.textContent = `${formatProblemCount(score)} completed in ${currentConfiguration.drillMode.duration} seconds`;
    }

    currentProblem = null;
    drillStartTime = null;
    drillEndTime = null;
  };

  const updateElapsedTime = () => {
    if (drillStartTime === null) {
      return;
    }

    const elapsed = performance.now() - drillStartTime;

    elements.timeDisplay.textContent = formatTime(elapsed, 1);
  };

  const startCountTimer = () => {
    drillStartTime = performance.now();
    drillEndTime = null;

    updateElapsedTime();

    timerId = window.setInterval(updateElapsedTime, TIMER_UPDATE_INTERVAL);
  };

  const updateRemainingTime = () => {
    if (drillEndTime === null) {
      return;
    }

    const remaining = Math.max(0, drillEndTime - performance.now());

    elements.timeDisplay.textContent = formatTime(remaining, 1);

    if (remaining <= 0) {
      finishDrill();
    }
  };

  const startDurationTimer = (durationSeconds: number) => {
    drillStartTime = performance.now();

    drillEndTime = drillStartTime + durationSeconds * 1000;

    updateRemainingTime();

    timerId = window.setInterval(updateRemainingTime, TIMER_UPDATE_INTERVAL);
  };

  const start = (configuration: Configuration): boolean => {
    const problem = generateProblem(configuration);

    if (!problem) {
      return false;
    }

    stopTimer();

    currentConfiguration = configuration;
    currentProblem = problem;
    score = 0;

    updateScoreDisplay();
    elements.statusDisplay.textContent = "";

    resetAnswerControls(true);

    elements.section.hidden = false;

    elements.actions.hidden = true;

    displayProblem(problem);

    if (configuration.drillMode.type === "count") {
      elements.timeDisplay.textContent = "0.0";

      startCountTimer();
    } else {
      elements.timeDisplay.textContent = formatTime(
        configuration.drillMode.duration * 1000,
        1,
      );

      startDurationTimer(configuration.drillMode.duration);
    }

    elements.answerInput.focus();

    return true;
  };

  const replay = () => {
    if (!currentConfiguration) {
      return;
    }

    start(currentConfiguration);
  };

  elements.replayButton.addEventListener("click", replay);

  elements.answerInput.addEventListener("input", () => {
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

    const value = elements.answerInput.value.trim();

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

    updateScoreDisplay();

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

    elements.answerInput.value = "";

    displayProblem(nextProblem);
  });

  return {
    start,
  };
}
