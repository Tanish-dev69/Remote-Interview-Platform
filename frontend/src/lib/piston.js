// Detect if we are running locally or on Render
const isLocal = window.location.hostname === "localhost";
const BACKEND_URL = isLocal 
  ? "http://localhost:8080/api/execute" 
  : "https://remote-interview-platform-z47o.onrender.com/api/execute";

/**
 * Calls the InterCode backend to execute code via the Glot.io bridge.
 * @param {string} language - The programming language (e.g., 'java', 'python')
 * @param {string} code - The user's solution code
 * @param {string} problemId - The ID of the current problem (e.g., 'two-sum')
 */
export async function executeCode(language, code, problemId) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        language: language.toLowerCase(), 
        code,
        problemId // 👈 CRITICAL: Backend needs this to find the test runner
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: `Server Error (${response.status}): ${data.error || "Execution failed"}` 
      };
    }

    // Data format returned by our backend judge:
    // { success: boolean, testResults: [...], output: string, error: string }
    return {
      success: data.success,
      testResults: data.testResults || [], // 👈 NEW: Structured pass/fail data
      output: data.output || (data.success ? "No output" : ""),
      error: data.error || "",
    };

  } catch (error) {
    return {
      success: false,
      error: `Connection Failed: ${error.message}. Is the backend running?`,
    };
  }
}