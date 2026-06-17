const vm = require("vm");

/**
 * Deep recursive JSON sorting helper.
 * Sorts object keys recursively. If sortArrays is true, it also recursively sorts elements of arrays.
 */
const canonicalizeJson = (val, sortArrays = false) => {
  if (Array.isArray(val)) {
    const canonicalizedList = val.map(v => canonicalizeJson(v, sortArrays));
    if (sortArrays) {
      // Sort elements based on stringified value so sorting is order-independent
      return canonicalizedList.sort((a, b) => {
        const strA = JSON.stringify(a);
        const strB = JSON.stringify(b);
        return strA.localeCompare(strB);
      });
    }
    return canonicalizedList;
  } else if (val && typeof val === "object") {
    const sortedKeys = Object.keys(val).sort();
    const sortedObj = {};
    for (const key of sortedKeys) {
      sortedObj[key] = canonicalizeJson(val[key], sortArrays);
    }
    return sortedObj;
  }
  return val;
};

const compareJson = (actual, expected, sortArrays = false) => {
  try {
    let actParsed = JSON.parse(actual);
    let expParsed = JSON.parse(expected);

    actParsed = canonicalizeJson(actParsed, sortArrays);
    expParsed = canonicalizeJson(expParsed, sortArrays);

    return JSON.stringify(actParsed) === JSON.stringify(expParsed);
  } catch (e) {
    return false;
  }
};

const compareNumericApproximate = (actual, expected, epsilon = 1e-6) => {
  const actNum = parseFloat(actual);
  const expNum = parseFloat(expected);

  if (isNaN(actNum) || isNaN(expNum)) {
    return false;
  }

  return Math.abs(actNum - expNum) <= epsilon;
};

const runCustomJudge = (actual, expected, customScript) => {
  try {
    // Sandbox validation context
    const sandbox = {
      actual: actual,
      expected: expected,
      verdict: false,
    };
    
    vm.createContext(sandbox);
    // The script should set `verdict` to true if matching
    const script = new vm.Script(customScript);
    script.runInContext(sandbox, { timeout: 1000 }); // 1 second timeout limit
    
    return sandbox.verdict === true;
  } catch (error) {
    console.error("Custom judge script failed:", error);
    return false;
  }
};

/**
 * Evaluate actual vs expected output based on question judgeConfig.
 * 
 * @param {string} actual - Raw execution stdout from Piston
 * @param {string} expected - Expected output string defined in the test case
 * @param {object} config - The judgeConfig object (strategy, epsilon, customJudgeScript)
 * @returns {boolean} - true if the output is accepted, false otherwise
 */
const evaluate = (actual, expected, config = {}) => {
  const strategy = (config.strategy || "strict").toLowerCase().trim();
  const actTrimmed = (actual || "").trim();
  const expTrimmed = (expected || "").trim();

  switch (strategy) {
    case "json":
      return compareJson(actTrimmed, expTrimmed, false);

    case "unordered_array":
      return compareJson(actTrimmed, expTrimmed, true);

    case "approximate_numeric":
      return compareNumericApproximate(actTrimmed, expTrimmed, config.epsilon || 1e-6);

    case "custom":
      if (!config.customJudgeScript) {
        // Fallback to strict comparison if no custom script defined
        return actTrimmed === expTrimmed;
      }
      return runCustomJudge(actTrimmed, expTrimmed, config.customJudgeScript);

    case "strict":
    default:
      return actTrimmed === expTrimmed;
  }
};

module.exports = {
  evaluate,
};
