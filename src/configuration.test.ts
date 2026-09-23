import { describe, expect, test } from "vitest";

import { parseConfiguration } from "./configuration";

function createValidFormData(): FormData {
  const formData = new FormData();

  formData.set("addition", "on");

  formData.set("additive-left-min", "2");
  formData.set("additive-left-max", "100");
  formData.set("additive-right-min", "2");
  formData.set("additive-right-max", "100");

  formData.set("drill-mode", "count");
  formData.set("count", "25");

  return formData;
}

describe("parseConfiguration", () => {
  describe("valid configurations", () => {
    test("parses a valid count configuration", () => {
      const formData = createValidFormData();

      const configuration = parseConfiguration(formData);

      expect(configuration).toEqual({
        operations: {
          additive: {
            addition: true,
            subtraction: false,
            left: {
              min: 2,
              max: 100,
            },
            right: {
              min: 2,
              max: 100,
            },
          },
        },
        drillMode: {
          type: "count",
          count: 25,
        },
      });
    });

    test("parses a valid duration configuration", () => {
      const formData = createValidFormData();

      formData.set("drill-mode", "duration");
      formData.delete("count");
      formData.set("duration", "120");

      const configuration = parseConfiguration(formData);

      expect(configuration).toEqual({
        operations: {
          additive: {
            addition: true,
            subtraction: false,
            left: {
              min: 2,
              max: 100,
            },
            right: {
              min: 2,
              max: 100,
            },
          },
        },
        drillMode: {
          type: "duration",
          duration: 120,
        },
      });
    });

    test("accepts negative additive ranges", () => {
      const formData = createValidFormData();

      formData.set("additive-left-min", "-10");
      formData.set("additive-left-max", "10");
      formData.set("additive-right-min", "-20");
      formData.set("additive-right-max", "20");

      const configuration = parseConfiguration(formData);

      expect(configuration.operations.additive?.left).toEqual({
        min: -10,
        max: 10,
      });

      expect(configuration.operations.additive?.right).toEqual({
        min: -20,
        max: 20,
      });
    });

    test("accepts zero ranges for division", () => {
      const formData = new FormData();

      formData.set("division", "on");

      formData.set("multiplicative-left-min", "0");
      formData.set("multiplicative-left-max", "0");
      formData.set("multiplicative-right-min", "0");
      formData.set("multiplicative-right-max", "0");

      formData.set("drill-mode", "count");
      formData.set("count", "25");

      const configuration = parseConfiguration(formData);

      expect(configuration.operations.multiplicative).toEqual({
        multiplication: false,
        division: true,
        left: {
          min: 0,
          max: 0,
        },
        right: {
          min: 0,
          max: 0,
        },
      });
    });
  });

  describe("invalid configurations", () => {
    test("rejects configurations with no operations", () => {
      const formData = createValidFormData();

      formData.delete("addition");

      expect(() => {
        parseConfiguration(formData);
      }).toThrow("at least one operation must be selected");
    });

    test("rejects a range with minimum greater than maximum", () => {
      const formData = createValidFormData();

      formData.set("additive-left-min", "100");
      formData.set("additive-left-max", "2");

      expect(() => {
        parseConfiguration(formData);
      }).toThrow("range minimum cannot be greater than maximum");
    });

    test("rejects additive ranges that can produce unsafe integers", () => {
      const formData = createValidFormData();

      formData.set("additive-left-min", String(Number.MAX_SAFE_INTEGER));
      formData.set("additive-left-max", String(Number.MAX_SAFE_INTEGER));

      formData.set("additive-right-min", "1");
      formData.set("additive-right-max", "1");

      expect(() => {
        parseConfiguration(formData);
      }).toThrow("additive ranges can produce unsafe integers");
    });

    test("rejects multiplicative ranges that can produce unsafe integers", () => {
      const formData = new FormData();

      formData.set("multiplication", "on");

      formData.set("multiplicative-left-min", String(Number.MAX_SAFE_INTEGER));
      formData.set("multiplicative-left-max", String(Number.MAX_SAFE_INTEGER));

      formData.set("multiplicative-right-min", "2");
      formData.set("multiplicative-right-max", "2");

      formData.set("drill-mode", "count");
      formData.set("count", "25");

      expect(() => {
        parseConfiguration(formData);
      }).toThrow("multiplicative ranges can produce unsafe integers");
    });
  });

  test("accepts additive values at the magnitude limit", () => {
    const formData = createValidFormData();

    formData.set("additive-left-min", "-9999");
    formData.set("additive-left-max", "9999");
    formData.set("additive-right-min", "-9999");
    formData.set("additive-right-max", "9999");

    const configuration = parseConfiguration(formData);

    expect(configuration.operations.additive?.left).toEqual({
      min: -9999,
      max: 9999,
    });

    expect(configuration.operations.additive?.right).toEqual({
      min: -9999,
      max: 9999,
    });
  });

  test.each(["-10000", "10000"])(
    "rejects additive values outside the magnitude limit: %s",
    (value) => {
      const formData = createValidFormData();

      formData.set("additive-left-min", value);
      formData.set("additive-left-max", value);

      expect(() => {
        parseConfiguration(formData);
      }).toThrow("additive range values must be between -9999 and 9999.");
    },
  );

  test("accepts multiplicative values at the magnitude limit", () => {
    const formData = new FormData();

    formData.set("multiplication", "on");

    formData.set("multiplicative-left-min", "-999");
    formData.set("multiplicative-left-max", "999");
    formData.set("multiplicative-right-min", "-999");
    formData.set("multiplicative-right-max", "999");

    formData.set("drill-mode", "count");
    formData.set("count", "25");

    const configuration = parseConfiguration(formData);

    expect(configuration.operations.multiplicative?.left).toEqual({
      min: -999,
      max: 999,
    });

    expect(configuration.operations.multiplicative?.right).toEqual({
      min: -999,
      max: 999,
    });
  });

  test.each(["-1000", "1000"])(
    "rejects multiplicative values outside the magnitude limit: %s",
    (value) => {
      const formData = new FormData();

      formData.set("multiplication", "on");

      formData.set("multiplicative-left-min", value);
      formData.set("multiplicative-left-max", value);
      formData.set("multiplicative-right-min", "2");
      formData.set("multiplicative-right-max", "2");

      formData.set("drill-mode", "count");
      formData.set("count", "25");

      expect(() => {
        parseConfiguration(formData);
      }).toThrow("multiplicative range values must be between -999 and 999.");
    },
  );
});
