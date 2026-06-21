import { MemWal } from "@mysten-incubation/memwal";

const memwal = MemWal.create({
  key: process.env.MEMWAL_KEY,
  accountId: process.env.MEMWAL_ACCOUNT_ID,
serverUrl: "https://relayer.memwal.ai", // production (mainnet)  namespace: "walrus-worldcup",
});

await memwal.health();
console.log("MemWal connected ✓");

const job = await memwal.remember("User picked Brazil to win and rated Mexico vs South Africa 4 stars.");
await memwal.waitForRememberJob(job.job_id);
console.log("Remembered ✓");

const result = await memwal.recall("What has the user predicted?");
console.log("Recall:");
for (const m of result.results) console.log(" -", m.text);