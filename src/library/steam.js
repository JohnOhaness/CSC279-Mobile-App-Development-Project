// Talks to the public Steam store. No API key needed.
// Both endpoints below are unofficial, so Valve could change them at any time.
const RESULTS_URL = "https://store.steampowered.com/search/results/"; // paginated list
const SUGGEST_URL = "https://store.steampowered.com/api/storesearch/"; // quick title search (~10 results)

async function fetchJson(url) {
  // Give up after 8 seconds instead of hanging forever
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok)
      throw new Error(`Steam responded with ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// The paginated list gives us a name and an image URL, and the app id is inside that URL
function appIdFromImage(url) {
  const match = /\/steam\/apps\/(\d+)/.exec(url || "");
  return match ? match[1] : null;
}

// Fallback: the quick title search (first page only)
export async function searchSteamGames(term) {
  const query = term.trim();
  if (query.length === 0) return [];
  const data = await fetchJson(
    `${SUGGEST_URL}?term=${encodeURIComponent(query)}&l=english&cc=us`,
  );
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map((item) => ({
    appId: String(item.id),
    name: item.name,
    image: item.tiny_image || null,
  }));
}

// Browse or search Steam games, one page at a time.
//   term empty  -> Steam's top sellers
//   term typed  -> matching games
//   start       -> how many results to skip (0 for the first page)
// Returns { items, nextStart, hasMore }.
export async function browseSteam({ term = "", start = 0 } = {}) {
  const query = term.trim();
  const params = [
    "json=1",
    `start=${start}`,
    "count=50",
    "category1=998",
    "l=english",
    "cc=us",
  ];
  params.push(
    query.length > 0
      ? `term=${encodeURIComponent(query)}`
      : "filter=topsellers",
  );

  try {
    const data = await fetchJson(`${RESULTS_URL}?${params.join("&")}`);
    const raw = Array.isArray(data.items) ? data.items : [];

    // Steam sometimes answers with an empty list when it doesn't like the request
    if (start === 0 && raw.length === 0 && query.length > 0) {
      throw new Error("Empty result list");
    }

    const items = [];
    for (const item of raw) {
      const appId = appIdFromImage(item.logo);
      if (appId && item.name)
        items.push({ appId, name: item.name, image: item.logo });
    }

    const nextStart = start + raw.length;
    const hasMore =
      raw.length > 0 &&
      (typeof data.total_count !== "number" || nextStart < data.total_count);
    return { items, nextStart, hasMore };
  } catch (error) {
    // Fall back to the quick title search so typing a title still works
    if (query.length === 0 || start > 0) throw error;
    const items = await searchSteamGames(query);
    return { items, nextStart: items.length, hasMore: false };
  }
}
