import { NextResponse } from "next/server";

// football-data.org v4 — FIFA World Cup competition code is "WC"
const BASE = "https://api.football-data.org/v4";

// Smart cache (free tier: 10 calls/min, plenty — but be polite):
// - While at least one match is live -> refresh every 3 minutes
// - Otherwise                        -> refresh every 5 minutes (catch newly-started matches)
const TTL_LIVE = 3 * 60 * 1000;
const TTL_IDLE = 5 * 60 * 1000;

const LIVE_STATUSES = ["IN_PLAY", "PAUSED"];

let cache = { data: null, time: 0, hadLive: false };

export async function GET() {
  try {
    if (!process.env.FOOTBALL_DATA_TOKEN) {
      return NextResponse.json({ fixtures: [] });
    }

    const ttl = cache.hadLive ? TTL_LIVE : TTL_IDLE;
    if (cache.data && Date.now() - cache.time < ttl) {
      return NextResponse.json({ fixtures: cache.data, cached: true, ttl: cache.hadLive ? "live" : "idle" });
    }

    const res = await fetch(`${BASE}/competitions/WC/matches`, {
      headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_TOKEN },
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("football-data.org error:", res.status, txt);
      if (cache.data) {
        return NextResponse.json({ fixtures: cache.data, cached: true, stale: true });
      }
     return NextResponse.json({ fixtures: [] });
    }

    const json = await res.json();

    const fixtures = (json.matches || []).map((m) => ({
      id: m.id,
      dateUTC: m.utcDate,
      status: m.status,                       // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED ...
      minute: m.minute ?? null,               // may be null on free tier
      home: m.homeTeam?.shortName || m.homeTeam?.name,
      homeFull: m.homeTeam?.name,
      away: m.awayTeam?.shortName || m.awayTeam?.name,
      awayFull: m.awayTeam?.name,
      goalsHome: m.score?.fullTime?.home,
      goalsAway: m.score?.fullTime?.away,
      stage: m.stage,                          // GROUP_STAGE | LAST_32 ...
      group: m.group,                          // e.g. "Group A"
    }));

    const hadLive = fixtures.some((f) => LIVE_STATUSES.includes(f.status));
    cache = { data: fixtures, time: Date.now(), hadLive };

    return NextResponse.json({ fixtures, live: hadLive });
  } catch (e) {
    console.error("Scores route error:", e);
    return NextResponse.json({ fixtures: [] });
  }
}
