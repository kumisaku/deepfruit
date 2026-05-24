// Pemanggilan backend dipisah ke sini biar rapi & mudah diganti.
// Ubah URL lewat file .env (VITE_API_URL=...) atau langsung di sini.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/predict";

export async function predictFruit(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(API_URL, { method: "POST", body: form });
  if (!res.ok) throw new Error("Server error " + res.status);
  return res.json();
}
