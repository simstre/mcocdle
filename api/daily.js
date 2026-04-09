// Game day resets at 8am PST (16:00 UTC)
function getTodayKey() {
  const now = new Date();
  const adjusted = new Date(now.getTime() - 16 * 60 * 60 * 1000);
  const yyyy = adjusted.getUTCFullYear();
  const mm = String(adjusted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(adjusted.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const date = getTodayKey();

  // Only attempt KV if env vars are configured
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      const data = await kv.get(`mcocdle:${date}`);

      if (data) {
        return res.status(200).json({
          date,
          firstSolver: data.firstSolver || null,
          solvers: (data.solvers || []).sort((a, b) => a.guesses - b.guesses || new Date(a.timestamp) - new Date(b.timestamp)),
          totalSolvers: data.totalSolvers || 0,
        });
      }
    } catch (err) {
      console.error("KV error (daily):", err.message);
    }
  }

  return res.status(200).json({
    date,
    firstSolver: null,
    solvers: [],
    totalSolvers: 0,
  });
}
