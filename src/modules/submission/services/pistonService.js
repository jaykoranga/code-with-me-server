// Service for executing code. Replaces restricted Piston API with Wandbox free compiler.

const WANDBOX_API_URL = "https://wandbox.org/api/compile.json";

// Language configuration mapping to Wandbox compiler IDs
const LANGUAGE_CONFIG = {
  "javascript": { compiler: "nodejs-20.17.0" },
  "python": { compiler: "cpython-3.12.7" },
  "c": { compiler: "gcc-13.2.0-c" },
  "cpp": { compiler: "gcc-13.2.0" },
  "c++": { compiler: "gcc-13.2.0" },
  "java": { compiler: "openjdk-jdk-21+35" }
};

/**
 * Executes source code against stdin using Wandbox API.
 * 
 * @param {string} language - The programming language name (e.g. "javascript", "python")
 * @param {string} sourceCode - The full user solution concatenated with driver runners
 * @param {string} stdin - Input parameters passed to standard input
 * @returns {Promise<{ stdout: string, stderr: string, code: number, signal: string|null, error: Error|null }>}
 */
const executeCode = async (language, sourceCode, stdin = "") => {
  try {
    const normalizedLang = String(language).toLowerCase().trim();
    const config = LANGUAGE_CONFIG[normalizedLang];

    if (!config) {
      return {
        stdout: "",
        stderr: `Unsupported language: ${language}`,
        code: -1,
        signal: null,
        error: new Error(`Language '${language}' is not supported by the runner service.`)
      };
    }

    const payload = {
      compiler: config.compiler,
      code: sourceCode,
      stdin: stdin,
      save: false
    };

    const response = await fetch(WANDBOX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Wandbox API returned HTTP status ${response.status}`);
    }

    const result = await response.json();

    // Map compiler output/errors and program output/errors
    const stdout = result.program_output || "";
    
    // Concatenate any compilation warnings/errors and runtime errors
    let stderr = "";
    if (result.compiler_error) {
      stderr += result.compiler_error;
    }
    if (result.program_error) {
      stderr += (stderr ? "\n" : "") + result.program_error;
    }

    const code = typeof result.status === "string" ? parseInt(result.status, 10) : (result.status ?? 0);

    return {
      stdout: stdout,
      stderr: stderr,
      code: code,
      signal: null,
      error: null
    };
  } catch (error) {
    console.error("Wandbox code execution failed:", error);
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
