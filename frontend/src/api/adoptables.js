export async function fetchAdoptables(params = {}) {
  const query = new URLSearchParams();

  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      query.set(key, String(params[key]));
    }
  }

  const BASE =
    import.meta.env.VITE_API_BASE || import.meta.env.VITE_BASE_URL + "/";

  const res = await fetch(`${BASE}/adoptables?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load adoptables");

  return res.json();
}
