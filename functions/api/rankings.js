const allowedGamePattern = /^[a-z0-9-]{2,40}$/;

async function ensureTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game TEXT NOT NULL,
        player_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_game_scores_game_score ON game_scores(game, score DESC)").run();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function cleanGame(value) {
  const game = String(value || "").trim();
  return allowedGamePattern.test(game) ? game : "";
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ enabled: false, rows: [] });
  const url = new URL(request.url);
  const game = cleanGame(url.searchParams.get("game"));
  if (!game) return json({ enabled: false, rows: [] }, 400);

  await ensureTable(env.DB);
  const { results } = await env.DB
    .prepare(
      `SELECT score, created_at AS date
       FROM game_scores
       WHERE game = ?
       ORDER BY score DESC, created_at ASC
       LIMIT 10`,
    )
    .bind(game)
    .all();

  return json({ enabled: true, rows: results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ enabled: false, saved: false });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ enabled: true, saved: false }, 400);
  }

  const game = cleanGame(body.game);
  const score = Number(body.score);
  const playerId = String(body.playerId || "anonymous").slice(0, 80);
  if (!game || !Number.isFinite(score) || score < 0 || score > 100000) {
    return json({ enabled: true, saved: false }, 400);
  }

  await ensureTable(env.DB);
  await env.DB
    .prepare("INSERT INTO game_scores (game, player_id, score, created_at) VALUES (?, ?, ?, ?)")
    .bind(game, playerId, Math.round(score), new Date().toISOString())
    .run();

  return json({ enabled: true, saved: true });
}
