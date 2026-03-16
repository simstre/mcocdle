import { kv } from "@vercel/kv";

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

  const { name, guesses, date } = req.body || {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name is required" });
  }

  if (!guesses || typeof guesses !== "number" || guesses < 1) {
    return res.status(400).json({ error: "guesses must be a positive number" });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }

  const kvKey = `mcocdle:${date}`;
  const solverEntry = {
    name: name.trim(),
    guesses,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = await kv.get(kvKey);

    if (!existing) {
      const record = {
        firstSolver: solverEntry,
        solvers: [solverEntry],
        totalSolvers: 1,
      };

      await kv.set(kvKey, record, { ex: 60 * 60 * 48 });

      return res.status(200).json({
        ...record,
        isFirst: true,
      });
    }

    // Add to solvers list (keep up to 10)
    const solvers = existing.solvers || [];
    if (solvers.length < 10) {
      solvers.push(solverEntry);
    }

    const updated = {
      ...existing,
      solvers,
      totalSolvers: (existing.totalSolvers || 1) + 1,
    };

    await kv.set(kvKey, updated, { ex: 60 * 60 * 48 });

    return res.status(200).json({
      firstSolver: updated.firstSolver,
      solvers: updated.solvers,
      totalSolvers: updated.totalSolvers,
      isFirst: false,
    });
  } catch (err) {
    console.error("KV error (solve):", err.message);
    return res.status(200).json({
      firstSolver: solverEntry,
      solvers: [solverEntry],
      totalSolvers: 1,
      isFirst: true,
      _kvError: true,
    });
  }
}
