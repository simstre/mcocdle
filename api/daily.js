import { kv } from "@vercel/kv";

function getTodayKey() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
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

  try {
    const data = await kv.get(`mcocdle:${date}`);

    if (!data) {
      return res.status(200).json({
        date,
        firstSolver: null,
        solvers: [],
        totalSolvers: 0,
      });
    }

    return res.status(200).json({
      date,
      firstSolver: data.firstSolver || null,
      solvers: data.solvers || [],
      totalSolvers: data.totalSolvers || 0,
    });
  } catch (err) {
    console.error("KV error (daily):", err.message);
    return res.status(200).json({
      date,
      firstSolver: null,
      solvers: [],
      totalSolvers: 0,
      _kvError: true,
    });
  }
}
