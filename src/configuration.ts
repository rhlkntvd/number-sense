export type Range = {
  min: number;
  max: number;
};

export type AdditiveConfig = {
  addition: boolean;
  subtraction: boolean;
  left: Range;
  right: Range;
};

export type MultiplicativeConfig = {
  multiplication: boolean;
  division: boolean;
  left: Range;
  right: Range;
};

export type OperationConfig = {
  additive?: AdditiveConfig;
  multiplicative?: MultiplicativeConfig;
};

export type DrillMode =
  | { type: "count"; count: number }
  | {
      type: "duration";
      duration: number;
    };

export type Configuration = {
  operations: OperationConfig;
  drillMode: DrillMode;
};

function getInteger(formData: FormData, name: string): number {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`missing value for ${name}`);
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${name} must be a safe integer`);
  }

  return number;
}

function getPositiveInteger(formData: FormData, name: string): number {
  const value = getInteger(formData, name);

  if (value <= 0) {
    throw new Error(`${name} must be greater than zero`);
  }

  return value;
}

function getRange(formData: FormData, minName: string, maxName: string): Range {
  const min = getInteger(formData, minName);
  const max = getInteger(formData, maxName);

  if (min > max) {
    throw new Error("range minimum cannot be greater than maximum");
  }

  return {
    min,
    max,
  };
}

function validateAdditiveResults(left: Range, right: Range): void {
  const minimum = left.min + right.min;
  const maximum = left.max + right.max;

  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum)) {
    throw new Error("additive ranges can produce unsafe integers");
  }
}

function validateMultiplicativeResults(left: Range, right: Range): void {
  const products = [
    left.min * right.min,
    left.min * right.max,
    left.max * right.min,
    left.max * right.max,
  ];

  if (products.some((product) => !Number.isSafeInteger(product))) {
    throw new Error("multiplicative ranges can produce unsafe integers");
  }
}

export function parseConfiguration(formData: FormData): Configuration {
  const addition = formData.has("addition");
  const subtraction = formData.has("subtraction");
  const multiplication = formData.has("multiplication");
  const division = formData.has("division");

  if (!addition && !subtraction && !multiplication && !division) {
    throw new Error("at least one operation must be selected");
  }

  const operations: OperationConfig = {};

  if (addition || subtraction) {
    const left = getRange(formData, "additive-left-min", "additive-left-max");

    const right = getRange(
      formData,
      "additive-right-min",
      "additive-right-max",
    );

    validateAdditiveResults(left, right);

    operations.additive = {
      addition,
      subtraction,
      left,
      right,
    };
  }

  if (multiplication || division) {
    const left = getRange(
      formData,
      "multiplicative-left-min",
      "multiplicative-left-max",
    );

    const right = getRange(
      formData,
      "multiplicative-right-min",
      "multiplicative-right-max",
    );

    validateMultiplicativeResults(left, right);

    operations.multiplicative = {
      multiplication,
      division,
      left,
      right,
    };
  }

  const mode = formData.get("drill-mode");

  let drillMode: DrillMode;

  if (mode === "count") {
    drillMode = {
      type: "count",
      count: getPositiveInteger(formData, "count"),
    };
  } else if (mode === "duration") {
    drillMode = {
      type: "duration",
      duration: getPositiveInteger(formData, "duration"),
    };
  } else {
    throw new Error("invalid drill mode");
  }

  return {
    operations,
    drillMode,
  };
}
