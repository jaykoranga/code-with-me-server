// Service for executing code. Interacts with the local or production Piston API.

// Language configuration mapping to Piston language tags
const PISTON_LANGUAGES = {
  "javascript": "javascript",
  "js": "javascript",
  "c++": "cpp",
  "cpp": "cpp",
  "python": "python",
  "c": "c",
  "java": "java"
};

/**
 * Executes source code against stdin using Piston API.
 * 
 * @param {string} language - The programming language name (e.g. "javascript", "cpp")
 * @param {string} sourceCode - The full user solution concatenated with driver runners
 * @param {string} stdin - Input parameters passed to standard input
 * @returns {Promise<{ stdout: string, stderr: string, code: number, signal: string|null, error: Error|null }>}
 */
const executeCode = async (language, sourceCode, stdin = "") => {
  try {
    const normalizedLang = String(language).toLowerCase().trim();
    const pistonLang = PISTON_LANGUAGES[normalizedLang] || normalizedLang;

    const pistonApiUrl = process.env.PISTON_API_URL || "http://localhost:2000";
    const url = pistonApiUrl.endsWith("/execute") ? pistonApiUrl : `${pistonApiUrl}/api/v2/execute`;

    const payload = {
      language: pistonLang,
      version: "*",
      files: [
        {
          content: sourceCode
        }
      ],
      stdin
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Piston API returned HTTP status ${response.status}`);
    }

    const result = await response.json();

    // If compile stage failed or timed out (e.g. compiler status SG/TO/RE or exit code !== 0)
    if (result.compile && (result.compile.code !== 0 || result.compile.status)) {
      const compileErr = result.compile.stderr || result.compile.output || result.compile.message || "Compilation error";
      return {
        stdout: result.compile.stdout || "",
        stderr: compileErr,
        code: result.compile.code ?? -1,
        signal: result.compile.signal || null,
        error: null
      };
    }

    const runResult = result.run || {};
    const runErr = runResult.stderr || runResult.message || "";
    return {
      stdout: runResult.stdout || "",
      stderr: runErr,
      code: runResult.code ?? (runResult.status ? -1 : 0),
      signal: runResult.signal || null,
      error: null
    };
  } catch (error) {
    console.error("Piston execution failed:", error);
    return {
      stdout: "",
      stderr: "Execution failed due to code runner service error.",
      code: -1,
      signal: null,
      error
    };
  }
};

module.exports = {
  executeCode,
};
