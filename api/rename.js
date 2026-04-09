function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { playerId, name, date } = req.body || {};

  if (!playerId || typeof playerId !== "string") {
    return res.status(400).json({ error: "playerId is required" });
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name is required" });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }

  const kvKey = `mcocdle:${date}`;

  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      const existing = await kv.get(kvKey);

      if (!existing) {
        return res.status(200).json({ updated: false });
      }

      const trimmedName = name.trim();
      let changed = false;

      const solvers = (existing.solvers || []).map((s) => {
        if (s.playerId === playerId) {
          changed = true;
          return { ...s, name: trimmedName };
        }
        return s;
      });

      let firstSolver = existing.firstSolver;
      if (firstSolver?.playerId === playerId) {
        changed = true;
        firstSolver = { ...firstSolver, name: trimmedName };
      }

      if (!changed) {
        return res.status(200).json({ updated: false });
      }

      const updated = { ...existing, solvers, firstSolver };
      await kv.set(kvKey, updated, { ex: 60 * 60 * 48 });

      return res.status(200).json({ updated: true });
    } catch (err) {
      console.error("KV error (rename):", err.message);
    }
  }

  return res.status(200).json({ updated: false });
}
