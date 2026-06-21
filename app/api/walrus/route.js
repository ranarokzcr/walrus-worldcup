import { NextResponse } from "next/server";
import { MemWal } from "@mysten-incubation/memwal";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { user, namespaceKey, matchPicks = {}, groupPicks = {}, scorePicks = {} } = await req.json();

    const lines = [];
    for (const [id, c] of Object.entries(matchPicks)) {
      const [d, h, a] = id.split("_");
      const pick = c === "draw" ? "a draw" : c === "home" ? h : a;
      const sc = scorePicks[id];
      const score = sc && sc.h !== "" && sc.a !== "" ? ` with a predicted scoreline of ${h} ${sc.h}-${sc.a} ${a}` : "";
      lines.push(`On ${d}, ${h} vs ${a}: predicted ${pick}${score}.`);
    }
    for (const [g, team] of Object.entries(groupPicks)) {
      lines.push(`Predicted ${team} to top Group ${g}.`);
    }
    if (lines.length === 0) return NextResponse.json({ ok: true });

    const text = `${user || "User"} predictions (as of ${new Date().toISOString().slice(0, 10)}):\n${lines.join("\n")}`;
    // Namespace keyed to the stable Google email so memory follows the user across browsers/devices
    const idForNs = namespaceKey || user || "guest";
    const namespace = "user-" + String(idForNs).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const memwal = MemWal.create({
      key: process.env.MEMWAL_KEY,
      accountId: process.env.MEMWAL_ACCOUNT_ID,
      serverUrl: "https://relayer.memwal.ai",
      namespace,
    });

    const job = await memwal.remember(text);
    const result = await memwal.waitForRememberJob(job.job_id);
    console.log("MemWal remembered for", namespace);
    // Return the Walrus blob id + owner so the UI can link to the on-chain record
    return NextResponse.json({ ok: true, blobId: result?.blob_id || null, owner: result?.owner || null });
  } catch (e) {
    console.error("MemWal remember error:", e);
    return NextResponse.json({ error: "memory store failed" }, { status: 500 });
  }
}