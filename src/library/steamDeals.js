// Prices and news from Steam. No API key needed.
// These are public endpoints that Valve can change or rate-limit, so every call is wrapped for errors.
const STORE_API = "https://store.steampowered.com/api/appdetails";
const NEWS_API = "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/";

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok)
      throw new Error(`Steam responded with ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Prices ----------

async function fetchPriceBatch(ids, cc) {
  const url = `${STORE_API}?appids=${ids.join(",")}&filters=price_overview&cc=${cc}`;
  const data = await fetchJson(url);
  const result = {};

  for (const id of ids) {
    const entry = data ? data[id] : null;
    if (!entry || entry.success !== true) {
      result[id] = { status: "unavailable" };
      continue;
    }
    const p = entry.data && entry.data.price_overview;
    if (!p) {
      // Free-to-play games and unpriced games have no price_overview
      result[id] = { status: "noprice" };
      continue;
    }
    result[id] = {
      status: "priced",
      discountPercent: p.discount_percent || 0,
      initialFormatted:
        p.initial_formatted || `${(p.initial / 100).toFixed(2)}`,
      finalFormatted: p.final_formatted || `${(p.final / 100).toFixed(2)}`,
    };
  }
  return result;
}

// appIds: array of Steam app id strings. Returns { [appId]: priceInfo }.
export async function fetchPrices(appIds, cc = "us") {
  const prices = {};
  let failures = 0;

  for (let i = 0; i < appIds.length; i += 50) {
    const chunk = appIds.slice(i, i + 50);
    try {
      Object.assign(prices, await fetchPriceBatch(chunk, cc));
    } catch (e) {
      // If Steam refuses the batch, fall back to one request per game
      for (const id of chunk) {
        try {
          Object.assign(prices, await fetchPriceBatch([id], cc));
        } catch (e2) {
          failures += 1;
        }
      }
    }
  }

  if (appIds.length > 0 && Object.keys(prices).length === 0 && failures > 0) {
    throw new Error("Could not load any prices");
  }
  return prices;
}

// ---------- News ----------

// Steam news text contains BBCode, HTML and image placeholders, so strip them out
function cleanNewsText(text) {
  return (text || "")
    .replace(/\{STEAM_CLAN_IMAGE\}\S*/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Steam's news endpoint has no language option, so we filter on our side.
const NON_LATIN =
  /[\u0370-\u058F\u0590-\u05FF\u0600-\u06FF\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/g;
const ACCENTED = /[\u00C0-\u00FF]/;
const ENGLISH_WORDS = new Set([
  "the",
  "and",
  "to",
  "of",
  "is",
  "for",
  "with",
  "you",
  "are",
  "this",
  "we",
  "new",
  "our",
  "will",
  "be",
  "your",
  "that",
  "from",
  "it",
  "have",
]);

function isLikelyEnglish(text) {
  const nonLatin = (text.match(NON_LATIN) || []).length;
  const latin = (text.match(/[A-Za-z\u00C0-\u024F]/g) || []).length;
  if (nonLatin / (nonLatin + latin || 1) > 0.15) return false; // Russian, Arabic, Chinese, etc.

  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  if (words.length < 8) return !ACCENTED.test(text); // too short to judge, accept plain ASCII

  const hits = words.filter((w) => ENGLISH_WORDS.has(w)).length;
  return hits >= 2; // filters out German, French, Spanish, etc.
}

// games: [{ appId, title }]. Returns English news items from all of them, newest first.
export async function fetchNews(games, perGame = 2, englishOnly = true) {
  const settled = await Promise.allSettled(
    games.map(async (game) => {
      // Ask for extra items, since some will be dropped by the English filter
      const url = `${NEWS_API}?appid=${game.appId}&count=${perGame * 4}&maxlength=300`;
      const data = await fetchJson(url);
      const items =
        data && data.appnews && data.appnews.newsitems
          ? data.appnews.newsitems
          : [];
      return items
        .map((item) => ({
          id: `${game.appId}-${item.gid}`,
          gameTitle: game.title,
          title: item.title,
          url: item.url,
          date: item.date, // unix seconds
          snippet: cleanNewsText(item.contents),
          source: item.feedlabel || "",
        }))
        .filter(
          (item) =>
            !englishOnly || isLikelyEnglish(`${item.title} ${item.snippet}`),
        )
        .slice(0, perGame);
    }),
  );

  const succeeded = settled.filter((r) => r.status === "fulfilled");
  if (games.length > 0 && succeeded.length === 0)
    throw new Error("Could not load any news");

  return succeeded.flatMap((r) => r.value).sort((a, b) => b.date - a.date);
}
