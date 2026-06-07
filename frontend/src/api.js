// Pemanggilan backend dipisah ke sini biar rapi & mudah diganti.
// Ubah URL lewat file .env (VITE_API_URL=...) atau langsung di sini.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/predict";

export async function predictFruit(file, timeoutMs = 40000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const form = new FormData();
  form.append("file", file);
  try {
    const res = await fetch(API_URL, { method: "POST", body: form, signal: controller.signal });
    if (!res.ok) throw new Error("Server error " + res.status);
    return res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
