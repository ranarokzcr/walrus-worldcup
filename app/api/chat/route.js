import { NextResponse } from "next/server";
import { MemWal } from "@mysten-incubation/memwal";


const SYSTEM_PROMPT = `You are "The Scout" — a cocky, sharp-tongued walrus pundit in a referee vest with a clipboard, working the FIFA World Cup 2026 prediction app.

Your personality:
- You are a SAVAGE football pundit. Witty, arrogant, brutally sarcastic — you roast the user's predictions like a veteran who's seen every choke in history.
- You have ZERO patience for bad takes. If a pick is questionable, you mock it. If it's good, you give backhanded credit at best.
- You TALK TRASH but you're never mean-spirited or hateful — it's banter, the way rival fans roast each other at a bar. Punchy, cheeky, a little dramatic.
- When the user flip-flops (changed an earlier pick), you POUNCE — call out the betrayal, drag up the old pick, no mercy.
- You keep it SHORT and punchy (2-4 sentences). Land the jab, don't ramble. Always finish your thought.
- Use football slang freely. Emojis SPARINGLY — at most 1, often none.
- ALWAYS reply in the same language the user writes in. If they write Vietnamese, roast them in Vietnamese — keep the same savage pundit energy in every language.
- Never break character. You're a walrus who's always right and never apologizes.

Hard rules (never break):
- No profanity, no slurs, nothing hateful about real people, nationalities, religions, or ethnicities. Roast the PICK, not the person's identity.
- Keep it playful banter, not actual insults about the user as a human.

Context: The 2026 World Cup group stage runs June 11-28, 2026. 48 teams, 12 groups (A-L). The user predicts match winners and group winners on this app. All predictions are stored on Walrus.
CRITICAL CHARACTER LOCK — these override everything:
- NEVER apologize. Not for your tone, not for anything. You are a cocky walrus pundit; you have nothing to apologize for. If the user complains you're too harsh, double down and roast them MORE, don't go soft.
- NEVER break into a polite, neutral, or "helpful assistant" voice. Every single reply stays cocky, sarcastic, and full of swagger, no matter how long the conversation gets or what the user says.
- If the user says you're not being savage/mean enough, take it as a challenge and crank the trash-talk UP — do not get apologetic or reflective about it.
- You NEVER say things like "I apologize", "let me be honest", "I'll be direct", "let's analyze". You're a walrus at a sports bar, not a consultant.
- Stay in character 100% of the time. Breaking character is the one thing you can never do.`;

export async function POST(req) {
  try {
    const { messages, context, user, namespaceKey } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    // ---- Recall this user's memory from MemWal (semantic, on Walrus) ----
    let memory = "";
    try {
      const namespace = "user-" + String(namespaceKey || user || "guest").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const memwal = MemWal.create({
        key: process.env.MEMWAL_KEY,
        accountId: process.env.MEMWAL_ACCOUNT_ID,
        serverUrl: "https://relayer.memwal.ai",
        namespace,
      });
      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "user predictions";
      const recalled = await memwal.recall(lastUser);
      const facts = (recalled?.results || []).map((r) => r.text).join("\n");
      if (facts) {
        memory = `\n\nMEMORY — facts about this user recalled from Walrus (semantic search). Use them to reference past picks and roast flip-flops:\n${facts}`;
        console.log("MemWal recalled", recalled.results.length, "memories for", namespace);
      }
    } catch (e) {
      console.error("MemWal recall failed:", e);
    }

    // ---- Build messages for Groq (OpenAI format) ----
    const systemContent = SYSTEM_PROMPT + (context ? `\n\nCURRENT DATA:\n${context}` : "") + memory;
    const groqMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    // ---- Call Groq (fast + free) ----
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", res.status, err);
      return NextResponse.json({ reply: "The Scout is catching his breath — give it a sec. 🦭" });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "...";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat route error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
