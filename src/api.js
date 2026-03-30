const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

// Fetch the current authenticated user, returns null if not logged in.
export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("getMe failed");
  return res.json();
}

export const loginURL  = `${BASE}/auth/login`;
export const logoutURL = `${BASE}/auth/logout`;

// Save an algorithm run for the current user.
export async function saveRun(algorithm, input, steps) {
  const res = await fetch(`${BASE}/api/runs`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ algorithm, input, steps }),
  });
  if (!res.ok) throw new Error("saveRun failed");
  return res.json();
}

// Get all saved runs for the current user.
export async function getRuns() {
  const res = await fetch(`${BASE}/api/runs`, { credentials: "include" });
  if (!res.ok) throw new Error("getRuns failed");
  return res.json();
}

// Fetch static meta (presets, codeLines, lineActive) for an algorithm.
export async function getAlgoMeta(name) {
  const res = await fetch(`${BASE}/algorithms/${name}/meta`);
  if (!res.ok) throw new Error(`getAlgoMeta(${name}) failed`);
  return res.json();
}

// Fetch backend-computed algorithm steps.
// Returns { steps: AlgorithmStep[] }.
export async function getAlgorithmSteps(name, input) {
  const res = await fetch(`${BASE}/algorithms/${name}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`getAlgorithmSteps(${name}) failed`);
  return res.json();
}
