"use client";
import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// ============================================================
// DATA (times below are Vietnam time, UTC+7 — converted for display)
// ============================================================
const groupTeams = {
  A: [
    { n: "Mexico", c: "mx" },
    { n: "South Africa", c: "za" },
    { n: "South Korea", c: "kr" },
    { n: "Czechia", c: "cz" },
  ],
  B: [
    { n: "Canada", c: "ca" },
    { n: "Bosnia", c: "ba" },
    { n: "Qatar", c: "qa" },
    { n: "Switzerland", c: "ch" },
  ],
  C: [
    { n: "Brazil", c: "br" },
    { n: "Morocco", c: "ma" },
    { n: "Haiti", c: "ht" },
    { n: "Scotland", c: "gb-sct" },
  ],
  D: [
    { n: "USA", c: "us" },
    { n: "Paraguay", c: "py" },
    { n: "Australia", c: "au" },
    { n: "Türkiye", c: "tr" },
  ],
  E: [
    { n: "Germany", c: "de" },
    { n: "Curaçao", c: "cw" },
    { n: "Ivory Coast", c: "ci" },
    { n: "Ecuador", c: "ec" },
  ],
  F: [
    { n: "Netherlands", c: "nl" },
    { n: "Japan", c: "jp" },
    { n: "Sweden", c: "se" },
    { n: "Tunisia", c: "tn" },
  ],
  G: [
    { n: "Belgium", c: "be" },
    { n: "Egypt", c: "eg" },
    { n: "Iran", c: "ir" },
    { n: "New Zealand", c: "nz" },
  ],
  H: [
    { n: "Spain", c: "es" },
    { n: "Cabo Verde", c: "cv" },
    { n: "Saudi Arabia", c: "sa" },
    { n: "Uruguay", c: "uy" },
  ],
  I: [
    { n: "France", c: "fr" },
    { n: "Senegal", c: "sn" },
    { n: "Iraq", c: "iq" },
    { n: "Norway", c: "no" },
  ],
  J: [
    { n: "Argentina", c: "ar" },
    { n: "Algeria", c: "dz" },
    { n: "Austria", c: "at" },
    { n: "Jordan", c: "jo" },
  ],
  K: [
    { n: "Portugal", c: "pt" },
    { n: "DR Congo", c: "cd" },
    { n: "Uzbekistan", c: "uz" },
    { n: "Colombia", c: "co" },
  ],
  L: [
    { n: "England", c: "gb-eng" },
    { n: "Croatia", c: "hr" },
    { n: "Ghana", c: "gh" },
    { n: "Panama", c: "pa" },
  ],
};

const matchDays = {
  "12/06": [
    { h: "Mexico", a: "South Africa", t: "02:00", g: "A" },
    { h: "South Korea", a: "Czechia", t: "09:00", g: "A" },
  ],
  "13/06": [
    { h: "Canada", a: "Bosnia", t: "02:00", g: "B" },
    { h: "USA", a: "Paraguay", t: "08:00", g: "D" },
  ],
  "14/06": [
    { h: "Qatar", a: "Switzerland", t: "02:00", g: "B" },
    { h: "Morocco", a: "Brazil", t: "05:00", g: "C" },
    { h: "Haiti", a: "Scotland", t: "08:00", g: "C" },
    { h: "Australia", a: "Türkiye", t: "11:00", g: "D" },
  ],
  "15/06": [
    { h: "Germany", a: "Curaçao", t: "00:00", g: "E" },
    { h: "Netherlands", a: "Japan", t: "03:00", g: "F" },
    { h: "Ivory Coast", a: "Ecuador", t: "06:00", g: "E" },
    { h: "Sweden", a: "Tunisia", t: "09:00", g: "F" },
    { h: "Spain", a: "Cabo Verde", t: "23:00", g: "H" },
  ],
  "16/06": [
    { h: "Belgium", a: "Egypt", t: "02:00", g: "G" },
    { h: "Saudi Arabia", a: "Uruguay", t: "05:00", g: "H" },
    { h: "Iran", a: "New Zealand", t: "08:00", g: "G" },
  ],
  "17/06": [
    { h: "France", a: "Senegal", t: "02:00", g: "I" },
    { h: "Iraq", a: "Norway", t: "05:00", g: "I" },
    { h: "Argentina", a: "Algeria", t: "08:00", g: "J" },
    { h: "Austria", a: "Jordan", t: "11:00", g: "J" },
  ],
  "18/06": [
    { h: "Portugal", a: "DR Congo", t: "00:00", g: "K" },
    { h: "England", a: "Croatia", t: "03:00", g: "L" },
    { h: "Ghana", a: "Panama", t: "06:00", g: "L" },
    { h: "Uzbekistan", a: "Colombia", t: "09:00", g: "K" },
    { h: "Czechia", a: "South Africa", t: "23:00", g: "A" },
  ],
  "19/06": [
    { h: "Switzerland", a: "Bosnia", t: "02:00", g: "B" },
    { h: "Canada", a: "Qatar", t: "05:00", g: "B" },
    { h: "Mexico", a: "South Korea", t: "08:00", g: "A" },
  ],
  "20/06": [
    { h: "USA", a: "Australia", t: "02:00", g: "D" },
    { h: "Morocco", a: "Scotland", t: "05:00", g: "C" },
    { h: "Brazil", a: "Haiti", t: "07:30", g: "C" },
    { h: "Türkiye", a: "Paraguay", t: "10:00", g: "D" },
  ],
  "21/06": [
    { h: "Netherlands", a: "Sweden", t: "00:00", g: "F" },
    { h: "Germany", a: "Ivory Coast", t: "03:00", g: "E" },
    { h: "Ecuador", a: "Curaçao", t: "07:00", g: "E" },
    { h: "Tunisia", a: "Japan", t: "11:00", g: "F" },
    { h: "Spain", a: "Saudi Arabia", t: "23:00", g: "H" },
  ],
  "22/06": [
    { h: "Belgium", a: "Iran", t: "02:00", g: "G" },
    { h: "Uruguay", a: "Cabo Verde", t: "05:00", g: "H" },
    { h: "New Zealand", a: "Egypt", t: "08:00", g: "G" },
  ],
  "23/06": [
    { h: "Argentina", a: "Austria", t: "00:00", g: "J" },
    { h: "France", a: "Iraq", t: "04:00", g: "I" },
    { h: "Norway", a: "Senegal", t: "07:00", g: "I" },
    { h: "Jordan", a: "Algeria", t: "10:00", g: "J" },
  ],
  "24/06": [
    { h: "Portugal", a: "Uzbekistan", t: "00:00", g: "K" },
    { h: "England", a: "Ghana", t: "03:00", g: "L" },
    { h: "Panama", a: "Croatia", t: "06:00", g: "L" },
    { h: "Colombia", a: "DR Congo", t: "09:00", g: "K" },
  ],
  "25/06": [
    { h: "Switzerland", a: "Canada", t: "02:00", g: "B" },
    { h: "Bosnia", a: "Qatar", t: "02:00", g: "B" },
    { h: "Scotland", a: "Brazil", t: "05:00", g: "C" },
    { h: "Morocco", a: "Haiti", t: "05:00", g: "C" },
    { h: "Czechia", a: "Mexico", t: "08:00", g: "A" },
    { h: "South Africa", a: "South Korea", t: "08:00", g: "A" },
  ],
  "26/06": [
    { h: "Curaçao", a: "Ivory Coast", t: "03:00", g: "E" },
    { h: "Ecuador", a: "Germany", t: "03:00", g: "E" },
    { h: "Japan", a: "Sweden", t: "06:00", g: "F" },
    { h: "Tunisia", a: "Netherlands", t: "06:00", g: "F" },
    { h: "Türkiye", a: "USA", t: "09:00", g: "D" },
    { h: "Paraguay", a: "Australia", t: "09:00", g: "D" },
  ],
  "27/06": [
    { h: "Norway", a: "France", t: "02:00", g: "I" },
    { h: "Senegal", a: "Iraq", t: "02:00", g: "I" },
    { h: "Cabo Verde", a: "Saudi Arabia", t: "07:00", g: "H" },
    { h: "Uruguay", a: "Spain", t: "07:00", g: "H" },
    { h: "Egypt", a: "Iran", t: "10:00", g: "G" },
    { h: "New Zealand", a: "Belgium", t: "10:00", g: "G" },
  ],
  "28/06": [
    { h: "Panama", a: "England", t: "04:00", g: "L" },
    { h: "Croatia", a: "Ghana", t: "04:00", g: "L" },
    { h: "Colombia", a: "Portugal", t: "06:30", g: "K" },
    { h: "DR Congo", a: "Uzbekistan", t: "06:30", g: "K" },
    { h: "Algeria", a: "Austria", t: "09:00", g: "J" },
    { h: "Jordan", a: "Argentina", t: "09:00", g: "J" },
  ],
};

const knockoutData = {
  "Round of 32": [
    { t: 73, d: "29/06", g: "02:00", h: "Runner-up Group A", a: "Runner-up Group B" },
    { t: 74, d: "30/06", g: "03:30", h: "Winner Group E", a: "3rd Place ABCDF" },
    { t: 75, d: "30/06", g: "08:00", h: "Winner Group F", a: "Runner-up Group C" },
    { t: 76, d: "30/06", g: "00:00", h: "Winner Group C", a: "Runner-up Group F" },
    { t: 77, d: "01/07", g: "04:00", h: "Winner Group I", a: "3rd Place CDFGH" },
    { t: 78, d: "01/07", g: "00:00", h: "Runner-up Group E", a: "Runner-up Group I" },
    { t: 79, d: "01/07", g: "08:00", h: "Winner Group A", a: "3rd Place CEFHI" },
    { t: 80, d: "01/07", g: "23:00", h: "Winner Group L", a: "3rd Place EHIJK" },
    { t: 81, d: "02/07", g: "07:00", h: "Winner Group D", a: "3rd Place BEFIJ" },
    { t: 82, d: "02/07", g: "03:00", h: "Winner Group G", a: "3rd Place AEHIJ" },
    { t: 83, d: "03/07", g: "06:00", h: "Runner-up Group K", a: "Runner-up Group L" },
    { t: 84, d: "03/07", g: "02:00", h: "Winner Group H", a: "Runner-up Group J" },
    { t: 85, d: "03/07", g: "10:00", h: "Winner Group B", a: "3rd Place EFGIJ" },
    { t: 86, d: "04/07", g: "05:00", h: "Winner Group J", a: "Runner-up Group H" },
    { t: 87, d: "04/07", g: "08:30", h: "Winner Group K", a: "3rd Place DEIJL" },
    { t: 88, d: "04/07", g: "01:00", h: "Runner-up Group D", a: "Runner-up Group G" },
  ],
  "Round of 16": [
    { t: 89, d: "05/07", g: "00:00", h: "Winner Match 73", a: "Winner Match 75" },
    { t: 90, d: "05/07", g: "04:00", h: "Winner Match 74", a: "Winner Match 77" },
    { t: 91, d: "06/07", g: "03:00", h: "Winner Match 76", a: "Winner Match 78" },
    { t: 92, d: "06/07", g: "07:00", h: "Winner Match 79", a: "Winner Match 80" },
    { t: 93, d: "07/07", g: "02:00", h: "Winner Match 83", a: "Winner Match 84" },
    { t: 94, d: "07/07", g: "07:00", h: "Winner Match 81", a: "Winner Match 82" },
    { t: 95, d: "07/07", g: "23:00", h: "Winner Match 86", a: "Winner Match 88" },
    { t: 96, d: "08/07", g: "03:00", h: "Winner Match 85", a: "Winner Match 87" },
  ],
  "Quarter-finals": [
    { t: 97, d: "10/07", g: "03:00", h: "Winner Match 89", a: "Winner Match 90" },
    { t: 98, d: "11/07", g: "02:00", h: "Winner Match 93", a: "Winner Match 94" },
    { t: 99, d: "12/07", g: "04:00", h: "Winner Match 91", a: "Winner Match 92" },
    { t: 100, d: "12/07", g: "08:00", h: "Winner Match 95", a: "Winner Match 96" },
  ],
  "Semi-finals": [
    { t: 101, d: "15/07", g: "02:00", h: "Winner Match 97", a: "Winner Match 98" },
    { t: 102, d: "16/07", g: "02:00", h: "Winner Match 99", a: "Winner Match 100" },
  ],
  "Third Place Play-off": [
    { t: 103, d: "19/07", g: "04:00", h: "Loser Match 101", a: "Loser Match 102" },
  ],
  "Final": [
    { t: 104, d: "20/07", g: "02:00", h: "Winner Match 101", a: "Winner Match 102" },
  ],
};

const WALRUS = {
  ref_whistle: { img: "/walrus/1.png", name: "The Ref" },
  scout: { img: "/walrus/2.png", name: "The Scout" },
  trophy: { img: "/walrus/3.png", name: "The Ref" },
  laugh: { img: "/walrus/4.png", name: "The Ref" },
  kneel: { img: "/walrus/5.png", name: "The Ref" },
};

// ============================================================
// HELPERS
// ============================================================
const flagUrl = (code, size = 40) => `https://flagcdn.com/w${size}/${code}.png`;
const teamFlag = (name) => {
  const t = Object.values(groupTeams).flat().find((x) => x.n === name);
  return t ? flagUrl(t.c) : null;
};
// Storage key — NEVER change this format or saved picks will be lost
const matchId = (m, day) => `${day}_${m.h}_${m.a}`;
// Display-only date formatter: "12/06" (DD/MM) -> "06/12" (MM/DD)
const fmtDate = (d) => {
  const [dd, mm] = d.split("/");
  return `${mm}/${dd}`;
};

// Kickoff as a real Date. Source data is Vietnam time (UTC+7), year 2026.
const kickoffDate = (day, t) => {
  const [dd, mm] = day.split("/").map(Number);
  const [hh, min] = t.split(":").map(Number);
  // Date.UTC with VN hour minus 7 gives the true UTC instant
  return new Date(Date.UTC(2026, mm - 1, dd, hh - 7, min));
};

// Display label in UTC, e.g. "19:00 UTC · 06/11"
const utcLabel = (day, t) => {
  const d = kickoffDate(day, t);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${hh}:${min} UTC · ${mm}/${dd}`;
};

// Voting locks at kickoff + 45 minutes
const VOTE_LOCK_MS = 45 * 60 * 1000;
const isLocked = (day, t) => Date.now() >= kickoffDate(day, t).getTime() + VOTE_LOCK_MS;


// Find matches happening "today" in UTC. Returns { label, day, list }.
const findTodayMatches = () => {
  const now = new Date();
  const todayUTC = `${String(now.getUTCDate()).padStart(2, "0")}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  // Our data keys are VN-time dates; gather every match whose UTC calendar day is today,
  // across all date buckets (a VN day can split across two UTC days)
  let collected = [];
  for (const day of Object.keys(matchDays)) {
    matchDays[day].forEach((m) => {
      const d = kickoffDate(day, m.t);
      const mDay = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      if (mDay === todayUTC) collected.push({ ...m, day, _kick: d.getTime() });
    });
  }
  if (collected.length === 0) return null;
  // Sort: live first, then upcoming (soonest first), then finished (latest first)
  const rank = (m) => {
    const ko = m._kick;
    const nowMs = Date.now();
    if (nowMs >= ko && nowMs < ko + 120 * 60 * 1000) return 0; // roughly in-play window (~2h)
    if (ko > nowMs) return 1;                                   // not started yet
    return 2;                                                   // finished
  };
  collected.sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 1) return a._kick - b._kick; // upcoming: soonest first
    return b._kick - a._kick;               // live/finished: most recent first
  });
  // keep the original shape: { day, list }
  return { day: collected[0].day, list: collected };
};
// Find the next upcoming match (first match whose kickoff is in the future)
const findNextMatch = () => {
  const now = Date.now();
  for (const day of Object.keys(matchDays)) {
    for (const m of matchDays[day]) {
      if (kickoffDate(day, m.t).getTime() > now) return { ...m, day };
    }
  }
  // Tournament group stage over — fall back to the first match
  const firstDay = Object.keys(matchDays)[0];
  return { ...matchDays[firstDay][0], day: firstDay };
};

// ============================================================
// MAIN
// ============================================================
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [lastBlobId, setLastBlobId] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const [page, setPage] = useState("home"); // home | matches | groups | knockout | predictions
  const [activeDay, setActiveDay] = useState("12/06");
  const [activeGroup, setActiveGroup] = useState("A");
  const [activeKnockout, setActiveKnockout] = useState("Round of 32");
  const [koView, setKoView] = useState("list"); // "list" | "bracket"
  const [resultsMonth, setResultsMonth] = useState("all");
  const [showGroups, setShowGroups] = useState(false);
  const [resultsDay, setResultsDay] = useState("all");
  const [resultsGroup, setResultsGroup] = useState("all");
  const [teamPopup, setTeamPopup] = useState(null);
  const [matchModal, setMatchModal] = useState(null); // { match with day } — opened from ticker/cards

  // Predictions
  const [matchPicks, setMatchPicks] = useState({});
  const [groupPicks, setGroupPicks] = useState({});
  const [scorePicks, setScorePicks] = useState({}); // { matchId: { h, a } }
  const [confirmedScores, setConfirmedScores] = useState({});
  

  // Walrus
  const [walrus, setWalrus] = useState(null);
  const [walrusShake, setWalrusShake] = useState(false);
  const walrusTimer = useRef(null);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const chatEndRef = useRef(null);
  const chatVisibleRef = useRef(false);

  const [nextMatch, setNextMatch] = useState(null);
  const [todayMatches, setTodayMatches] = useState(null);
  const [liveScores, setLiveScores] = useState([]);
 

  // Fetch live scores every 5 minutes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        if (data.fixtures) setLiveScores(data.fixtures);
      } catch (e) {}
    };
    load();
    const id = setInterval(load, 3 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Match our local data to an API fixture by team names (with aliases)
  // football-data.org may use different team names — match against both short and full names
  const NAME_ALIAS = { "South Korea": "Korea Republic", "Czechia": "Czech Republic", "Türkiye": "Turkey", "Bosnia": "Bosnia and Herzegovina", "DR Congo": "Congo DR", "USA": "United States", "Ivory Coast": "Côte d'Ivoire", "Cabo Verde": "Cape Verde" };
  const matchTeam = (apiF, ours) =>
    apiF === ours || apiF === NAME_ALIAS[ours] ||
    (apiF || "").toLowerCase().includes(ours.toLowerCase());
  const findScore = (m) => liveScores.find((f) =>
    (matchTeam(f.home, m.h) || matchTeam(f.homeFull, m.h)) &&
    (matchTeam(f.away, m.a) || matchTeam(f.awayFull, m.a))
  ) || liveScores.find((f) =>
    (matchTeam(f.home, m.a) || matchTeam(f.homeFull, m.a)) &&
    (matchTeam(f.away, m.h) || matchTeam(f.awayFull, m.h))
  );
  // Flag lookup for API team names (reverse-matches our local names via alias)
  const apiTeamFlag = (apiName) => {
    const direct = teamFlag(apiName);
    if (direct) return direct;
    const ours = Object.values(groupTeams).flat().find((t) =>
      matchTeam(apiName, t.n)
    );
    return ours ? flagUrl(ours.c) : null;
  };

  useEffect(() => {
    const t = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => clearTimeout(t);
  }, [chatMessages, chatLoading]);

  // Keep a live ref of chat visibility; clear the unread badge when chat is open
  useEffect(() => {
    const visible = chatOpen && !chatMinimized;
    chatVisibleRef.current = visible;
    if (visible) setHasUnread(false);
  }, [chatOpen, chatMinimized]);
  // Inject the scout-wiggle keyframes into <head> once (no stray <style> in the body)
  useEffect(() => {
    const id = "scout-wiggle-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `@keyframes scout-wiggle { 0%,100% { transform: rotate(0deg); } 3% { transform: rotate(-7deg); } 8% { transform: rotate(6deg); } 13% { transform: rotate(-4deg); } 18% { transform: rotate(3deg); } 23% { transform: rotate(0deg); } }`;
    document.head.appendChild(el);
  }, []);

  // Restore session + predictions; compute next match (refresh every minute)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wc_user");
      if (saved) {
        const user = JSON.parse(saved);
        setUserName(user.name);
        setUserPicture(user.picture || "");
        setUserEmail(user.email || "");
        setIsLoggedIn(true);
      }
      const mp = localStorage.getItem("wc_match_picks");
      if (mp) setMatchPicks(JSON.parse(mp));
      const gp = localStorage.getItem("wc_group_picks");
      if (gp) setGroupPicks(JSON.parse(gp));
      const lb = localStorage.getItem("wc_last_blob");
      if (lb) setLastBlobId(lb);
      const sp = localStorage.getItem("wc_score_picks");
      if (sp) setScorePicks(JSON.parse(sp));
      
    } catch (e) {}
    setNextMatch(findNextMatch());
    setTodayMatches(findTodayMatches());
    const id = setInterval(() => { setNextMatch(findNextMatch()); setTodayMatches(findTodayMatches()); }, 60000);
    return () => clearInterval(id);
  }, []);
// ---- Auto-sync predictions to Walrus ----
  const walrusFirstRun = useRef(true);
  useEffect(() => {
    if (walrusFirstRun.current) { walrusFirstRun.current = false; return; } // skip first load
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/walrus", {
          method: "POST",
          body: JSON.stringify({
            user: userName,
            namespaceKey: userEmail,
            matchPicks,
            groupPicks,
            scorePicks,
            updatedAt: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        if (data.blobId) {
          setLastBlobId(data.blobId);
          localStorage.setItem("wc_last_blob", data.blobId);
        }
      } catch (e) {
        console.error("Walrus sync failed:", e);
      }
    }, 5000); // debounce 5s after last change, then sync (batch edits, stay under rate limit)
    return () => clearTimeout(t);
  }, [matchPicks, groupPicks, scorePicks]);
  // ---- One-time nickname ----
  const [nickLocked, setNickLocked] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  useEffect(() => {
    const nn = localStorage.getItem("wc_nickname");
    if (nn) { setUserName(nn); setNickLocked(true); }
  }, []);
  const saveNickname = () => {
    const name = (nickDraft.trim() || userName || "Player").slice(0, 20);
    localStorage.setItem("wc_nickname", name);
    setUserName(name);
    setNickLocked(true);
  };

  // Close popups with Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setTeamPopup(null);
        setMatchModal(null);
        setUserMenuOpen(false);
        setChatMinimized(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- Walrus helper ----
  const showWalrus = (type, msg) => {
    if (walrusTimer.current) clearTimeout(walrusTimer.current);
    setWalrus({ type, msg });
    setWalrusShake(true);
    setTimeout(() => setWalrusShake(false), 1600);
    walrusTimer.current = setTimeout(() => setWalrus(null), 6500);
  };

  // ---- Login ----
  const handleLogin = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const name = decoded.given_name || decoded.name || "Champion";
      setUserName(name);
      setUserPicture(decoded.picture || "");
      setUserEmail(decoded.email || "");
      setIsLoggedIn(true);
      localStorage.setItem("wc_user", JSON.stringify({ name, email: decoded.email, picture: decoded.picture }));
      setTimeout(() => {
        showWalrus("scout", `Welcome to the pitch, ${name}! Make your predictions and let's see if you know football.`);
      }, 800);
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("wc_user");
    setIsLoggedIn(false);
    setUserName("");
    setUserPicture("");
    setUserMenuOpen(false);
  };

  // ---- Match pick ----
  const pickMatch = (m, day, choice) => {
    if (isLocked(day, m.t)) {
      showWalrus("ref_whistle", `Too late! Voting for ${m.h} vs ${m.a} closed 45 minutes after kickoff. The whistle has blown.`);
      return;
    }
    const id = matchId(m, day);
    const prev = matchPicks[id];
    const next = { ...matchPicks, [id]: choice };
    setMatchPicks(next);
    localStorage.setItem("wc_match_picks", JSON.stringify(next));

    if (prev && prev !== choice) {
      const roasts = [
        `Changing your pick on ${m.h} vs ${m.a}? The clipboard remembers EVERYTHING, my friend.`,
        `Wait wait wait. You JUST said the opposite. I have it in writing.`,
        `Flip-flopping already? Bold strategy. The clipboard is judging you.`,
        `Another switch on ${m.h} vs ${m.a}?! Pick a side and STAY there!`,
        `I've seen weather forecasts more consistent than your predictions.`,
      ];
      showWalrus("laugh", roasts[Math.floor(Math.random() * roasts.length)]);
      return;
    }
    const label = choice === "draw" ? "a draw" : choice === "home" ? m.h : m.a;
    const lines = [
      `${label}? Bold. The ref is watching this one closely.`,
      `Locked in: ${label}. Don't come crying to me later.`,
      `Interesting. ${label}. Let's see how that ages.`,
    ];
    showWalrus("ref_whistle", lines[Math.floor(Math.random() * lines.length)]);
  };

  // ---- Knockout pick (Round of 32) — stored in the SAME matchPicks → same Walrus sync.
  // Knockout time is m.g (m.t is the match number), so lock on m.g.
  const pickKnockout = (m, choice) => {
    if (isLocked(m.d, m.g)) {
      showWalrus("ref_whistle", `Too late! That tie has kicked off — the whistle has blown.`);
      return;
    }
    const id = matchId(m, m.d);
    const prev = matchPicks[id];
    const next = { ...matchPicks, [id]: choice };
    setMatchPicks(next);
    localStorage.setItem("wc_match_picks", JSON.stringify(next));
    if (prev && prev !== choice) {
      showWalrus("laugh", `Switching your Round of 32 pick already? The clipboard remembers EVERYTHING.`);
      return;
    }
    showWalrus("ref_whistle", `Locked in. Let's see if you can read a knockout tie.`);
  };

  // ---- Group winner pick ----
  const setScore = (id, side, value) => {
    const v = value === "" ? "" : Math.max(0, Math.min(20, parseInt(value) || 0));
    const cur = scorePicks[id] || { h: "", a: "" };
    const next = { ...scorePicks, [id]: { ...cur, [side]: v } };
    setScorePicks(next);
    localStorage.setItem("wc_score_picks", JSON.stringify(next));
  };
  const confirmScore = (id, m) => {
    setConfirmedScores((prev) => ({ ...prev, [id]: true }));
    const sc = scorePicks[id];
    const h = sc.h, a = sc.a;
    const total = Number(h) + Number(a);
    const lines = [
      `${m.h} ${h}-${a} ${m.a}? Bold scoreline. The clipboard just wrote it down — no take-backs.`,
      `${h}-${a}, huh? I've seen worse predictions. Not many, but I've seen them.`,
      `Locked in: ${h}-${a}. When this ages like milk, don't say the Scout didn't warn you.`,
      `Ohhh you're committing to ${m.h} ${h}-${a} ${m.a}? Brave. Stupid, maybe. But brave.`,
      `${h}-${a}. Noted. Filed. Saved forever. I WILL bring this up later.`,
      `A confident ${h}-${a}. I respect the audacity more than the logic.`,
      `${h}-${a}? My whiskers are twitching and not in a good way. But sure, it's your funeral.`,
      total >= 6 ? `${total} goals total? What is this, basketball? Bold call.` : `${h}-${a}. Defensive masterclass or you just don't believe in goals?`,
      h === a ? `A ${h}-${a} draw? Playing it safe, I see. The ref notices cowardice.` : `${h}-${a} — you're really backing ${h > a ? m.h : m.a} here. Putting your whole reputation on it.`,
      `Saved. The clipboard never forgets, and neither do I. ${m.h} ${h}-${a} ${m.a} is on the record now.`,
    ];
    showWalrus("laugh", lines[Math.floor(Math.random() * lines.length)]);
  };
  
  const pickGroupWinner = (groupId, teamName) => {
    const prev = groupPicks[groupId];
    const next = { ...groupPicks, [groupId]: teamName };
    setGroupPicks(next);
    localStorage.setItem("wc_group_picks", JSON.stringify(next));

    if (prev && prev !== teamName) {
      const roasts = [
        `Oh? It was ${prev}, now it's ${teamName}? Group ${groupId} traitor alert!`,
        `${prev} got abandoned real quick. ${teamName} fans, don't trust this one.`,
        `Switching from ${prev} to ${teamName}? The clipboard has noted your betrayal.`,
        `Loyalty level: zero. ${prev} deserved better than this.`,
      ];
      showWalrus("laugh", roasts[Math.floor(Math.random() * roasts.length)]);
    } else if (!prev) {
      showWalrus("ref_whistle", `${teamName} to top Group ${groupId}. Noted on the clipboard.`);
    }
  };

  // ---- Chat ----
  const buildContext = () => {
    const finished = liveScores.filter((f) => f.status === "FINISHED").slice(0, 40)
      .map((f) => `${f.home} ${f.goalsHome}-${f.goalsAway} ${f.away} (FT)`).join("; ");
    const picks = Object.entries(matchPicks).slice(0, 40)
      .map(([id, c]) => { const [d, h, a] = id.split("_"); return `${h} vs ${a}: user picked ${c}`; }).join("; ");
    return `LIVE RESULTS: ${finished || "none yet"}. USER PREDICTIONS: ${picks || "none yet"}.`;
  };
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ messages: newMsgs, context: buildContext(), user: userName, namespaceKey: userEmail }),
      });
      const data = await res.json();
      setChatMessages([...newMsgs, { role: "assistant", content: data.reply || "The Scout is speechless. That's rare. Try again." }]);
    } catch (e) {
      setChatMessages([...newMsgs, { role: "assistant", content: "The Scout dropped his clipboard. Try again." }]);
    }
    if (!chatVisibleRef.current) setHasUnread(true);
    setChatLoading(false);
  };

  // ---- Compute group standings from finished API matches ----
  const computeStandings = (groupId) => {
    const code = `GROUP_${groupId}`;
    // start every team in this group at zero
    const table = {};
    groupTeams[groupId].forEach((t) => {
      table[t.n] = { name: t.n, c: t.c, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
    });
    // walk finished matches that belong to this group
    liveScores
      .filter((f) => f.status === "FINISHED" && f.group === code)
      .forEach((f) => {
        // map API team names back to our local names
        const homeT = groupTeams[groupId].find((t) => matchTeam(f.home, t.n) || matchTeam(f.homeFull, t.n));
        const awayT = groupTeams[groupId].find((t) => matchTeam(f.away, t.n) || matchTeam(f.awayFull, t.n));
        if (!homeT || !awayT) return;
        const h = table[homeT.n], a = table[awayT.n];
        const gh = f.goalsHome ?? 0, ga = f.goalsAway ?? 0;
        h.P++; a.P++;
        h.GF += gh; h.GA += ga;
        a.GF += ga; a.GA += gh;
        if (gh > ga) { h.W++; h.Pts += 3; a.L++; }
        else if (gh < ga) { a.W++; a.Pts += 3; h.L++; }
        else { h.D++; a.D++; h.Pts++; a.Pts++; }
      });
    // finalize GD and sort: Pts → GD → GF
    return Object.values(table)
      .map((r) => ({ ...r, GD: r.GF - r.GA }))
      .sort((x, y) => y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF);
  };
  // ---- Knockout: resolve group-based slots into real teams ----
  // A group is "done" only when all 6 of its matches are FINISHED.
  const groupFinished = (groupId) => {
    const code = `GROUP_${groupId}`;
    return liveScores.filter((f) => f.status === "FINISHED" && f.group === code).length >= 6;
  };
  // Tiebreak across groups: points -> goal diff -> goals for -> name
  const rankCompareTeams = (a, b) =>
    b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name);
  // Assign the 8 best third-placed teams to the 8 "3rd Place XXXXX" R32 slots
  // via backtracking: each qualified group goes to a slot whose letters contain it.
  const buildThirdMap = () => {
    const groups = Object.keys(groupTeams);
    if (!groups.every(groupFinished)) return {};
    const thirds = groups.map((g) => ({ g, team: computeStandings(g)[2] }));
    thirds.sort((a, b) => rankCompareTeams(a.team, b.team));
    const qualified = thirds.slice(0, 8).map((x) => x.g);

    const slots = (knockoutData["Round of 32"] || [])
      .flatMap((mt) => [mt.h, mt.a])
      .filter((l) => l.startsWith("3rd Place"))
      .map((l) => ({ label: l, allowed: l.replace("3rd Place ", "").split("") }));

    const map = {};
    const used = new Set();
    const assign = (i) => {
      if (i === slots.length) return true;
      for (const g of qualified) {
        if (!used.has(g) && slots[i].allowed.includes(g)) {
          used.add(g);
          map[slots[i].label] = g;
          if (assign(i + 1)) return true;
          used.delete(g);
          delete map[slots[i].label];
        }
      }
      return false;
    };
    if (!assign(0)) return {};

    const out = {};
    Object.keys(map).forEach((l) => (out[l] = computeStandings(map[l])[2].name));
    return out;
  };
  // One R32 slot label -> real team name, or null if not decided yet
  const resolveR32 = (label, thirdMap) => {
    const gm = label.match(/Group ([A-L])$/);
    if (gm && (label.startsWith("Winner") || label.startsWith("Runner-up"))) {
      const g = gm[1];
      if (!groupFinished(g)) return null;
      const rows = computeStandings(g);
      return label.startsWith("Winner") ? rows[0].name : rows[1].name;
    }
    if (label.startsWith("3rd Place")) return thirdMap[label] || null;
    return null; // "Winner Match N" (inner rounds) handled separately
  };
  // Render a knockout slot: flag + team if known, else the placeholder label
  const koSlot = (label, thirdMap) => {
    const team = resolveR32(label, thirdMap);
    if (!team) return <span style={{ color: "var(--text-dim)", fontWeight: 700 }}>{label}</span>;
    const flag = teamFlag(team);
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {flag && <img src={flag} alt="" style={{ width: 26, height: 18, borderRadius: 3, objectFit: "cover" }} />}
        <span style={{ fontWeight: 800 }}>{team}</span>
      </span>
    );
  };
  // ---- Knockout bracket (tree view) — inline styles (no globals.css dependency) ----
  const KO_LINE = "rgba(212,175,55,0.4)"; // connector color
  const allKoById = () => {
    const all = {};
    Object.values(knockoutData).forEach((arr) => arr.forEach((m) => (all[m.t] = m)));
    if (!all[104]) all[104] = { t: 104, d: "20/07", g: "02:00", h: "Winner Match 101", a: "Winner Match 102" };
    return all;
  };
  const feederId = (label) => {
    const mm = label.match(/Match (\d+)/);
    return mm ? parseInt(mm[1], 10) : null;
  };
  const koRoundTitle = (id) => {
    if (id <= 88) return "Round of 32";
    if (id <= 96) return "Round of 16";
    if (id <= 100) return "Quarter-finals";
    if (id <= 102) return "Semi-finals";
    return "Final";
  };
  const bracketColumns = () => {
    const all = allKoById();
    const order = {};
    const walk = (id, depth) => {
      const mm = all[id];
      if (!order[depth]) order[depth] = [];
      if (!mm) { order[depth].push(id); return; }
      const lh = feederId(mm.h), la = feederId(mm.a);
      const hasKids = (lh && all[lh]) || (la && all[la]);
      if (hasKids) {
        if (lh && all[lh]) walk(lh, depth + 1);
        if (la && all[la]) walk(la, depth + 1);
      }
      order[depth].push(id);
    };
    walk(104, 0);
    return Object.keys(order)
      .map(Number)
      .sort((a, b) => b - a)
      .map((d) => ({ title: koRoundTitle(all[order[d][0]].t), matches: order[d].map((id) => all[id]) }));
  };
  const bracketSlot = (label, thirdMap) => {
    const team = resolveR32(label, thirdMap);
    if (!team)
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 22, height: 14, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 11 }}>⬡</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", lineHeight: 1.15 }}>{label}</span>
        </div>
      );
    const flag = teamFlag(team);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {flag ? <img src={flag} alt="" style={{ width: 22, height: 14, borderRadius: 2, objectFit: "cover", flex: "none" }} /> : <span style={{ width: 22, height: 14, flex: "none" }} />}
        <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text)", textTransform: "uppercase", lineHeight: 1.15 }}>{team}</span>
      </div>
    );
  };
  const bracketCard = (m, hasIncoming, isLastCol, thirdMap) => (
    <div key={m.t} style={{ position: "relative", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: "10px 12px", minHeight: 78, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7 }}>
      {hasIncoming && <div style={{ position: "absolute", right: "100%", top: "50%", width: 18, height: 2, background: KO_LINE }} />}
      {!isLastCol && <div style={{ position: "absolute", left: "100%", top: "50%", width: 16, height: 2, background: KO_LINE }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 800 }}>#{m.t}</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>{fmtDate(m.d)}</span>
      </div>
      {bracketSlot(m.h, thirdMap)}
      {bracketSlot(m.a, thirdMap)}
    </div>
  );
  const bracketColumn = (col, isLastCol, isFirstCol, thirdMap) => {
    let body;
    if (isLastCol) {
      body = (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1 }}>
          {bracketCard(col.matches[0], !isFirstCol, true, thirdMap)}
        </div>
      );
    } else {
      const pairs = [];
      for (let i = 0; i < col.matches.length; i += 2) {
        pairs.push(
          <div key={i} style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1 }}>
            <div style={{ position: "absolute", left: "calc(100% + 16px)", top: "25%", bottom: "25%", width: 2, background: KO_LINE }} />
            <div style={{ position: "absolute", left: "calc(100% + 16px)", top: "50%", width: 18, height: 2, background: KO_LINE }} />
            {bracketCard(col.matches[i], !isFirstCol, false, thirdMap)}
            {bracketCard(col.matches[i + 1], !isFirstCol, false, thirdMap)}
          </div>
        );
      }
      body = pairs;
    }
    return (
      <div key={col.title + "-" + col.matches[0].t} style={{ display: "flex", flexDirection: "column", width: 224, flex: "0 0 224px", padding: "0 18px" }}>
        <div style={{ color: "var(--gold)", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", marginBottom: 16 }}>{col.title}</div>
        <div style={{ height: 1340, display: "flex", flexDirection: "column" }}>{body}</div>
      </div>
    );
  };
  const renderKnockoutBracket = () => {
    const thirdMap = buildThirdMap();
    const cols = bracketColumns();
    return (
      <div style={{ overflowX: "auto", width: "100%", paddingBottom: 8 }}>
        <div style={{ display: "flex", minWidth: 1180, padding: "8px 0" }}>
          {cols.map((col, i) => bracketColumn(col, i === cols.length - 1, i === 0, thirdMap))}
        </div>
      </div>
    );
  };
  const getTeamMatches = (teamName) => {
    const res = [];
    for (const day in matchDays) {
      matchDays[day].forEach((m) => {
        if (m.h === teamName || m.a === teamName) res.push({ ...m, d: day });
      });
    }
    return res;
  };

  const chatVisible = chatOpen && !chatMinimized;

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isLoggedIn) {
    return (
      <>
        <div className="main-bg-wrapper"><div className="main-bg" /></div>
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <div className="lg-glass-strong fade-up" style={{ width: "100%", maxWidth: 560, borderRadius: 32, padding: "48px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <img src="/walrus/1.png" alt="The Ref" className={`${walrusShake ? "walrus-shake" : ""}`} style={{ width: 170, height: 170, objectFit: "contain", filter: "drop-shadow(0 12px 36px rgba(0,0,0,0.7))", marginBottom: 24 }} />
            <p className="worldcup-font" style={{ color: "var(--gold)", fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
              FIFA World Cup 2026
            </p>
            <h1 className="worldcup-font" style={{ fontSize: 32, color: "var(--text)", lineHeight: 1.2, marginBottom: 18 }}>
              Predict. Support.<br />Get Roasted.
            </h1>
            <p style={{ color: "var(--text-dim)", fontSize: 15, lineHeight: 1.6, maxWidth: 380, marginBottom: 10 }}>
              The Ref says: this is a no-entry zone for strangers.
              Sign in first, then you step on the pitch.
            </p>
            <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 28, opacity: 0.7 }}>
              The ref doesn&apos;t negotiate.
            </p>
            <GoogleLogin
              onSuccess={handleLogin}
              onError={() => console.error("Login Failed")}
              theme="filled_black"
              size="large"
              shape="pill"
            />
            <p style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 24, opacity: 0.6 }}>
              Powered by zkLogin · Walrus Protocol
            </p>
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // APP
  // ============================================================
  return (
    <>
      <div className="main-bg-wrapper"><div className="main-bg" /></div>
      {isLoggedIn && !nickLocked && (
        <div style={{ position: "fixed", inset: 0, zIndex: 6000, background: "rgba(6,12,22,0.93)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="lg-glass-strong" style={{ width: "100%", maxWidth: 380, borderRadius: 22, padding: "28px 26px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>🦭</div>
            <h2 className="worldcup-font" style={{ fontSize: 20, marginBottom: 6 }}>Choose your nickname</h2>
            <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 18 }}>
              This is how The Scout will know you — you can set it only once. (Leave blank to keep your Google name.)
            </p>
            <input
              value={nickDraft}
              onChange={(e) => setNickDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveNickname(); }}
              maxLength={20}
              autoFocus
              placeholder={userName || "Your nickname"}
              style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", marginBottom: 14, textAlign: "center" }}
            />
            <button onClick={saveNickname} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "#D4AF37", color: "#1a1200", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Enter the app →
            </button>
          </div>
        </div>
      )}


      {/* ---------- MASCOTS ---------- */}
      <img src="/walrus/bicycle-kick.png" alt="" className="page-mascot-bicycle" />
      <img src="/walrus/kick.png" alt="" className="page-mascot-kick" />

      {/* ---------- HEADER ---------- */}
      <header className="app-header lg-glass-strong" style={{ flexWrap: "wrap", rowGap: 8 }}>
        <div className="logo-halo" style={{ marginRight: 10 }}>
          <img
          className="logo-img"
          src="/walrus/logo.png"
          alt="Home"
          onClick={() => setPage("home")}
          style={{ height: 80, cursor: "pointer", marginRight: 10, transition: "transform 0.25s" }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1) rotate(-5deg)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1) rotate(0)")}
        />
        </div>
        {/* Desktop nav (inline) */}
        <nav className="nav-desktop" style={{ flex: 1, justifyContent: "space-evenly", overflowX: "auto" }}>
          {[
            { id: "home", label: "Home" },
            { id: "matches", label: "Matches" },
            { id: "groups", label: "Groups" },
            { id: "knockout", label: "Knockout" },
            { id: "results", label: "Results" },
            { id: "predictions", label: "My Predictions" },
          ].map((item) => (
            <button key={item.id} className={`nav-link ${page === item.id ? "active" : ""} ${item.id === "results" ? "results-tab" : ""}`} onClick={() => setPage(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile nav (hamburger) */}
        <div className="nav-mobile" style={{ position: "relative", flex: 1, justifyContent: "flex-end" }}>
          <button onClick={() => setNavMenuOpen((v) => !v)} className="nav-link" style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--glass-border)" }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
            <span style={{ fontSize: 13, fontWeight: 800 }}>Menu</span>
          </button>
          {navMenuOpen && (
            <div className="lg-glass-strong" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, borderRadius: 16, padding: 8, minWidth: 200, zIndex: 1200, display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { id: "home", label: "Home" },
                { id: "matches", label: "Matches" },
                { id: "groups", label: "Groups" },
                { id: "knockout", label: "Knockout" },
                { id: "results", label: "Results" },
                { id: "predictions", label: "My Predictions" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`nav-link ${page === item.id ? "active" : ""}`}
                  style={{ width: "100%", textAlign: "left" }}
                  onClick={() => { setPage(item.id); setNavMenuOpen(false); }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ticker (clickable) + picks badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", order: 10, justifyContent: "center", paddingTop: 4, borderTop: "1px solid var(--glass-border)" }}>
         {(() => {
            const liveM = liveScores.find((f) => f.status === "IN_PLAY" || f.status === "PAUSED");
            if (!liveM) return null;
            return (
              <span className="live-badge" onClick={() => {
                const local = Object.keys(matchDays).flatMap((d) => matchDays[d].map((m) => ({ ...m, day: d }))).find((m) => findScore(m)?.id === liveM.id);
                if (local) setMatchModal(local);
              }} style={{ cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#39ff14", whiteSpace: "nowrap", padding: "6px 12px" }}>
                🔴 LIVE: {liveM.home} {liveM.goalsHome ?? 0}-{liveM.goalsAway ?? 0} {liveM.away}
              </span>
            );
          })()}
          {nextMatch && (
            <span
              className="next-badge"
              onClick={() => setMatchModal(nextMatch)}
              style={{ cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--text-dim)", whiteSpace: "nowrap", padding: "6px 12px" }}
            >
              ⚽ NEXT: {nextMatch.h} vs {nextMatch.a} · {utcLabel(nextMatch.day, nextMatch.t)}
            </span>
          )}
          <span onClick={() => setPage("predictions")} style={{ cursor: "pointer", fontSize: 12, fontWeight: 800, color: "var(--gold)", whiteSpace: "nowrap", background: "var(--gold-soft)", border: "1px solid var(--gold-border)", borderRadius: 999, padding: "6px 12px" }}>
            🎯 {Object.keys(matchPicks).length} picks
          </span>
          {/* Walrus Mainnet — standalone, after the account */}
        
        </div>

        {/* Avatar */}
        <div style={{ position: "relative", marginRight: 10 }}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)", borderRadius: 999, padding: "5px 12px 5px 6px", cursor: "pointer" }}>
            {userPicture ? (
              <img src={userPicture} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} referrerPolicy="no-referrer" />
            ) : (
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold)", color: "#0b0e16", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
            <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{userName}</span>
          </button>
          {userMenuOpen && (
            <div className="lg-glass-strong" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, borderRadius: 16, padding: 8, minWidth: 160, zIndex: 1100 }}>
              <button className="nav-link" style={{ width: "100%", textAlign: "left" }} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 11, fontWeight: 700, color: "#2ecc71", letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap", padding: "6px 4px", textShadow: "0 0 12px rgba(46, 204, 113, 0.45)" }}>
          <span className="mainnet-dot" />
          Walrus Mainnet
        </span>

        
      </header>

      {/* ---------- MAIN ---------- */}
      
      <main style={{ paddingTop: 175, paddingBottom: 80, maxWidth: 1180, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>

        {/* ===== HOME ===== */}
        {page === "home" && (
          <section className="fade-up">
            {/* HERO */}
            <div className="lg-glass" style={{ borderRadius: 28, padding: "32px 36px", marginBottom: 24, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <img src="/walrus/trophy-hero.png" alt="World Cup Trophy" style={{ width: 150, height: 150, objectFit: "contain", filter: "drop-shadow(0 10px 30px rgba(212,175,55,0.35))" }} />
              <div style={{ flex: 1, minWidth: 240 }}>
                <h1 className="worldcup-font page-title" style={{ marginBottom: 8 }}>
                  FIFA World Cup 2026
                </h1>
                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>
                  {Object.keys(matchPicks).length > 0
                    ? `You've made ${Object.keys(matchPicks).length} predictions. The Ref is keeping score.`
                    : "No predictions yet. The Ref is waiting."}
                </p>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ textAlign: "center", padding: "12px 20px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                  <span className="worldcup-font" style={{ fontSize: 26, color: "var(--gold)", display: "block" }}>{Object.keys(matchPicks).length}</span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase" }}>Predictions</span>
                </div>
                <div style={{ textAlign: "center", padding: "12px 20px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                  <span className="worldcup-font" style={{ fontSize: 26, color: "var(--gold)", display: "block" }}>{Object.keys(groupPicks).length}/12</span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase" }}>Groups Picked</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {[
                { title: "Predict Matches", desc: "Call every group stage result", icon: "⚽", target: "matches" },
                { title: "Pick Group Winners", desc: "12 groups. 12 calls. No mercy.", icon: "🏆", target: "groups" },
                { title: "My Predictions", desc: "The clipboard never forgets", icon: "📋", target: "predictions" },
              ].map((c) => (
                <div key={c.target} className="lg-glass" style={{ borderRadius: 22, padding: 24, cursor: "pointer" }} onClick={() => setPage(c.target)}>
                  <span style={{ fontSize: 30, display: "block", marginBottom: 10 }}>{c.icon}</span>
                  <h3 className="worldcup-font" style={{ fontSize: 19, marginBottom: 6 }}>{c.title}</h3>
                  <p style={{ color: "var(--text-dim)", fontSize: 13 }}>{c.desc}</p>
                </div>
              ))}
            </div>

          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "28px 0 14px", color: "var(--gold)" }}>
              {todayMatches ? "Today's Matches" : "No Matches Today — Next Up"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {(todayMatches ? todayMatches.list.map((m) => ({ ...m, day: todayMatches.day })) : (nextMatch ? [nextMatch] : [])).map((m, i) => {
                const s = findScore(m);
                const live = s && (s.status === "IN_PLAY" || s.status === "PAUSED");
                const finished = s && s.status === "FINISHED";
                const statusLabel = !s ? null
                  : s.status === "IN_PLAY" ? `🟢 LIVE${s.minute ? ` · ${s.minute}'` : ""}`
                  : s.status === "PAUSED" ? "⏸ HALF TIME"
                  : s.status === "FINISHED" ? "FULL TIME" : null;
                return (
                  <div key={i} className={`lg-glass ${live ? "live-match" : ""}`} style={{ borderRadius: 22, padding: 24, cursor: "pointer" }} onClick={() => setMatchModal(m)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dim)" }}>Group {m.g}</span>
                      {statusLabel && (
                        s.status === "IN_PLAY" ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 13, fontWeight: 700, color: "#39ff14", letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap", textShadow: "0 0 12px rgba(57, 255, 20, 0.5)" }}>
                            <span className="live-dot" />
                            LIVE{s.minute ? ` · ${s.minute}'` : ""}
                          </span>
                        ) : (
                          <span className="worldcup-font" style={{ fontSize: 12, fontWeight: 800, color: s.status === "PAUSED" ? "#00e6ff" : "var(--text-dim)" }}>{statusLabel}</span>
                        )
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "38%" }}>
                        <img src={teamFlag(m.h)} alt="" style={{ width: 46, height: 31, borderRadius: 6, objectFit: "cover" }} />
                        <span style={{ fontSize: 15, fontWeight: 800, textAlign: "center" }}>{m.h}</span>
                      </div>
                      {s && (finished || live) ? (
                        <span className="worldcup-font" style={{ fontSize: 30, fontWeight: 800, color: live ? "#00e6ff" : "var(--gold)", textShadow: live ? "0 0 16px rgba(0,230,255,0.6)" : "0 0 14px rgba(212,175,55,0.5)" }}>
                          {s.goalsHome ?? 0} - {s.goalsAway ?? 0}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--gold)" }}>{utcLabel(m.day, m.t)}</span>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "38%" }}>
                        <img src={teamFlag(m.a)} alt="" style={{ width: 46, height: 31, borderRadius: 6, objectFit: "cover" }} />
                        <span style={{ fontSize: 15, fontWeight: 800, textAlign: "center" }}>{m.a}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== MATCHES ===== */}
        {page === "matches" && (
          <section className="fade-up">
            <h1 className="worldcup-font page-title" style={{ marginBottom: 6 }}>Group Stage Matches</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 24 }}>
              Pick a result for each match. Voting closes 45 minutes after kickoff. All times UTC.
            </p>
            <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: 28 }}>
              {Object.keys(matchDays).map((day) => (
                <button key={day} className={`pill ${activeDay === day ? "active" : ""}`} onClick={() => setActiveDay(day)}>
                  {fmtDate(day)}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
              {matchDays[activeDay].map((m, i) => {
                const id = matchId(m, activeDay);
                const pick = matchPicks[id];
                const locked = isLocked(activeDay, m.t);
                const s = findScore(m);
                const finished = s && s.status === "FINISHED";
                const live = s && (s.status === "IN_PLAY" || s.status === "PAUSED");
                const homeWon = finished && s.goalsHome > s.goalsAway;
                const awayWon = finished && s.goalsAway > s.goalsHome;
                return (
                  <div key={i} className="lg-glass" style={{ borderRadius: 22, padding: 20, opacity: locked && !finished && !live ? 0.75 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dim)" }}>Group {m.g}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: finished ? "var(--text-dim)" : live ? "#39ff14" : locked ? "var(--text-dim)" : "var(--gold)" }}>
                        {finished ? "FULL TIME" : live ? `🔴 LIVE${s.minute ? ` ${s.minute}'` : ""}` : locked ? "🔒 Voting closed" : utcLabel(activeDay, m.t)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                      <div style={{ width: "40%", display: "flex", justifyContent: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 14px" }}>
                          <img src={teamFlag(m.h)} alt="" style={{ width: 42, height: 28, borderRadius: 6, objectFit: "cover" }} />
                          <span style={{ fontSize: 14, fontWeight: 800, textAlign: "center" }}>{m.h}</span>
                        </div>
                      </div>
                      {finished || live ? (
                        <span className="worldcup-font" style={{ color: live ? "#39ff14" : "var(--gold)", fontSize: 26, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 0 14px rgba(212,175,55,0.5)" }}>
                          {s.goalsHome ?? 0} - {s.goalsAway ?? 0}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 700 }}>VS</span>
                      )}
                      <div style={{ width: "40%", display: "flex", justifyContent: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 14px" }}>
                          <img src={teamFlag(m.a)} alt="" style={{ width: 42, height: 28, borderRadius: 6, objectFit: "cover" }} />
                          <span style={{ fontSize: 14, fontWeight: 800, textAlign: "center" }}>{m.a}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button disabled={locked} className={`vote-opt ${pick === "home" ? "selected" : ""}`} style={locked ? { cursor: "not-allowed" } : {}} onClick={() => pickMatch(m, activeDay, "home")}>
                        {m.h.length > 10 ? "Home" : m.h} Win
                      </button>
                      <button disabled={locked} className={`vote-opt ${pick === "draw" ? "selected" : ""}`} style={locked ? { cursor: "not-allowed" } : {}} onClick={() => pickMatch(m, activeDay, "draw")}>
                        Draw
                      </button>
                      <button disabled={locked} className={`vote-opt ${pick === "away" ? "selected" : ""}`} style={locked ? { cursor: "not-allowed" } : {}} onClick={() => pickMatch(m, activeDay, "away")}>
                        {m.a.length > 10 ? "Away" : m.a} Win
                      </button>
                    </div>
                   {!locked && (() => {
                      const sid = matchId(m, activeDay);
                      const sc = scorePicks[sid];
                      const saved = sc && sc.h !== "" && sc.a !== "";
                      return (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, marginRight: 2 }}>Score:</span>
                          <input type="number" min="0" max="20" value={sc?.h ?? ""} onChange={(e) => setScore(sid, "h", e.target.value)} placeholder="–" title={m.h} style={{ width: 40, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14 }} />
                          <span style={{ color: "var(--text-dim)", fontWeight: 800 }}>:</span>
                          <input type="number" min="0" max="20" value={sc?.a ?? ""} onChange={(e) => setScore(sid, "a", e.target.value)} placeholder="–" title={m.a} style={{ width: 40, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14 }} />
                          <button onClick={() => saved && confirmScore(sid, m)} disabled={!saved} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: saved ? "#D4AF37" : "rgba(255,255,255,0.1)", color: saved ? "#1a1200" : "var(--text-dim)", fontWeight: 800, fontSize: 12, cursor: saved ? "pointer" : "default" }}>
                            {confirmedScores[sid] ? "Saved ✓" : "Save"}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== GROUPS ===== */}
        {page === "groups" && (
          <section className="fade-up">
            <h1 className="worldcup-font page-title" style={{ marginBottom: 6 }}>Groups</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 24 }}>
              Click a team to pick your group winner. Click the flag for the schedule.
            </p>
            <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: 28 }}>
              {Object.keys(groupTeams).map((id) => (
                <button key={id} className={`pill ${activeGroup === id ? "active" : ""}`} onClick={() => setActiveGroup(id)}>
                  Group {id}
                </button>
              ))}
            </div>
            {(() => {
              const groupDone = groupFinished(activeGroup);
              const winnerName = groupDone ? computeStandings(activeGroup)[0]?.name : null;
              const userPick = groupPicks[activeGroup];
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {groupTeams[activeGroup].map((t, i) => {
                    const isWinner = groupDone && t.n === winnerName;
                    const wasUserPick = userPick === t.n;
                    const picked = !groupDone && wasUserPick; // before finish: highlight the user's pick
                    const highlight = isWinner || picked;
                    return (
                      <div
                        key={i}
                        className={`team-card lg-glass ${highlight ? "picked" : ""}`}
                        onClick={groupDone ? undefined : () => pickGroupWinner(activeGroup, t.n)}
                        style={groupDone ? { cursor: "default" } : undefined}
                      >
                        <img
                          src={flagUrl(t.c, 160)}
                          alt={t.n}
                          onClick={(e) => { e.stopPropagation(); setTeamPopup(t); }}
                          style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 14, border: "2px solid rgba(255,255,255,0.2)", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: 18, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>{t.n}</span>
                        {groupDone ? (
                          isWinner ? (
                            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                              ★ Winner Group {activeGroup}{wasUserPick ? " · You nailed it ✓" : ""}
                            </span>
                          ) : wasUserPick ? (
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#ff6b6b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                              Your pick ✗
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5 }}>
                              Group finished
                            </span>
                          )
                        ) : picked ? (
                          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            ★ Your Group Winner
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Pick to win Group {activeGroup}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ===== STANDINGS TABLE ===== */}
            {(() => {
              const rows = computeStandings(activeGroup);
              const played = rows.some((r) => r.P > 0);
              return (
                <div style={{ marginTop: 32 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--gold)" }}>
                    Group {activeGroup} Standings
                  </h2>
                  {!played ? (
                    <div className="lg-glass" style={{ borderRadius: 16, padding: 20, color: "var(--text-dim)", fontSize: 13 }}>
                      No matches played yet in this group.
                    </div>
                  ) : (
                    <div className="lg-glass no-scrollbar" style={{ borderRadius: 18, padding: "6px 4px", overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                        <thead>
                          <tr style={{ color: "var(--text-dim)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            <th style={{ textAlign: "left", padding: "10px 8px 10px 14px" }}>#</th>
                            <th style={{ textAlign: "left", padding: "10px 8px" }}>Team</th>
                            <th style={{ textAlign: "center", padding: "10px 6px" }}>P</th>
                            <th style={{ textAlign: "center", padding: "10px 6px" }}>W</th>
                            <th style={{ textAlign: "center", padding: "10px 6px" }}>D</th>
                            <th style={{ textAlign: "center", padding: "10px 6px" }}>L</th>
                            <th style={{ textAlign: "center", padding: "10px 6px" }}>GF</th>
                            <th style={{ textAlign: "center", padding: "10px 6px" }}>GA</th>
                            <th style={{ textAlign: "center", padding: "10px 6px" }}>GD</th>
                            <th style={{ textAlign: "center", padding: "10px 14px 10px 6px", color: "var(--gold)" }}>Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => {
                            const top2 = i < 2;
                            return (
                              <tr key={r.name} style={{ borderTop: "1px solid var(--glass-border)", background: top2 ? "rgba(212,175,55,0.06)" : "transparent" }}>
                                <td style={{ padding: "11px 8px 11px 14px", fontSize: 13, fontWeight: 800, color: top2 ? "var(--gold)" : "var(--text-dim)" }}>{i + 1}</td>
                                <td style={{ padding: "11px 8px" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                    <img src={flagUrl(r.c)} alt="" style={{ width: 24, height: 16, borderRadius: 3, objectFit: "cover" }} />
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                                  </span>
                                </td>
                                <td style={{ textAlign: "center", padding: "11px 6px", fontSize: 13, color: "var(--text-dim)" }}>{r.P}</td>
                                <td style={{ textAlign: "center", padding: "11px 6px", fontSize: 13 }}>{r.W}</td>
                                <td style={{ textAlign: "center", padding: "11px 6px", fontSize: 13 }}>{r.D}</td>
                                <td style={{ textAlign: "center", padding: "11px 6px", fontSize: 13 }}>{r.L}</td>
                                <td style={{ textAlign: "center", padding: "11px 6px", fontSize: 13, color: "var(--text-dim)" }}>{r.GF}</td>
                                <td style={{ textAlign: "center", padding: "11px 6px", fontSize: 13, color: "var(--text-dim)" }}>{r.GA}</td>
                                <td style={{ textAlign: "center", padding: "11px 6px", fontSize: 13, fontWeight: 700, color: r.GD > 0 ? "#39ff14" : r.GD < 0 ? "#ff6b6b" : "var(--text-dim)" }}>
                                  {r.GD > 0 ? `+${r.GD}` : r.GD}
                                </td>
                                <td style={{ textAlign: "center", padding: "11px 14px 11px 6px", fontSize: 15, fontWeight: 800, color: "var(--gold)" }}>{r.Pts}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <p style={{ fontSize: 11, color: "var(--text-dim)", padding: "8px 14px 6px", opacity: 0.7 }}>
                        Top 2 advance · sorted by points, then goal difference
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        )}

        {/* ===== KNOCKOUT ===== */}
        {page === "knockout" && (
          <section className="fade-up">
            <h1 className="worldcup-font page-title" style={{ marginBottom: 6 }}>Knockout Stage</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20 }}>
              The road to the final. July 20, 2026. All times UTC.
            </p>

            {/* View toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button className="pill" onClick={() => setKoView("list")} style={{ background: koView === "list" ? "var(--gold)" : "rgba(255,255,255,0.05)", color: koView === "list" ? "#0b0e16" : "var(--text-dim)", borderColor: koView === "list" ? "var(--gold)" : "var(--glass-border)" }}>☰ List</button>
              <button className="pill" onClick={() => setKoView("bracket")} style={{ background: koView === "bracket" ? "var(--gold)" : "rgba(255,255,255,0.05)", color: koView === "bracket" ? "#0b0e16" : "var(--text-dim)", borderColor: koView === "bracket" ? "var(--gold)" : "var(--glass-border)" }}>🗺️ Bracket</button>
            </div>

            {koView === "list" && (
              <>
                <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: 28 }}>
                  {Object.keys(knockoutData).map((phase) => (
                    <button key={phase} className={`pill ${activeKnockout === phase ? "active" : ""}`} onClick={() => setActiveKnockout(phase)}>
                      {phase}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(() => {
                    const thirdMap = buildThirdMap();
                    return knockoutData[activeKnockout].map((m, i) => {
                      const id = matchId(m, m.d);
                      const pick = matchPicks[id];
                      const locked = isLocked(m.d, m.g);
                      const ht = resolveR32(m.h, thirdMap);
                      const at = resolveR32(m.a, thirdMap);
                      const canPick = activeKnockout === "Round of 32";
                      return (
                      <div key={i} className="lg-glass" style={{ borderRadius: 20, padding: "18px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 80 }}>
                          <span className="worldcup-font" style={{ color: "var(--gold)", fontSize: 22, display: "block" }}>#{m.t}</span>
                          <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700 }}>{fmtDate(m.d)}</span>
                        </div>
                        <div style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 12, paddingRight: 12, gap: 12, flexWrap: "wrap" }}>
                          {koSlot(m.h, thirdMap)}
                          <span style={{ color: "var(--text-dim)", fontSize: 12 }}>vs</span>
                          {koSlot(m.a, thirdMap)}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: locked ? "var(--gold)" : "var(--text-dim)", minWidth: 130, textAlign: "right" }}>{locked ? "🔒 Voting closed" : utcLabel(m.d, m.g)}</span>
                        {canPick && (
                          <div style={{ display: "flex", gap: 8, flexBasis: "100%", width: "100%" }}>
                            <button disabled={locked} className={`vote-opt ${pick === "home" ? "selected" : ""}`} style={locked ? { cursor: "not-allowed" } : {}} onClick={() => pickKnockout(m, "home")}>
                              {ht && ht.length <= 12 ? ht : "Home"} advances
                            </button>
                            <button disabled={locked} className={`vote-opt ${pick === "away" ? "selected" : ""}`} style={locked ? { cursor: "not-allowed" } : {}} onClick={() => pickKnockout(m, "away")}>
                              {at && at.length <= 12 ? at : "Away"} advances
                            </button>
                          </div>
                        )}
                        {canPick && !locked && (() => {
                          const sc = scorePicks[id];
                          const saved = sc && sc.h !== "" && sc.a !== "";
                          return (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexBasis: "100%", width: "100%", flexWrap: "wrap" }}>
                              <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, marginRight: 2 }}>Score:</span>
                              <input type="number" min="0" max="20" value={sc?.h ?? ""} onChange={(e) => setScore(id, "h", e.target.value)} placeholder="–" title={ht || m.h} style={{ width: 40, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14 }} />
                              <span style={{ color: "var(--text-dim)", fontWeight: 800 }}>:</span>
                              <input type="number" min="0" max="20" value={sc?.a ?? ""} onChange={(e) => setScore(id, "a", e.target.value)} placeholder="–" title={at || m.a} style={{ width: 40, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14 }} />
                              <button onClick={() => saved && confirmScore(id, { ...m, h: ht || m.h, a: at || m.a })} disabled={!saved} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: saved ? "#D4AF37" : "rgba(255,255,255,0.1)", color: saved ? "#1a1200" : "var(--text-dim)", fontWeight: 800, fontSize: 12, cursor: saved ? "pointer" : "default" }}>
                                {confirmedScores[id] ? "Saved ✓" : "Save"}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      );
                    });
                  })()}
                </div>
              </>
            )}

            {koView === "bracket" && renderKnockoutBracket()}
          </section>
        )}

        {/* ===== RESULTS ===== */}
        {page === "results" && (() => {
          const finished = liveScores.filter((f) => f.status === "FINISHED");
          const monthOf = (f) => String(new Date(f.dateUTC).getUTCMonth() + 1).padStart(2, "0");
          const dayOf = (f) => {
            const d = new Date(f.dateUTC);
            return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
          };
          const monthName = { "06": "June", "07": "July" };
          const availableMonths = [...new Set(finished.map(monthOf))].sort();
          const daysInMonth = [...new Set(finished.filter((f) => monthOf(f) === resultsMonth).map(dayOf))].sort();
          const availableGroups = [...new Set(finished.map((f) => f.group).filter(Boolean))].sort();
          const shown = finished.filter((f) =>
            (resultsMonth === "all" || monthOf(f) === resultsMonth) &&
            (resultsDay === "all" || dayOf(f) === resultsDay) &&
            (resultsGroup === "all" || f.group === resultsGroup)
          );
          return (
            <section className="fade-up">
              <h1 className="worldcup-font page-title" style={{ marginBottom: 6 }}>Results</h1>
              <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20 }}>
                Every finished match. All times UTC.
              </p>

              {finished.length === 0 ? (
                <div className="lg-glass" style={{ borderRadius: 18, padding: 24, color: "var(--text-dim)", fontSize: 14 }}>
                  No finished matches yet.
                </div>
              ) : (
                <>
                  {/* Month (parent) */}
                  <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: 12 }}>
                    <button className={`pill ${resultsMonth === "all" ? "active" : ""}`} onClick={() => { setResultsMonth("all"); setResultsDay("all"); }}>All months</button>
                    {availableMonths.map((m) => (
                      <button key={m} className={`pill ${resultsMonth === m ? "active" : ""}`} onClick={() => { setResultsMonth(m); setResultsDay("all"); }}>{monthName[m] || m}</button>
                    ))}
                  </div>
                  {resultsMonth !== "all" && <div style={{ borderTop: "1px solid var(--glass-border)", margin: "4px 0 12px" }} />}
                  {/* Days — shown only after a month is picked */}
                  {resultsMonth !== "all" && daysInMonth.length > 0 && (
                    <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: 12 }}>
                      <button className={`pill ${resultsDay === "all" ? "active" : ""}`} onClick={() => setResultsDay("all")}>All days</button>
                      {daysInMonth.map((d) => (
                        <button key={d} className={`pill ${resultsDay === d ? "active" : ""}`} onClick={() => setResultsDay(d)}>{d}</button>
                      ))}
                    </div>
                  )}

                  {/* Group */}
                  <div style={{ borderTop: "1px solid var(--glass-border)", margin: "4px 0 16px" }} />
                  <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: showGroups ? 12 : 24 }}>
                    <button
                      className={`pill ${resultsGroup === "all" ? "active" : ""}`}
                      onClick={() => { setShowGroups((v) => !v); if (resultsGroup !== "all") setResultsGroup("all"); }}
                    >
                      All groups {showGroups ? "▴" : "▾"}
                    </button>
                  </div>
                  {showGroups && (
                    <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: 24 }}>
                      {availableGroups.map((g) => (
                        <button key={g} className={`pill ${resultsGroup === g ? "active" : ""}`} onClick={() => setResultsGroup(g)}>{g.replace(/_/g, " ")}</button>
                      ))}
                    </div>
                  )}

                  {shown.length === 0 ? (
                    <div className="lg-glass" style={{ borderRadius: 18, padding: 24, color: "var(--text-dim)", fontSize: 14 }}>
                      No results for this filter.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {shown.map((f) => {
                        const homeWon = f.goalsHome > f.goalsAway;
                        return (
                          <div key={f.id} className="lg-glass" style={{ borderRadius: 18, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, minWidth: 70 }}>{f.group || f.stage}</span>
                            <span style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                              <span className={homeWon ? "winner-glow" : ""} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, padding: "6px 14px" }}>
                                {apiTeamFlag(f.home) && <img src={apiTeamFlag(f.home)} alt="" style={{ width: 28, height: 19, borderRadius: 4, objectFit: "cover" }} />}
                                {f.home}
                              </span>
                            </span>
                            <span className="worldcup-font" style={{ fontSize: 20, color: "var(--gold)", minWidth: 70, textAlign: "center" }}>{f.goalsHome} - {f.goalsAway}</span>
                            <span style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, padding: "6px 14px" }}>
                                {f.away}
                                {apiTeamFlag(f.away) && <img src={apiTeamFlag(f.away)} alt="" style={{ width: 28, height: 19, borderRadius: 4, objectFit: "cover" }} />}
                              </span>
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-dim)" }}>FT</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })()}
        
        {/* ===== MY PREDICTIONS ===== */}
        {page === "predictions" && (() => {
          const koThirdMap = buildThirdMap();
          const koIdToMatch = {};
          Object.values(knockoutData).forEach((arr) =>
            arr.forEach((mm) => { koIdToMatch[`${mm.d}_${mm.h}_${mm.a}`] = mm; })
          );
          const groupEntries = Object.entries(matchPicks).filter(([id]) => !koIdToMatch[id]);
          const koEntries = Object.entries(matchPicks).filter(([id]) => koIdToMatch[id]);
          return (
          <section className="fade-up">
            <h1 className="worldcup-font page-title" style={{ marginBottom: 6 }}>My Predictions</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 28 }}>
              Everything you&apos;ve called. The clipboard never forgets.
            </p>
            {lastBlobId && (
              <a href={`https://walruscan.com/mainnet/blob/${lastBlobId}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "8px 14px", borderRadius: 10, background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.4)", color: "#2ecc71", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                <span className="mainnet-dot" /> Your memory is live on Walrus — verify on-chain ↗
              </a>
            )}

            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--gold)" }}>Group Winners</h2>
            {Object.keys(groupPicks).length === 0 ? (
              <div className="lg-glass" style={{ borderRadius: 18, padding: 24, marginBottom: 32, color: "var(--text-dim)", fontSize: 14 }}>
                No group winners picked yet. Head to the Groups tab.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 32 }}>
                {Object.entries(groupPicks).sort().map(([g, team]) => (
                  <div key={g} className="lg-glass" style={{ borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={teamFlag(team)} alt="" style={{ width: 34, height: 22, borderRadius: 4, objectFit: "cover" }} />
                    <div>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, display: "block" }}>Group {g}</span>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{team}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--gold)" }}>Group Stage Predictions</h2>
            {groupEntries.length === 0 ? (
              <div className="lg-glass" style={{ borderRadius: 18, padding: 24, color: "var(--text-dim)", fontSize: 14 }}>
                No group-stage predictions yet. Head to the Matches tab.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {groupEntries.map(([id, choice]) => {
                  const [day, home, away] = id.split("_");
                  const label = choice === "draw" ? "Draw" : choice === "home" ? `${home} Win` : `${away} Win`;
                  const s = findScore({ h: home, a: away });
                  let verdict = null;
                  if (s && s.status === "FINISHED") {
                    const actual = s.goalsHome > s.goalsAway ? "home" : s.goalsHome < s.goalsAway ? "away" : "draw";
                    verdict = actual === choice;
                  }
                  const myScore = scorePicks[id];
                  const hasScore = myScore && myScore.h !== "" && myScore.a !== "";
                  const exact = hasScore && s && s.status === "FINISHED"
                    ? Number(myScore.h) === s.goalsHome && Number(myScore.a) === s.goalsAway
                    : null;
                  return (
                    <div key={id} className="lg-glass" style={{ borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 220px", minWidth: 180 }}>
                        <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, minWidth: 42 }}>{fmtDate(day)}</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{home} vs {away}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 150, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your pick</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--gold)" }}>
                          {label}{hasScore ? ` · ${myScore.h}-${myScore.a}` : ""}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, width: 150, flexShrink: 0 }}>
                        {s && s.status === "FINISHED" ? (() => {
                          const exactHit = exact === true;
                          const winHit = verdict === true;
                          const bg = exactHit ? "rgba(57,255,20,0.15)" : winHit ? "rgba(57,255,20,0.10)" : "rgba(255,77,77,0.12)";
                          const bd = exactHit ? "#39ff14" : winHit ? "rgba(57,255,20,0.5)" : "#ff4d4d";
                          const col = exactHit ? "#39ff14" : winHit ? "#39ff14" : "#ff4d4d";
                          const txt = exactHit ? "✓ Exact score!" : winHit ? "✓ Right winner" : "✗ Wrong";
                          return (
                            <>
                              <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700 }}>
                                Result: <span style={{ color: "var(--text)", fontWeight: 800 }}>{s.goalsHome}-{s.goalsAway}</span>
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 800, color: col, background: bg, border: `1px solid ${bd}`, borderRadius: 999, padding: "3px 10px" }}>
                                {txt}
                              </span>
                            </>
                          );
                        })() : (
                          <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600, fontStyle: "italic" }}>Not played yet</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "32px 0 14px", color: "var(--gold)" }}>Knockout Predictions</h2>
            {koEntries.length === 0 ? (
              <div className="lg-glass" style={{ borderRadius: 18, padding: 24, color: "var(--text-dim)", fontSize: 14 }}>
                No knockout picks yet. Head to Knockout → Round of 32.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {koEntries
                  .map(([id, choice]) => ({ id, choice, m: koIdToMatch[id] }))
                  .sort((a, b) => a.m.t - b.m.t)
                  .map(({ id, choice, m }) => {
                    const ht = resolveR32(m.h, koThirdMap);
                    const at = resolveR32(m.a, koThirdMap);
                    const homeName = ht || m.h;
                    const awayName = at || m.a;
                    const pickedName = choice === "home" ? (ht || "Home") : (at || "Away");
                    const s = ht && at ? findScore({ h: ht, a: at }) : null;
                    const finished = s && s.status === "FINISHED";
                    let verdict = null;
                    if (finished && s.goalsHome !== s.goalsAway) {
                      const actual = s.goalsHome > s.goalsAway ? "home" : "away";
                      verdict = actual === choice;
                    }
                    const myScore = scorePicks[id];
                    const hasScore = myScore && myScore.h !== "" && myScore.a !== "";
                    const exact = hasScore && finished
                      ? Number(myScore.h) === s.goalsHome && Number(myScore.a) === s.goalsAway
                      : null;
                    return (
                      <div key={id} className="lg-glass" style={{ borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 220px", minWidth: 180 }}>
                          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 800, minWidth: 42 }}>#{m.t}</span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{homeName} vs {awayName}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 160, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your pick</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--gold)" }}>{pickedName} advances{hasScore ? ` · ${myScore.h}-${myScore.a}` : ""}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, width: 150, flexShrink: 0 }}>
                          {finished ? (
                            s.goalsHome === s.goalsAway ? (
                              <>
                                <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700 }}>
                                  Result: <span style={{ color: "var(--text)", fontWeight: 800 }}>{s.goalsHome}-{s.goalsAway}</span>
                                </span>
                                <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, fontStyle: "italic" }}>decided on penalties</span>
                              </>
                            ) : (() => {
                              const hit = verdict === true;
                              const bg = hit ? "rgba(57,255,20,0.12)" : "rgba(255,77,77,0.12)";
                              const bd = hit ? "rgba(57,255,20,0.5)" : "#ff4d4d";
                              const col = hit ? "#39ff14" : "#ff4d4d";
                              return (
                                <>
                                  <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700 }}>
                                    Result: <span style={{ color: "var(--text)", fontWeight: 800 }}>{s.goalsHome}-{s.goalsAway}</span>
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: col, background: bg, border: `1px solid ${bd}`, borderRadius: 999, padding: "3px 10px" }}>
                                    {hit ? (exact === true ? "✓ Exact score!" : "✓ Correct") : "✗ Wrong"}
                                  </span>
                                </>
                              );
                            })()
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600, fontStyle: "italic" }}>Not played yet</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
          );
        })()}
      
      </main>
      {/* ---------- FOOTER ---------- */}
      <footer style={{ position: "relative", zIndex: 1, marginTop: 60, borderTop: "1px solid var(--glass-border)", background: "rgba(8,11,18,0.6)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap" }}>
          {/* Left: brand + quote + stamp */}
         <div style={{ flex: "1 1 320px", padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <img src="/walrus/logo.png" alt="" style={{ height: 85 }} />
              <span className="worldcup-font" style={{ fontSize: 22, color: "var(--gold)" }}>The Scout</span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 26, fontWeight: 600, lineHeight: 1.4, color: "#f4f6fb", margin: "0 0 22px", maxWidth: 330 }}>
              &ldquo;On the record. On Walrus. <span style={{ color: "#ff3b5c" }}>On you.</span>&rdquo;
            </p>
            <div className="footer-stamp">
              <div style={{ fontSize: 10, letterSpacing: "0.12em", opacity: 0.85 }}>THE CLIPBOARD</div>
              <div style={{ fontSize: 15, letterSpacing: "0.06em" }}>NEVER FORGETS</div>
            </div>
            <div className="footer-barcode" aria-hidden="true">
              {[60, 90, 40, 100, 50, 80, 30, 70, 95, 45, 85, 35, 75, 55].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          {/* Right: ticket stub */}
          <div className="footer-ticket">
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 16px" }}>Built On</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="https://www.walrus.xyz" target="_blank" rel="noopener noreferrer" className="footer-link">Walrus Protocol ↗</a>
              <a href="https://www.memwal.ai" target="_blank" rel="noopener noreferrer" className="footer-link">Walrus Memory (MemWal) ↗</a>
              <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="footer-link">Sui Blockchain ↗</a>
              <a href="https://walruscan.com/mainnet/home" target="_blank" rel="noopener noreferrer" className="footer-link">Walruscan Explorer ↗</a>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40, padding: "0 8px" }}>
          <span style={{ color: "var(--text-dim)", fontSize: 12 }}>© 2026 The Scout · Built for Walrus Memory World Cup</span>
          <div className="footer-nav-row">
            <button onClick={() => setPage("matches")} className="footer-link">Predict</button>
            <span style={{ color: "#3a4150" }}>·</span>
            <button onClick={() => setPage("predictions")} className="footer-link">My Picks</button>
            <span style={{ color: "#3a4150" }}>·</span>
            <button onClick={() => { setChatOpen(true); setChatMinimized(false); }} className="footer-link">The Scout</button>
          </div>
          <a href="https://x.com/WalrusProtocol" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>#Walrus on X ↗</a>
        </div>
      </footer>

      {/* ---------- MATCH INFO MODAL (from ticker / opening day) ---------- */}
      {matchModal && (() => {
        const id = matchId(matchModal, matchModal.day);
        const pick = matchPicks[id];
        const pickLabel = !pick ? null : pick === "draw" ? "Draw" : pick === "home" ? `${matchModal.h} Win` : `${matchModal.a} Win`;
        const locked = isLocked(matchModal.day, matchModal.t);
        return (
          <>
            <div className="app-overlay" onClick={() => setMatchModal(null)} />
            <div className="lg-glass-strong modal-animate" style={{ position: "fixed", top: "50%", left: "50%", zIndex: 2000, width: "92%", maxWidth: 440, borderRadius: 28, padding: 28 }}>
              <button onClick={() => setMatchModal(null)} style={{ position: "absolute", top: 16, right: 18, color: "var(--text-dim)", background: "rgba(255,255,255,0.08)", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14 }}>✕</button>
              <p style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
                Group {matchModal.g} · {utcLabel(matchModal.day, matchModal.t)}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "40%" }}>
                  <img src={teamFlag(matchModal.h)} alt="" style={{ width: 56, height: 38, borderRadius: 8, objectFit: "cover" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, textAlign: "center" }}>{matchModal.h}</span>
                </div>
                <span className="worldcup-font" style={{ color: "var(--text-dim)", fontSize: 18 }}>VS</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "40%" }}>
                  <img src={teamFlag(matchModal.a)} alt="" style={{ width: 56, height: 38, borderRadius: 8, objectFit: "cover" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, textAlign: "center" }}>{matchModal.a}</span>
                </div>
              </div>
              <div className="lg-glass" style={{ borderRadius: 16, padding: "14px 18px", marginBottom: 18, textAlign: "center" }}>
                {pickLabel ? (
                  <>
                    <p style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Your prediction</p>
                    <p style={{ fontSize: 17, fontWeight: 800, color: "var(--gold)" }}>{pickLabel}</p>
                  </>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 600 }}>
                    {locked ? "No prediction — voting has closed." : "You haven't predicted this match yet."}
                  </p>
                )}
                {(() => {
                  const s = findScore(matchModal);
                  if (s && s.status === "FINISHED")
                    return <p className="worldcup-font" style={{ fontSize: 18, color: "var(--gold)", marginTop: 6 }}>FT · {s.goalsHome} - {s.goalsAway}</p>;
                  if (locked)
                    return <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>🔒 Voting closed (45 min after kickoff)</p>;
                  return null;
                })()}
              </div>
              {!locked && (
                <button
                  className="btn-gold"
                  style={{ width: "100%" }}
                  onClick={() => { setActiveDay(matchModal.day); setPage("matches"); setMatchModal(null); }}
                >
                  {pickLabel ? "Change Prediction" : "Make Prediction"}
                </button>
              )}
            </div>
          </>
        );
      })()}

      {/* ---------- TEAM POPUP ---------- */}
      {teamPopup && (
        <>
          <div className="app-overlay" onClick={() => setTeamPopup(null)} />
          <div className="lg-glass-strong modal-animate no-scrollbar" style={{ position: "fixed", top: "50%", left: "50%", zIndex: 2000, width: "92%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", borderRadius: 28, padding: 28 }}>
            <button onClick={() => setTeamPopup(null)} style={{ position: "absolute", top: 16, right: 18, color: "var(--text-dim)", background: "rgba(255,255,255,0.08)", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14 }}>✕</button>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <img src={teamFlag(teamPopup.n)} alt="" style={{ width: 52, height: 34, borderRadius: 6, objectFit: "cover" }} />
              <h3 className="worldcup-font" style={{ fontSize: 24 }}>{teamPopup.n}</h3>
            </div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Schedule (UTC)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {getTeamMatches(teamPopup.n).map((m, i) => (
                <div key={i} className="lg-glass" style={{ borderRadius: 14, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, display: "block" }}>Group {m.g}</span>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>vs {m.h === teamPopup.n ? m.a : m.h}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--gold)" }}>{utcLabel(m.d, m.t)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ---------- WALRUS ---------- */}
      {walrus && (
        <div style={{ position: "fixed", bottom: 28, right: chatVisible ? 452 : 28, zIndex: 3000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, transition: "right 0.3s ease" }}>
          <div style={{ position: "relative" }}>
            <div className="walrus-bubble">
              <p className="bubble-name">{WALRUS[walrus.type].name}</p>
              <p>{walrus.msg}</p>
            </div>
            <button className="walrus-bubble-close" onClick={() => setWalrus(null)}>✕</button>
          </div>
          <img
            src={WALRUS[walrus.type].img}
            alt="Walrus"
            onClick={() => { setWalrus(null); setChatOpen(true); setChatMinimized(false); }}
            style={{ cursor: "pointer" }}
            className={`walrus-img ${walrusShake ? "walrus-shake" : ""}`}
          />
        </div>
      )}

      {/* ---------- PERSISTENT SCOUT ---------- */}
      {!walrus && !chatOpen && (
        <div
          className="scout-mini-wrap"
          onClick={() => { setChatOpen(true); setChatMinimized(false); }}
          style={{ position: "fixed", bottom: 28, right: 28, left: "auto", zIndex: 3500, width: 84, height: 84, cursor: "pointer", transformOrigin: "bottom center", animation: hasUnread ? "scout-wiggle 2.2s ease-in-out infinite" : "none" }}
        >
          <img src="/walrus/2.png" alt="Scout" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }} />
          {hasUnread && (
            <span style={{ position: "absolute", top: -2, right: -2, minWidth: 22, height: 22, padding: "0 6px", borderRadius: 999, background: "#ff3b5c", color: "#fff", fontSize: 12, fontWeight: 800, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px #0d1019, 0 4px 10px rgba(0,0,0,0.5)" }}>1</span>
          )}
        </div>
      )}

      {/* ---------- CHAT ---------- */}
      {chatOpen && chatMinimized && (
        <div
          className="scout-mini-wrap"
          onClick={() => setChatMinimized(false)}
          style={{ position: "fixed", bottom: 28, right: 28, left: "auto", zIndex: 3500, width: 84, height: 84, cursor: "pointer", transformOrigin: "bottom center", animation: hasUnread ? "scout-wiggle 2.2s ease-in-out infinite" : "none" }}
        >
          <img src="/walrus/2.png" alt="Scout" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }} />
          {hasUnread && (
            <span style={{ position: "absolute", top: -2, right: -2, minWidth: 22, height: 22, padding: "0 6px", borderRadius: 999, background: "#ff3b5c", color: "#fff", fontSize: 12, fontWeight: 800, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px #0d1019, 0 4px 10px rgba(0,0,0,0.5)" }}>1</span>
          )}
        </div>
      )}
      {chatVisible && (
        <div className="lg-glass-strong" style={chatExpanded ? { position: "fixed", top: 80, bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 3500, width: "94%", maxWidth: 880, borderRadius: 26, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0d1019" } : { position: "fixed", top: 100, bottom: 28, right: 28, zIndex: 3500, width: "90%", maxWidth: 400, borderRadius: 26, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0d1019" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--glass-border)" }}>
            <img src="/walrus/2.png" alt="Scout" style={{ width: 42, height: 42, objectFit: "contain" }} />
            <div style={{ flex: 1 }}>
              <p className="worldcup-font" style={{ color: "var(--gold)", fontSize: 14, textTransform: "uppercase" }}>The Scout</p>
              <p style={{ color: "var(--text-dim)", fontSize: 12 }}>Your tactical advisor</p>
            </div>
            <button onClick={() => setChatExpanded((v) => !v)} title={chatExpanded ? "Shrink" : "Expand"} style={{ color: "var(--text-dim)", background: "rgba(255,255,255,0.08)", border: "none", fontSize: 14, cursor: "pointer", width: 30, height: 30, borderRadius: "50%" }}>
              {chatExpanded ? "⤡" : "⤢"}
            </button>
            <button onClick={() => setChatMinimized(true)} style={{ color: "var(--text-dim)", background: "rgba(255,255,255,0.08)", border: "none", fontSize: 15, cursor: "pointer", width: 30, height: 30, borderRadius: "50%" }}>—</button>
            <button onClick={() => { setChatOpen(false); setChatMinimized(false); }} style={{ color: "var(--text-dim)", background: "rgba(255,255,255,0.08)", border: "none", fontSize: 13, cursor: "pointer", width: 30, height: 30, borderRadius: "50%" }}>✕</button>
          </div>
          <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {chatMessages.length === 0 && (
              <p style={{ color: "var(--text-dim)", fontSize: 14, textAlign: "center", marginTop: 20 }}>Ask The Scout anything about the World Cup</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className="chat-msg" style={{ display: "flex", gap: 8, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                {m.img && (
                  <img src={m.img} alt={m.character} style={{ width: 44, height: 44, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }} />
                )}
                <div style={{
                  background: m.role === "user" ? "var(--gold-soft)" : "rgba(255,255,255,0.07)",
                  border: m.role === "user" ? "1px solid var(--gold-border)" : "1px solid var(--glass-border)",
                  borderRadius: 16, padding: "10px 14px", fontSize: 15, color: "var(--text)", lineHeight: 1.55,
                }}>
                  {m.character && (
                    <p style={{ color: "var(--gold)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      🟥 {m.character}
                    </p>
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && <p style={{ color: "var(--gold)", fontSize: 13 }}>The Scout is thinking...</p>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: "flex", gap: 8, padding: 14, borderTop: "1px solid var(--glass-border)" }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a message..."
              className="chat-input"
              style={{ flex: 1, borderRadius: 12, padding: "10px 14px", color: "var(--text)", fontSize: 15, outline: "none" }}
            />
            <button onClick={sendChat} className="btn-gold" style={{ padding: "10px 16px", borderRadius: 12 }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
