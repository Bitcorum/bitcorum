export default async function handler(req, res) {
  const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";

  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (BitcorumRadio/1.0)" }
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    // Extract headline titles from the RSS XML
    const titleMatches = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/g)];

    const headlines = titleMatches
      .map(m => m[1].trim())
      .filter(t => t && t.toLowerCase() !== "coindesk: bitcoin, ethereum, crypto news and price data")
      .slice(0, 15);

    if (headlines.length === 0) {
      throw new Error("No headlines parsed from feed");
    }

    res.setHeader("Cache-Control", "s-maxage=1200, stale-while-revalidate=600");
    res.status(200).json({ headlines, source: "coindesk", updated: new Date().toISOString() });

  } catch (err) {
    res.status(200).json({ headlines: [], source: "fallback", error: err.message });
  }
}
