import { useState, useRef, useEffect, createContext, useContext } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";
import { BITCORUM_LOGO as NEW_LOGO_SRC } from "./logo";

// ── Shared market context — single source of truth for all price displays ──
const MarketContext = createContext({ price: null, change24h: null, source: null, feedMode: "loading" });

// ── LOGO ──────────────────────────────────────────────────────
const FOOTER_LOGO_SRC = "data:image/jpeg;base64,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LvXuHh6Q/wClXr0Dh5Kz1qkujePca4RN62phFNH93UvbEP0iFQ3qxWwf3VXGrkAz1dE3iz5cZwPnXOJJHyvLpXue48y45K8LsjRjtnJKzPg22766rahrobTELbARjijdxSuHm/u9mFqbnFzi5xJcTkknJKoi2UUujLIREUgIiIAiIgCIiAIiIAiIgCKqIAiIgKIqogCIiAIiICik2+obSVkU8kZlY09pgdw8QIwRnuUZEBk5a23OPYoJw3wNVn/pUe4VUVVJEYITCyOIRhpfxE4zvn2qIihJIlybMvbrtT09qkt9XSSzMdOJg6OfqyDw8OPenKv2+72q31sVZDa6l00R4mcdaCM+Y4FgUUbUSptFVRVRWKlEVcIgKIqogKIqogCIiAIiICiKqICiIiAIiIAiIgCqqIgKoqKqAIiIAioqoAiIgCIiAIiIAiIgKKqoiAKqIgCIiAIiZQBERAERUQFUREAREQFEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAVRURAVVERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQH//Z";

// ── BUILT-IN KNOWLEDGE for offline/rate-limited mode ─────────
const CRYPTO_FACTS = [
  "Satoshi Nakamoto's Bitcoin whitepaper was only 9 pages long — published on 31 October 2008, exactly on Halloween. The identity of Satoshi remains unknown to this day, with estimates suggesting they hold around 1.1 million BTC.",
  "The first real-world Bitcoin transaction was for two pizzas on 22 May 2010. Laszlo Hanyecz paid 10,000 BTC for them — worth over $600 million at Bitcoin's all-time high. That day is now celebrated as 'Bitcoin Pizza Day'.",
  "Ethereum was originally described in a whitepaper written by Vitalik Buterin in 2013 when he was just 19 years old. The Ethereum network went live in July 2015 and introduced the concept of smart contracts to mainstream crypto.",
  "The total supply of Bitcoin is capped at 21 million. As of 2025, about 19.7 million BTC have been mined. Roughly 3–4 million BTC are estimated to be permanently lost due to forgotten passwords and lost wallets.",
  "Crypto mining consumes enormous energy, but over 50% of Bitcoin mining now uses renewable energy sources — more than almost any other industry. The Cambridge Centre for Alternative Finance tracks this data.",
  "The Lightning Network is a Layer 2 solution built on Bitcoin that enables near-instant, near-zero fee transactions. El Salvador uses it for everyday Bitcoin payments since adopting BTC as legal tender in 2021.",
  "DeFi (Decentralised Finance) protocols locked over $180 billion in total value at their peak in 2021. These protocols let users earn yield, borrow, and trade without any bank or intermediary.",
  "NFTs (Non-Fungible Tokens) existed since 2014, but the market exploded in 2021. The most expensive NFT ever sold was Beeple's 'Everydays: The First 5000 Days' for $69.3 million at Christie's auction house.",
  "Vitalik Buterin donated $1 billion worth of SHIB tokens to the India COVID Relief Fund in 2021 after developers sent him trillions of SHIB tokens unsolicited — essentially forcing the largest crypto donation in history.",
  "The Ethereum Merge in September 2022 reduced the network's energy consumption by approximately 99.95% overnight — switching from Proof of Work to Proof of Stake. This was one of the most complex technical upgrades in crypto history.",
  "Bitcoin halving events occur every 210,000 blocks (roughly every 4 years). Each halving cuts the mining reward in half. After the 2024 halving, miners receive 3.125 BTC per block. There will only ever be 32 halvings total.",
  "The pseudonymous Satoshi Nakamoto mined the Genesis Block on 3 January 2009. Embedded in it was a Times newspaper headline: 'Chancellor on brink of second bailout for banks' — a message about why Bitcoin was created.",
  "Solana can theoretically process 65,000 transactions per second compared to Bitcoin's 7 TPS and Ethereum's 15-30 TPS. Solana achieves this through a unique Proof of History consensus mechanism invented by Anatoly Yakovenko.",
  "There are over 20,000 different cryptocurrencies listed on various exchanges. However, the top 10 coins by market cap account for over 85% of the entire crypto market capitalisation.",
  "Crypto whales (wallets holding 1,000+ BTC) control a significant portion of the market. When whales move large amounts to exchanges, it often signals an incoming sell — a key metric tracked by on-chain analysts.",
  "The SEC approved spot Bitcoin ETFs in January 2024, marking a historic moment. BlackRock's iShares Bitcoin ETF became the fastest ETF in history to reach $10 billion in assets under management — doing it in just 49 days.",
  "zkEVM technology allows Ethereum transactions to be verified without revealing the underlying data. Networks like Polygon zkEVM and zkSync Era are making this mainstream in 2024-25.",
  "Ordinals — Bitcoin's version of NFTs — launched in January 2023. They allow data to be inscribed directly onto individual satoshis. Over 60 million inscriptions were created in the first year alone.",
  "James Howells, a Welsh IT worker, accidentally threw away a hard drive containing 7,500 BTC in 2013. It's buried in a landfill in Newport, Wales. He has repeatedly offered the council millions to excavate it — they've repeatedly refused.",
  "The smallest unit of Bitcoin is called a Satoshi — 0.00000001 BTC. At $100,000 per BTC, one Satoshi would be worth $0.001. You can buy fractions of Bitcoin right down to one Satoshi.",
  "Mt. Gox, once handling over 70% of all Bitcoin transactions worldwide, was hacked in 2014. Approximately 850,000 BTC were stolen — worth billions. Creditors are still receiving repayments over a decade later.",
  "El Salvador became the first country to adopt Bitcoin as legal tender in September 2021. The government built Chivo wallets for citizens and even bought Bitcoin dips with the national treasury.",
  "The term 'HODL' originated from a typo in a 2013 Bitcoin forum post titled 'I AM HODLING'. The poster was drunk and misspelled 'holding'. The term became crypto culture and now stands for 'Hold On for Dear Life'.",
  "Bitcoin's pseudonymous creator Satoshi Nakamoto is estimated to have mined approximately 1.1 million BTC in the early days. None of those coins have ever moved. At today's prices that would make Satoshi one of the wealthiest people on Earth.",
  "Ethereum gas fees once hit over $500 for a single transaction during peak DeFi activity in 2021. This drove massive demand for Layer 2 solutions like Arbitrum, Optimism and Base which offer fees of fractions of a cent.",
  "The Bitcoin network has never been successfully hacked since its creation in 2009. Its security comes from the decentralised mining network — attacking it would require controlling 51% of all mining power globally.",
  "Dogecoin was created in December 2013 as a joke by software engineers Billy Markus and Jackson Palmer. It was based on the Shiba Inu dog meme. It now has a market cap of several billion dollars and Elon Musk has repeatedly endorsed it.",
  "The concept of blockchain was first described by Stuart Haber and W. Scott Stornetta in 1991 — nearly 20 years before Bitcoin. They wanted to create a system where document timestamps could not be tampered with.",
  "Ripple (XRP) was designed to be a payment system for banks, not individuals. It can settle international transactions in 3-5 seconds with fees of fractions of a cent — compared to SWIFT bank transfers which take 3-5 days.",
  "The total value of all gold ever mined throughout human history is approximately $13 trillion. Bitcoin's market cap at its peak was approaching $1.4 trillion — roughly 10% of all gold. Many analysts believe Bitcoin will eventually surpass gold.",
  "Ethereum's 'smart contracts' were inspired by a concept described by Nick Szabo in 1994 — 14 years before Bitcoin existed. Szabo called them 'digital vending machines' — code that automatically executes when conditions are met.",
  "Monero (XMR) uses ring signatures and stealth addresses to make transactions completely untraceable. Unlike Bitcoin where all transactions are public, Monero hides sender, receiver and amount — making it the most private major cryptocurrency.",
  "The Binance exchange was founded in 2017 and within 180 days became the largest crypto exchange in the world by trading volume. Its founder Changpeng Zhao (CZ) went from working at McDonald's to becoming one of the world's wealthiest people.",
  "Bitcoin mining difficulty adjusts automatically every 2,016 blocks (approximately every 2 weeks) to maintain a consistent 10-minute block time. When more miners join, it gets harder. When miners leave, it gets easier.",
  "Stablecoins like USDT (Tether) and USDC were designed to maintain a 1:1 peg with the US Dollar. Combined, stablecoins now facilitate trillions of dollars in transactions annually — more than Visa and Mastercard combined.",
  "The Ethereum Name Service (ENS) allows users to replace long crypto wallet addresses with human-readable names like 'paul.eth'. Over 2 million ENS names have been registered since the service launched in 2017.",
  "In 2010, Bitcoin's value was set by a free market exchange for the first time on a pizza forum. The price? $0.0025 per BTC. Within a year it hit $1. The journey from $0.0025 to over $100,000 took just 14 years.",
  "Cardano (ADA) was founded by Charles Hoskinson, one of the original eight co-founders of Ethereum. Unlike most blockchains, every change to Cardano must be backed by peer-reviewed academic research before implementation.",
  "The Bitcoin mempool is a waiting room for unconfirmed transactions. During periods of high activity it can contain hundreds of thousands of transactions. Miners prioritise those with higher fees — a direct free market for block space.",
  "Chainlink (LINK) is an oracle network that connects smart contracts to real-world data. Without oracles, a smart contract can only see data on its own blockchain. Chainlink feeds price data from hundreds of sources into DeFi protocols.",
  "Wrapped Bitcoin (WBTC) is an ERC-20 token on Ethereum backed 1:1 by real Bitcoin. It lets Bitcoin holders participate in Ethereum DeFi without selling their BTC. Over 150,000 WBTC are in circulation.",
  "The first Bitcoin ATM was installed in Vancouver, Canada in October 2013. Today there are over 35,000 Bitcoin ATMs worldwide — the USA has the most with over 25,000 machines.",
  "Satoshi's last public post was in December 2010. They handed development to Gavin Andresen and simply disappeared. No one has ever conclusively proved who Satoshi is — multiple people have claimed to be them, all unverified.",
  "Crypto market cycles have historically followed a pattern tied to Bitcoin halvings. The cycle goes: halving → supply shock → bull run → all-time high → correction → bear market → accumulation → next halving.",
  "The Proof of Work mechanism used by Bitcoin was originally proposed in 1993 to fight email spam — long before Satoshi used it as Bitcoin's consensus mechanism. Satoshi repurposed it brilliantly.",
  "Polkadot (DOT) was created by Gavin Wood, another Ethereum co-founder. It's designed as a 'blockchain of blockchains' — allowing different networks to communicate and share security. Gavin Wood also invented the Solidity programming language.",
  "Over $3 billion was lost to crypto hacks and exploits in 2022 alone — making it the worst year in crypto history for theft. Most losses came from cross-chain bridge exploits rather than exchange hacks.",
  "The block reward for Bitcoin mining started at 50 BTC per block in 2009. After four halvings it's now 3.125 BTC. The last Bitcoin will be mined around the year 2140 — over 100 years from now.",
  "Michael Saylor's company MicroStrategy holds the largest corporate Bitcoin treasury in the world — over 200,000 BTC purchased at an average price well below current market rates. Saylor has called Bitcoin 'digital energy'.",
  "Terra Luna's UST stablecoin collapsed in May 2022 in a matter of days, wiping out approximately $40 billion in market value. It was one of the fastest and most catastrophic collapses in financial history.",
  "The Satoshi to Bitcoin ratio (1 BTC = 100,000,000 Satoshis) means there are 2.1 quadrillion Satoshis in total. Some argue we should price Bitcoin in Satoshis rather than whole coins as adoption grows.",
  "FTX, once valued at $32 billion and run by Sam Bankman-Fried, collapsed in November 2022 in just 72 hours. SBF was arrested and convicted of fraud. It was the second-largest financial fraud in US history.",
  "Bitcoin's hash rate — the total computing power securing the network — reached an all-time high of over 1 Zettahash per second in 2025. To put that in perspective, it would take every computer on Earth combined years to crack a single private key.",
  "The Lightning Network's capacity has grown to over 5,000 BTC locked in payment channels. Transactions settle in milliseconds and cost fractions of a cent — making Bitcoin genuinely usable for buying a coffee.",
  "Uniswap, the largest decentralised exchange, has processed over $1.5 trillion in trading volume since launch in 2018. It was created by a single developer, Hayden Adams, who learned to code specifically to build it after losing his job.",
  "On-chain data shows that long-term Bitcoin holders (holding for 1+ years) have never sold at a loss on aggregate. Despite multiple 80%+ price crashes, patient holders have always eventually recovered and profited.",
  "The Lightning Network was proposed in a whitepaper by Joseph Poon and Thaddeus Dryja in 2015. It took years to implement but now processes millions of transactions. Strike and Cash App both use it for Bitcoin payments.",
  "Bitcoin's scripting language was intentionally kept simple and non-Turing complete by Satoshi to reduce attack surface. This is why smart contracts don't run natively on Bitcoin — and why some argue Bitcoin is safer for it.",
  "The Grayscale Bitcoin Trust (GBTC) held over 600,000 BTC at its peak — making it one of the largest single holders of Bitcoin in the world. Its conversion to a spot ETF in January 2024 was a landmark regulatory moment.",
  "Crypto's total market cap briefly exceeded $3 trillion in November 2021. At that point it was larger than the GDP of France and larger than all but 5 countries in the world.",
];

const MINING_MACHINES = `⚡ TOP BITCOIN MINING MACHINES (2026)
*Prices are approximate — always verify current pricing before purchasing.*

**1. Bitmain Antminer S21 XP**
• Hash Rate: 270 TH/s | Power: 3,645W | Efficiency: 13.5 J/TH
• Best-in-class air-cooled efficiency for 2026
• Price: ~$5,500–$7,000 USD
• Buy: shop.bitmain.com

**2. MicroBT Whatsminer M79S**
• Hash Rate: 930 TH/s | Power: 12,555W | Efficiency: 13.5 J/TH
• Industrial petahash-scale machine — enterprise only
• Price: ~$25–$30/TH (contact MicroBT directly)
• Buy: microbt.com

**3. Bitmain Antminer S21 XP Hyd**
• Hash Rate: 473 TH/s | Power: 5,676W | Efficiency: 12 J/TH
• Hydro-cooled — requires liquid cooling infrastructure
• Price: ~$8,000–$11,000 USD
• Buy: shop.bitmain.com / luxor.tech

**4. Bitmain Antminer S21 Pro**
• Hash Rate: 234 TH/s | Power: 3,531W | Efficiency: 15.1 J/TH
• Proven air-cooled workhorse, widely available
• Price: ~$3,500–$4,800 USD
• Buy: shop.bitmain.com

**5. Canaan Avalon A1566**
• Hash Rate: 185 TH/s | Power: 3,150W | Efficiency: 17 J/TH
• Solid budget option for smaller operations
• Price: ~$2,500–$3,200 USD
• Buy: canaan.io

**6. Bitaxe Gamma (Open Source)**
• Hash Rate: ~1.2 TH/s | Power: ~15W | Noise: near-silent
• Best home/solo miner — open source, no KYC required
• Price: ~$150–$250 USD
• Buy: bitaxe.org / D-Central / Tindie

⚡ ROI TIP: Always check whattomine.com with your local electricity rate before buying. Efficiency (J/TH) matters more than raw hash rate — the lower the better. At $0.06/kWh electricity the S21 XP typically achieves ROI in 10–16 months depending on BTC price.`;

const PAUL_RESPONSES = {
  default: (q) => {
    const lq = q.toLowerCase();
    // Smartly pick the single best agent based on keywords, with fallback to showing all
    let bestAgent = '';
    if (lq.includes('bitaxe') || lq.includes('mine') || lq.includes('mining') || lq.includes('miner') || lq.includes('asic') || lq.includes('hardware') || lq.includes('hash') || lq.includes('antminer') || lq.includes('whatsminer')) {
      bestAgent = 'marvin';
    } else if (lq.includes('price') || lq.includes('chart') || lq.includes('technical') || lq.includes('support') || lq.includes('resistance') || lq.includes('indicator') || lq.includes('rsi') || lq.includes('macd') || lq.includes('trend')) {
      bestAgent = 'axiom';
    } else if (lq.includes('news') || lq.includes('latest') || lq.includes('update') || lq.includes('announcement') || lq.includes('regulation') || lq.includes('sec') || lq.includes('etf')) {
      bestAgent = 'nova';
    } else if (lq.includes('sentiment') || lq.includes('fear') || lq.includes('greed') || lq.includes('social') || lq.includes('mood') || lq.includes('community')) {
      bestAgent = 'pulse';
    } else if (lq.includes('risk') || lq.includes('safe') || lq.includes('danger') || lq.includes('volatile') || lq.includes('loss') || lq.includes('downside')) {
      bestAgent = 'aegis';
    } else if (lq.includes('buy') || lq.includes('sell') || lq.includes('hold') || lq.includes('invest') || lq.includes('decision') || lq.includes('verdict') || lq.includes('should i')) {
      bestAgent = 'verdict';
    } else if (lq.includes('fact') || lq.includes('know') || lq.includes('secret') || lq.includes('history') || lq.includes('did you') || lq.includes('tell me') || lq.includes('interesting') || lq.includes('learn')) {
      bestAgent = 'gloggs';
    } else if (lq.includes('problem') || lq.includes('fix') || lq.includes('error') || lq.includes('broken') || lq.includes('issue') || lq.includes('not working') || lq.includes('help') || lq.includes('trouble')) {
      bestAgent = 'stan';
    }

    const agentMap = {
      nova:    '→ **NOVA** (News Analyst) — scroll down to the Help section and ask Nova about the latest crypto news and market-moving headlines for any coin.',
      axiom:   '→ **AXIOM** (Tech Analyst) — press **CONVENE THE COUNCIL** above and select your cryptocurrency for a full technical chart and indicator breakdown.',
      pulse:   '→ **PULSE** (Sentiment Scout) — press **CONVENE THE COUNCIL** above. PULSE will give you a deep dive into social sentiment, fear & greed, and market psychology.',
      aegis:   '→ **AEGIS** (Risk Manager) — press **CONVENE THE COUNCIL** above. AEGIS will assess volatility, regulatory risk, and downside scenarios for your chosen coin.',
      verdict: '→ **VERDICT** (Chief Strategist) — press **CONVENE THE COUNCIL** above. All 6 agents will debate and VERDICT will deliver the final BUY, SELL or HOLD decision.',
      marvin:  '→ **MARVIN** (Mining Specialist) — scroll down to the Help & Support section and click "Show Me The Best Mining Machines". Marvin will give you full specs, prices and buy links.',
      gloggs:  '→ **CLEVER GLOGGS** (Hidden Knowledge) — scroll down to the Help & Support section and click "Tell Me Something I Don\'t Know". Gloggs has fascinating crypto facts ready for you.',
      stan:    '→ **STAN** (Technical Support) — scroll down to the Help & Support section, type your problem in the Stan box, and he will walk you through fixing it step by step.',
    };

    const intro = `I am Paul Frederick, the creator of Bitcorum. Thank you for your question about "${q.slice(0,70)}${q.length>70?'...':''}".`;

    if (bestAgent && agentMap[bestAgent]) {
      return `${intro}

I know exactly who can help you best with this:

${agentMap[bestAgent]}

Here is a full list of all our agents and what they specialise in:

→ **NOVA** — Latest crypto news & market events
→ **AXIOM** — Technical analysis, charts & price levels
→ **PULSE** — Market sentiment & social mood
→ **AEGIS** — Risk assessment & downside protection
→ **ROGUE** — Contrarian devil's advocate view
→ **VERDICT** — Final BUY / SELL / HOLD decision
→ **CLEVER GLOGGS** — Hidden crypto knowledge & facts
→ **MARVIN** — Bitcoin mining machines & hardware
→ **STAN** — Technical support & troubleshooting

Welcome to Bitcorum — where AI agents work for you! 🚀`;
    }

    // Generic fallback — show all agents
    return `${intro}

Here is a full breakdown of all our agents and who is best placed to help:

→ **NOVA** (News Analyst) — for the latest crypto news, regulatory updates and market-moving headlines. Available in the Help section below.
→ **AXIOM** (Tech Analyst) — for chart patterns, support/resistance levels and technical signals. Press CONVENE THE COUNCIL above.
→ **PULSE** (Sentiment Scout) — for social sentiment, fear & greed, and market psychology. Press CONVENE THE COUNCIL above.
→ **AEGIS** (Risk Manager) — for risk assessment, volatility analysis and downside scenarios. Press CONVENE THE COUNCIL above.
→ **ROGUE** (Devil's Advocate) — for contrarian views and challenging the consensus. Press CONVENE THE COUNCIL above.
→ **VERDICT** (Chief Strategist) — for a final BUY, SELL or HOLD decision. Press CONVENE THE COUNCIL above.
→ **CLEVER GLOGGS** (Hidden Knowledge) — for fascinating crypto facts most people never know. Available in Help & Support below.
→ **MARVIN** (Mining Specialist) — for mining machine recommendations, prices and ROI. Available in Help & Support below.
→ **STAN** (Technical Support) — for fixing mining machines, firmware issues and technical problems. Available in Help & Support below.

Welcome to Bitcorum — where AI agents work for you! 🚀`;
  },
};

// ── Trading Agents ─────────────────────────────────────────
const TRADING_AGENTS = [
  { id:"news", name:"NOVA", label:"NEWS ANALYST", color:"#00d4ff",
    role:"You are NOVA, a crypto news analyst for Bitcorum. Search for and analyse the latest news, headlines, and developments for the given cryptocurrency. Focus on recent events, regulatory news, partnerships, and market-moving stories. Be concise but insightful. End with: BULLISH, BEARISH, or NEUTRAL." },
  { id:"technical", name:"AXIOM", label:"TECH ANALYST", color:"#c8aa5a",
    role:"You are AXIOM, a crypto technical analyst for Bitcorum. Analyse key technical indicators: trend direction, momentum, support/resistance levels, volume patterns. Be concise. End with: BULLISH, BEARISH, or NEUTRAL." },
  { id:"sentiment", name:"PULSE", label:"SENTIMENT SCOUT", color:"#f472b6",
    role:"You are PULSE, a sentiment analyst for Bitcorum. Analyse social sentiment, fear & greed indicators, retail vs institutional interest, and market psychology. Be concise. End with: BULLISH, BEARISH, or NEUTRAL." },
  { id:"risk", name:"AEGIS", label:"RISK MANAGER", color:"#fb923c",
    role:"You are AEGIS, the risk manager for Bitcorum. Assess volatility, liquidity, macro risk, regulatory risk and downside scenarios. Give a risk rating (LOW/MEDIUM/HIGH). End with: PROCEED, CAUTION, or AVOID." },
  { id:"devil", name:"ROGUE", label:"DEVIL'S ADVOCATE", color:"#4ade80",
    role:"You are ROGUE, devil's advocate for Bitcorum. Argue the OPPOSITE of the majority view. Challenge assumptions and highlight what everyone else is missing. Be sharp and contrarian." },
  { id:"judge", name:"VERDICT", label:"CHIEF STRATEGIST", color:"#fbbf24",
    role:"You are VERDICT, chief strategist for Bitcorum. Review all agent analysis and give ONE clear decision: BUY, SELL, or HOLD with reasoning. Be decisive. Start with BUY / SELL / HOLD in capitals." }
];

const COINS = ["BTC","ETH","SOL","BNB","XRP","DOGE","ADA","AVAX"];
const DASHBOARD_PAIRS = ["BTC/USDT","ETH/USDT","SOL/USDT","AVAX/USDT","ARB/USDT"];
const BASE_PRICES = { "BTC/USDT":77000,"ETH/USDT":2115,"SOL/USDT":85.8,"AVAX/USDT":19.2,"ARB/USDT":0.37 };
const DASHBOARD_AGENTS = [
  { id:"ARB-7", name:"ARB-7", label:"Arbitrage Hunter", color:"#00d4ff" },
  { id:"TREND-9", name:"TREND-9", label:"Trend Follower", color:"#c8aa5a" },
  { id:"SENT-3", name:"SENT-3", label:"Sentiment Analyst", color:"#f472b6" },
  { id:"RISK-1", name:"RISK-1", label:"Risk Manager", color:"#fb923c" },
];

const verdictStyle = (text) => {
  if (!text) return {};
  const t = text.toUpperCase();
  if (t.includes("BUY")) return { color:"#4ade80", label:"BUY" };
  if (t.includes("SELL")) return { color:"#f87171", label:"SELL" };
  if (t.includes("HOLD")) return { color:"#fbbf24", label:"HOLD" };
  if (t.includes("BULLISH")) return { color:"#4ade80", label:"BULLISH" };
  if (t.includes("BEARISH")) return { color:"#f87171", label:"BEARISH" };
  if (t.includes("NEUTRAL")) return { color:"#94a3b8", label:"NEUTRAL" };
  if (t.includes("PROCEED")) return { color:"#4ade80", label:"PROCEED" };
  if (t.includes("CAUTION")) return { color:"#fbbf24", label:"CAUTION" };
  if (t.includes("AVOID")) return { color:"#f87171", label:"AVOID" };
  return { color:"#94a3b8", label:"—" };
};

// ── Markdown Renderer ─────────────────────────────────────────
const MarkdownText = ({ text, color = "#e2e8f0", borderColor = "rgba(255,255,255,0.08)" }) => {
  if (!text) return null;

  const parseInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "#ffffff", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      const italicParts = part.split(/(\*[^*]+\*)/g);
      if (italicParts.length > 1) {
        return italicParts.map((ip, j) => {
          if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
            return <em key={j} style={{ color: "#cbd5e1", fontStyle: "italic" }}>{ip.slice(1, -1)}</em>;
          }
          return ip;
        });
      }
      return part;
    });
  };

  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
      i++; continue;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <div key={i} style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.08em", marginTop: 10, marginBottom: 4 }}>
          {parseInline(trimmed.slice(4))}
        </div>
      );
      i++; continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", letterSpacing: "0.1em", marginTop: 12, marginBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>
          {parseInline(trimmed.slice(3))}
        </div>
      );
      i++; continue;
    }

    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || (trimmed.startsWith("* ") && !trimmed.startsWith("**"))) {
      const bullet = trimmed.startsWith("• ") ? trimmed.slice(2) : trimmed.slice(2);
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 3 }}>
          <span style={{ color: color, opacity: 0.7, flexShrink: 0, marginTop: 1 }}>•</span>
          <span style={{ color, lineHeight: 1.7 }}>{parseInline(bullet)}</span>
        </div>
      );
      i++; continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
          <span style={{ color: color, opacity: 0.6, flexShrink: 0, minWidth: 18, fontWeight: 700, marginTop: 1 }}>{numMatch[1]}.</span>
          <span style={{ color, lineHeight: 1.7 }}>{parseInline(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    if (trimmed.startsWith("→ ")) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4, paddingLeft: 4 }}>
          <span style={{ color: "#d4a300", flexShrink: 0, marginTop: 1 }}>→</span>
          <span style={{ color, lineHeight: 1.7 }}>{parseInline(trimmed.slice(2))}</span>
        </div>
      );
      i++; continue;
    }

    if (trimmed.startsWith("⚠️") || trimmed.startsWith("⚠ ")) {
      elements.push(
        <div key={i} style={{ fontSize: 11, color: "#fbbf24", lineHeight: 1.7, marginTop: 8, padding: "6px 10px", background: "rgba(251,191,36,0.08)", borderRadius: 6, border: "1px solid rgba(251,191,36,0.2)" }}>
          {parseInline(trimmed)}
        </div>
      );
      i++; continue;
    }

    if (trimmed.startsWith("⛔")) {
      elements.push(
        <div key={i} style={{ fontSize: 11, color: "#f87171", lineHeight: 1.7, marginTop: 8, padding: "6px 10px", background: "rgba(248,113,113,0.07)", borderRadius: 6, border: "1px solid rgba(248,113,113,0.2)" }}>
          {parseInline(trimmed.slice(1).trim())}
        </div>
      );
      i++; continue;
    }

    elements.push(
      <div key={i} style={{ color, lineHeight: 1.8, marginBottom: 2 }}>
        {parseInline(trimmed)}
      </div>
    );
    i++;
  }

  return (
    <div style={{ fontSize: 12, borderTop: `1px solid ${borderColor}`, paddingTop: 12, marginTop: 10 }}>
      {elements}
    </div>
  );
};

// ── Robot Faces ──────────────────────────────────────────────
const RobotFace = ({ agentId, color, size=48, isActive }) => {
  const id = `grd_${agentId}_${size}`;
  const faces = {
    paul:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#2a1a0a"/><stop offset="100%" stopColor="#080600"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#1a1008" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <rect x="8" y="11" width="32" height="31" rx="8" fill={`url(#${id})`} stroke={color} strokeWidth="1.3"/>
        <rect x="8" y="11" width="32" height="5" rx="4" fill="#1a0a00" stroke={color} strokeWidth="0.8" opacity="0.9"/>
        <rect x="3" y="22" width="5" height="10" rx="2.5" fill="#1a1008" stroke={color} strokeWidth="1"/>
        <rect x="40" y="22" width="5" height="10" rx="2.5" fill="#1a1008" stroke={color} strokeWidth="1"/>
        <rect x="10" y="22" width="12" height="8" rx="2" fill={color} opacity="0.08" stroke={color} strokeWidth="1.2"/>
        <rect x="26" y="22" width="12" height="8" rx="2" fill={color} opacity="0.08" stroke={color} strokeWidth="1.2"/>
        <line x1="22" y1="26" x2="26" y2="26" stroke={color} strokeWidth="1" opacity="0.8"/>
        <ellipse cx="16" cy="26" rx="2.5" ry="1.8" fill={color} opacity="0.85"/>
        <ellipse cx="32" cy="26" rx="2.5" ry="1.8" fill={color} opacity="0.85"/>
        <path d="M18 37 Q24 42 30 37" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M17 34 Q24 37 31 34" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    news:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#2a2a3a"/><stop offset="100%" stopColor="#080810"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#111118" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <rect x="7" y="13" width="34" height="30" rx="7" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <line x1="24" y1="13" x2="24" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="4" r="2" fill={color}/>
        <rect x="3" y="23" width="4" height="9" rx="2" fill="#1a1a28" stroke={color} strokeWidth="1"/>
        <rect x="41" y="23" width="4" height="9" rx="2" fill="#1a1a28" stroke={color} strokeWidth="1"/>
        <rect x="10" y="21" width="28" height="9" rx="2" fill={color} opacity="0.12" stroke={color} strokeWidth="1"/>
        <ellipse cx="19" cy="25.5" rx="3.5" ry="2.5" fill={color} opacity="0.9"/>
        <ellipse cx="29" cy="25.5" rx="3.5" ry="2.5" fill={color} opacity="0.9"/>
        <rect x="15" y="35" width="18" height="4" rx="1" fill="#111118" stroke={color} strokeWidth="0.6" opacity="0.7"/>
      </svg>
    ),
    technical:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="60%"><stop offset="0%" stopColor="#1e1e30"/><stop offset="100%" stopColor="#060610"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#111118" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <path d="M10 38 L8 20 L14 13 L34 13 L40 20 L38 38 Q38 43 24 43 Q10 43 10 38Z" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <rect x="3" y="21" width="5" height="10" rx="2.5" fill="#1a1a28" stroke={color} strokeWidth="1"/>
        <rect x="40" y="21" width="5" height="10" rx="2.5" fill="#1a1a28" stroke={color} strokeWidth="1"/>
        <circle cx="18" cy="26" r="5.5" fill="#0a0a14" stroke={color} strokeWidth="1"/>
        <circle cx="30" cy="26" r="5.5" fill="#0a0a14" stroke={color} strokeWidth="1"/>
        <circle cx="18" cy="26" r="2.5" fill={color} opacity="0.9"/>
        <circle cx="30" cy="26" r="2.5" fill={color} opacity="0.9"/>
        <rect x="16" y="35" width="16" height="4" rx="1" fill="#0a0a14" stroke={color} strokeWidth="0.6" opacity="0.8"/>
      </svg>
    ),
    sentiment:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#221830"/><stop offset="100%" stopColor="#08060f"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#111118" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <ellipse cx="24" cy="26" rx="16" ry="16" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <rect x="8" y="33" width="32" height="8" rx="4" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <ellipse cx="18" cy="25" rx="4" ry="3" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <ellipse cx="30" cy="25" rx="4" ry="3" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <ellipse cx="18" cy="25" rx="2" ry="1.5" fill={color} opacity="0.9"/>
        <ellipse cx="30" cy="25" rx="2" ry="1.5" fill={color} opacity="0.9"/>
        <path d="M16 33 Q24 38 32 33" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    risk:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="60%"><stop offset="0%" stopColor="#1a1510"/><stop offset="100%" stopColor="#080604"/></radialGradient></defs>
        {/* Neck */}
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#111108" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        {/* Rounded square head — warm like Luna */}
        <rect x="6" y="10" width="36" height="34" rx="10" fill={`url(#${id})`} stroke={color} strokeWidth="1.4"/>
        {/* Bow on top */}
        <path d="M18 10 L24 6 L30 10 L24 8 Z" fill={color} opacity="0.75" stroke={color} strokeWidth="0.6"/>
        <circle cx="24" cy="7" r="1.5" fill={color} opacity="0.9"/>
        {/* Ears */}
        <rect x="2" y="20" width="4" height="10" rx="2" fill="#121008" stroke={color} strokeWidth="1"/>
        <rect x="42" y="20" width="4" height="10" rx="2" fill="#121008" stroke={color} strokeWidth="1"/>
        {/* Big round eyes */}
        <circle cx="17" cy="24" r="6" fill="#080604" stroke={color} strokeWidth="1.2"/>
        <circle cx="31" cy="24" r="6" fill="#080604" stroke={color} strokeWidth="1.2"/>
        <circle cx="17" cy="24" r="3.5" fill={color} opacity="0.9"/>
        <circle cx="31" cy="24" r="3.5" fill={color} opacity="0.9"/>
        {/* Eye shine */}
        <circle cx="19" cy="22" r="1.2" fill="white" opacity="0.35"/>
        <circle cx="33" cy="22" r="1.2" fill="white" opacity="0.35"/>
        {/* Wide warm smile */}
        <path d="M14 36 Q24 43 34 36" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    devil:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="45%" cy="40%" r="60%"><stop offset="0%" stopColor="#0d1a0a"/><stop offset="100%" stopColor="#050a04"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#0a100a" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <path d="M9 38 L8 18 L16 11 L38 13 L40 22 L39 38 Q38 43 24 43 Q10 43 9 38Z" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <path d="M32 13 L36 4 L39 13" fill={color} opacity="0.8" stroke={color} strokeWidth="0.8"/>
        <rect x="3" y="22" width="5" height="8" rx="2" fill="#0d140a" stroke={color} strokeWidth="1"/>
        <circle cx="17" cy="26" r="3.5" fill="#050a04" stroke={color} strokeWidth="1"/>
        <circle cx="29" cy="26" r="5" fill="#050a04" stroke={color} strokeWidth="1"/>
        <circle cx="17" cy="26" r="1.8" fill={color} opacity="0.85"/>
        <circle cx="29" cy="26" r="2.8" fill={color} opacity="0.85"/>
        <path d="M14 35 L17 33 L20 36 L23 32 L26 36 L29 33 L33 35" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    judge:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#1e1600"/><stop offset="100%" stopColor="#080600"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#100e00" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <path d="M8 38 L8 18 L13 12 L35 12 L40 18 L40 38 Q40 44 24 44 Q8 44 8 38Z" fill={`url(#${id})`} stroke={color} strokeWidth="1.3"/>
        <path d="M11 12 L14 5 L18 10 L24 3 L30 10 L34 5 L37 12" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="5" r="1.5" fill={color} opacity="0.9"/>
        <circle cx="24" cy="3" r="2" fill={color} opacity="0.9"/>
        <circle cx="34" cy="5" r="1.5" fill={color} opacity="0.9"/>
        <rect x="3" y="21" width="5" height="12" rx="2.5" fill="#1a1400" stroke={color} strokeWidth="1.2"/>
        <rect x="40" y="21" width="5" height="12" rx="2.5" fill="#1a1400" stroke={color} strokeWidth="1.2"/>
        <path d="M13 27 L18 23 L23 27 L18 31 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <path d="M25 27 L30 23 L35 27 L30 31 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <circle cx="18" cy="27" r="2" fill={color} opacity="0.95"/>
        <circle cx="30" cy="27" r="2" fill={color} opacity="0.95"/>
        <path d="M14 36 Q24 41 34 36" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    gloggs:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#001a1a"/><stop offset="100%" stopColor="#000808"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#001010" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <rect x="7" y="12" width="34" height="30" rx="9" fill={`url(#${id})`} stroke={color} strokeWidth="1.3"/>
        <rect x="9" y="12" width="30" height="4" rx="2" fill="#001a1a" stroke={color} strokeWidth="0.8"/>
        <rect x="18" y="8" width="12" height="4" rx="1" fill={color} opacity="0.4"/>
        <ellipse cx="17" cy="25" rx="5" ry="3.5" fill={color} opacity="0.1" stroke={color} strokeWidth="1"/>
        <ellipse cx="31" cy="25" rx="5" ry="3.5" fill={color} opacity="0.1" stroke={color} strokeWidth="1"/>
        <ellipse cx="17" cy="25" rx="2.5" ry="2" fill={color} opacity="0.85"/>
        <ellipse cx="31" cy="25" rx="2.5" ry="2" fill={color} opacity="0.85"/>
        <path d="M12 20 Q17 17 22 20" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M16 34 Q24 39 33 34" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="8" r="2" fill={color} opacity="0.7"/>
      </svg>
    ),
    marvin:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#1a0a1a"/><stop offset="100%" stopColor="#080408"/></radialGradient></defs>
        <rect x="19" y="41" width="10" height="5" rx="2" fill="#100810" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <rect x="8" y="13" width="32" height="29" rx="7" fill={`url(#${id})`} stroke={color} strokeWidth="1.3"/>
        <path d="M8 16 Q24 9 40 16" fill="#1a0a1a" stroke={color} strokeWidth="0.8"/>
        <rect x="2" y="21" width="6" height="10" rx="3" fill="#1a0a1a" stroke={color} strokeWidth="1"/>
        <rect x="40" y="21" width="6" height="10" rx="3" fill="#1a0a1a" stroke={color} strokeWidth="1"/>
        <circle cx="17" cy="25" r="4.5" fill="#0a040a" stroke={color} strokeWidth="1"/>
        <circle cx="31" cy="25" r="4.5" fill="#0a040a" stroke={color} strokeWidth="1"/>
        <circle cx="17" cy="25" r="2.2" fill={color} opacity="0.9"/>
        <circle cx="31" cy="25" r="2.2" fill={color} opacity="0.9"/>
        <path d="M15 34 Q24 40 33 34" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    stan:(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#0a0a1a"/><stop offset="100%" stopColor="#040408"/></radialGradient></defs>
        <rect x="18" y="41" width="12" height="5" rx="2" fill="#08080f" stroke={color} strokeWidth="0.6" opacity="0.7"/>
        <path d="M6 37 L6 18 L11 11 L37 11 L42 18 L42 37 Q42 44 24 44 Q6 44 6 37Z" fill={`url(#${id})`} stroke={color} strokeWidth="1.3"/>
        <rect x="6" y="18" width="36" height="5" rx="1" fill="#0a0a18" stroke={color} strokeWidth="0.8"/>
        <rect x="1" y="19" width="5" height="15" rx="2" fill="#0a0a18" stroke={color} strokeWidth="1.2"/>
        <rect x="42" y="19" width="5" height="15" rx="2" fill="#0a0a18" stroke={color} strokeWidth="1.2"/>
        <rect x="10" y="25" width="12" height="8" rx="2" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2"/>
        <rect x="26" y="25" width="12" height="8" rx="2" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2"/>
        <rect x="13" y="27.5" width="6" height="3" rx="1.5" fill={color} opacity="0.9"/>
        <rect x="29" y="27.5" width="6" height="3" rx="1.5" fill={color} opacity="0.9"/>
        <rect x="16" y="37" width="16" height="2.5" rx="1.2" fill={color} opacity="0.4"/>
      </svg>
    ),
    "ARB-7":(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#001a2a"/><stop offset="100%" stopColor="#00060a"/></radialGradient></defs>
        <rect x="8" y="10" width="32" height="32" rx="6" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <rect x="3" y="20" width="5" height="12" rx="2" fill="#001018" stroke={color} strokeWidth="1"/>
        <rect x="40" y="20" width="5" height="12" rx="2" fill="#001018" stroke={color} strokeWidth="1"/>
        <rect x="12" y="22" width="8" height="5" rx="1" fill={color} opacity="0.2" stroke={color} strokeWidth="0.8"/>
        <rect x="28" y="22" width="8" height="5" rx="1" fill={color} opacity="0.2" stroke={color} strokeWidth="0.8"/>
        <rect x="14" y="23.5" width="4" height="2" rx="1" fill={color}/>
        <rect x="30" y="23.5" width="4" height="2" rx="1" fill={color}/>
        <path d="M15 33 Q24 37 33 33" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    "TREND-9":(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#1a0a2a"/><stop offset="100%" stopColor="#06040a"/></radialGradient></defs>
        <ellipse cx="24" cy="26" rx="18" ry="18" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <ellipse cx="17" cy="22" rx="4" ry="3" fill={color} opacity="0.2" stroke={color} strokeWidth="1"/>
        <ellipse cx="31" cy="22" rx="4" ry="3" fill={color} opacity="0.2" stroke={color} strokeWidth="1"/>
        <ellipse cx="17" cy="22" rx="2" ry="1.5" fill={color}/>
        <ellipse cx="31" cy="22" rx="2" ry="1.5" fill={color}/>
        <path d="M13 30 L17 27 L21 31 L26 25 L31 29 L35 26" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    "SENT-3":(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#2a0a1a"/><stop offset="100%" stopColor="#0a0408"/></radialGradient></defs>
        <path d="M24 6 L38 14 L38 34 L24 42 L10 34 L10 14 Z" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <circle cx="18" cy="22" r="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <circle cx="30" cy="22" r="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <circle cx="18" cy="22" r="2" fill={color}/>
        <circle cx="30" cy="22" r="2" fill={color}/>
        <path d="M15 31 Q24 37 33 31" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    "RISK-1":(
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#2a1a0a"/><stop offset="100%" stopColor="#0a0600"/></radialGradient></defs>
        <path d="M24 8 L40 38 L8 38 Z" fill={`url(#${id})`} stroke={color} strokeWidth="1.2"/>
        <circle cx="19" cy="28" r="3.5" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <circle cx="29" cy="28" r="3.5" fill={color} opacity="0.15" stroke={color} strokeWidth="1"/>
        <circle cx="19" cy="28" r="1.8" fill={color}/>
        <circle cx="29" cy="28" r="1.8" fill={color}/>
        <line x1="24" y1="14" x2="24" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="1.5" fill={color}/>
      </svg>
    ),
  };
  const face = faces[agentId] || faces["news"];
  return (
    <div style={{ width:size,height:size,borderRadius:"10px",background:`linear-gradient(135deg,${color}22,#050508)`,border:`1px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:isActive?`0 0 16px ${color}77,inset 0 0 8px ${color}22`:`inset 0 0 4px ${color}11`,transition:"box-shadow 0.3s",flexShrink:0,overflow:"hidden" }}>
      {face}
    </div>
  );
};

// ── Live Market Data (CoinGecko simple price) ─────────────────
const COINGECKO_IDS = {
  BTC:"bitcoin", ETH:"ethereum", SOL:"solana", BNB:"binancecoin",
  XRP:"ripple", DOGE:"dogecoin", ADA:"cardano", AVAX:"avalanche-2",
};

let lastKnownMarketData = { price: 77000, change24h: -0.68 };

const getMarketData = async (asset) => {
  const symbolMap = {
    BTC: "BTCUSDT", ETH: "ETHUSDT", XRP: "XRPUSDT", SOL: "SOLUSDT",
    ADA: "ADAUSDT", BNB: "BNBUSDT", DOGE: "DOGEUSDT", AVAX: "AVAXUSDT",
    bitcoin: "BTCUSDT", ethereum: "ETHUSDT", ripple: "XRPUSDT",
    solana: "SOLUSDT", cardano: "ADAUSDT", binancecoin: "BNBUSDT",
    dogecoin: "DOGEUSDT", "avalanche-2": "AVAXUSDT"
  };

  const cgIdMap = {
    BTC: "bitcoin", ETH: "ethereum", XRP: "ripple", SOL: "solana",
    ADA: "cardano", BNB: "binancecoin", DOGE: "dogecoin", AVAX: "avalanche-2"
  };

  const fetchWithTimeout = (url, ms = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal, cache: "no-store" })
      .finally(() => clearTimeout(timer));
  };

  const isValid = (v) => typeof v === "number" && isFinite(v) && !isNaN(v);

  // ── /api/market (server-side proxy — BTC only) ──────────────────
  try {
    const upperAsset = asset.toUpperCase();
    if (upperAsset === "BTC" || upperAsset === "BITCOIN") {
      const res = await fetchWithTimeout("/api/market");
      if (!res.ok) throw new Error(`/api/market HTTP ${res.status}`);
      const data = await res.json();
      const price = parseFloat(data?.price);
      const change24h = parseFloat(data?.change24h);
      if (!isValid(price) || !isValid(change24h)) throw new Error("/api/market invalid values");
      // Sanity check — cross-validate proxy price against Binance
      try {
        const bRes = await fetchWithTimeout("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", 4000);
        if (bRes.ok) {
          const bData = await bRes.json();
          const bPrice = parseFloat(bData?.price);
          if (isValid(bPrice)) {
            const diff = Math.abs(price - bPrice) / bPrice;
            if (diff > 0.15) {
              // Proxy price is >15% off — skip it and fall through to live sources
              throw new Error(`Proxy price ${price} diverges from Binance ${bPrice} by ${(diff*100).toFixed(1)}%`);
            }
          }
        }
      } catch (sanityErr) {
        if (sanityErr.message.includes("diverges")) throw sanityErr;
        // Binance check failed — trust proxy anyway
      }
      lastKnownMarketData = { price, change24h };
      return { price, change24h };
    }
  } catch (apiErr) {}

  // ── CoinGecko direct (browser fallback) ───────────────────────
  try {
    const cgId = cgIdMap[asset.toUpperCase()] || "bitcoin";
    const res = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true`
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const data = await res.json();
    const price = parseFloat(data?.[cgId]?.usd);
    const change24h = parseFloat(data?.[cgId]?.usd_24h_change);
    if (!isValid(price) || !isValid(change24h)) throw new Error("CoinGecko invalid values");
    lastKnownMarketData = { price, change24h };
    return { price, change24h };
  } catch (cgErr) {}

  // ── Binance direct (browser fallback) ─────────────────────────
  try {
    const symbol = symbolMap[asset.toUpperCase()] || "BTCUSDT";
    const res = await fetchWithTimeout(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );
    if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
    const data = await res.json();
    const price = parseFloat(data?.lastPrice);
    const change24h = parseFloat(data?.priceChangePercent);
    if (!isValid(price) || !isValid(change24h)) throw new Error("Binance invalid values");
    lastKnownMarketData = { price, change24h };
    return { price, change24h };
  } catch (binErr) {}

  // ── Last known (safety net) ────────────────────────────────────
  const basePriceKey = Object.keys(BASE_PRICES).find(k => k.startsWith(asset.toUpperCase())) || "BTC/USDT";
  const basePrice = BASE_PRICES[basePriceKey] || 77000;
  return { price: basePrice, change24h: lastKnownMarketData.change24h };
};

// ── Frontend agent logic ──────────────────────────────────────
function runNova(market, coin) {
  const chg = market.change24h;
  const signal = chg > 2 ? "BUY" : chg < -2 ? "SELL" : "HOLD";
  const confidence = Math.min(95, Math.round(55 + Math.abs(chg) * 1.5));
  const reasoning =
    `NOVA — News Analyst\nLIVE DATA\n\nCoin: ${coin} | Price: $${market.price.toLocaleString("en-US", {maximumFractionDigits:0})}\n\n` +
    `Momentum reading: ${chg > 2 ? "strong positive — macro flows constructive, institutional buying signals present" : chg < -2 ? "negative — macro headwinds, institutional caution warranted" : "neutral — no strong directional signal from macro data"}. ` +
    `24h price action of ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}% ${Math.abs(chg) > 5 ? "represents a significant move — high conviction signal" : Math.abs(chg) > 2 ? "shows directional intent" : "remains within normal range"}.\n\nDecision: ${signal}`;
  return { agent: "NOVA", signal, confidence, reasoning };
}

function runAxiom(market, coin) {
  const chg = market.change24h;
  const signal = chg > 0 ? "BUY" : "SELL";
  const rsiBase = Math.max(18, Math.min(82, Math.round(50 + chg * 1.8)));
  const confidence = Math.min(95, Math.round(60 + Math.abs(rsiBase - 50) * 0.6));
  const trend = chg > 2 ? "UPTREND" : chg < -2 ? "DOWNTREND" : "SIDEWAYS";
  const reasoning =
    `AXIOM — Tech Analyst\nLIVE DATA\n\nCoin: ${coin} | Price: $${market.price.toLocaleString("en-US", {maximumFractionDigits:0})}\n\n` +
    `Price action shows ${trend.toLowerCase()}. RSI estimated at ${rsiBase} — ${rsiBase > 68 ? "overbought, expect cooling or reversal" : rsiBase < 32 ? "oversold, mean reversion likely" : "neutral territory"}. ` +
    `Trend bias is ${chg > 0 ? "long — higher lows forming, momentum with buyers" : "short — lower highs forming, sellers in control"}.\n\nDecision: ${signal}`;
  return { agent: "AXIOM", signal, confidence, reasoning };
}

function runPulse(market, coin) {
  const chg = market.change24h;
  const signal = chg > 0 ? "BULLISH" : "BEARISH";
  const confidence = Math.min(95, Math.round(50 + Math.abs(chg) * 2));
  const reasoning =
    `PULSE — Sentiment Scout\nLIVE DATA\n\nCoin: ${coin} | Price: $${market.price.toLocaleString("en-US", {maximumFractionDigits:0})}\n\n` +
    `Market sentiment reading: **${signal}**. ` +
    `The 24h move of ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}% signals ${chg > 0 ? "positive crowd psychology — retail participation increasing, FOMO building" : "negative crowd sentiment — fear dominating, panic selling risk elevated"}. ` +
    `Positioning appears ${Math.abs(chg) > 5 ? "extreme — contrarian signals warranted" : "moderate — trend likely to continue short-term"}.\n\nDecision: ${signal}`;
  return { agent: "PULSE", signal, confidence, reasoning };
}

function runAegis(market, coin) {
  const chg = market.change24h;
  const riskLevel = Math.abs(chg) > 5 ? "HIGH" : "LOW";
  const signal = riskLevel === "HIGH" ? "HOLD" : chg < -5 ? "SELL" : "HOLD";
  const confidence = Math.min(95, Math.round(65 - (riskLevel === "HIGH" ? 10 : -5)));
  const reasoning =
    `AEGIS — Risk Manager\nLIVE DATA\n\nCoin: ${coin} | Price: $${market.price.toLocaleString("en-US", {maximumFractionDigits:0})}\n\n` +
    `Volatility assessment: **${riskLevel} RISK**. ` +
    `A 24h swing of ${Math.abs(chg).toFixed(2)}% ${riskLevel === "HIGH" ? "exceeds normal thresholds — reduce position size, widen stops" : "is within manageable range for standard position sizing"}. ` +
    `Risk/reward ratio is ${riskLevel === "HIGH" ? "unfavourable at current volatility levels — patience is the edge" : "acceptable — proceed with defined risk parameters"}.\n\nDecision: ${signal}`;
  return { agent: "AEGIS", signal, confidence, reasoning };
}

function runAgentEngine(agents, market, coin) {
  const agentRunners = { news: runNova, technical: runAxiom, sentiment: runPulse, risk: runAegis };
  const results = {};

  // Run NOVA, AXIOM, PULSE, AEGIS
  agents.forEach(agent => {
    if (!agentRunners[agent.id]) return;
    const r = agentRunners[agent.id](market, coin);
    results[agent.id] = {
      agent: r.agent,
      signal: r.signal,
      confidence: r.confidence,
      decision: r.signal,
      text: r.reasoning,
    };
  });

  // ROGUE — contrarian of the 24h trend
  const chg = market.change24h;
  const rogueSignal = chg > 0 ? "SELL" : "BUY";
  const rogueConf = Math.min(95, Math.round(45 + Math.abs(chg) * 0.8));
  const timestamp = new Date().toLocaleString("en-GB", { dateStyle:"short", timeStyle:"medium" });
  results["devil"] = {
    agent: "ROGUE",
    signal: rogueSignal,
    confidence: rogueConf,
    decision: rogueSignal,
    text:
      `ROGUE — Devil's Advocate\nLIVE DATA · ${timestamp}\n\nCoin: ${coin} | Price: $${market.price.toLocaleString("en-US", {maximumFractionDigits:0})}\n\n` +
      (chg > 0
        ? `Everyone sees ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}% and screams buy — I see a crowded trade about to reverse. When the last bear capitulates, who is left to buy? Late-cycle FOMO volume is the classic distribution sign.`
        : `Panic selling ${chg.toFixed(2)}% — classic capitulation territory. The smart money accumulates when maximum fear is present. Everyone calling for lower lows is already short — who is left to sell?`) +
      `\n\nDecision: ${rogueSignal}`,
  };

  // VERDICT — majority vote across NOVA, AXIOM, PULSE, AEGIS, ROGUE
  const voteIds = ["news", "technical", "sentiment", "risk", "devil"];
  const votes = { BUY:0, SELL:0, HOLD:0 };
  let totalConf = 0;
  voteIds.forEach(id => {
    const r = results[id];
    if (!r) return;
    const dec = r.decision;
    if (dec === "BULLISH") votes.BUY++;
    else if (dec === "BEARISH") votes.SELL++;
    else if (votes[dec] !== undefined) votes[dec]++;
    totalConf += r.confidence;
  });
  const avgConf = Math.round(totalConf / voteIds.length);
  let verdictSignal = votes.BUY > votes.SELL && votes.BUY > votes.HOLD ? "BUY"
    : votes.SELL > votes.BUY && votes.SELL > votes.HOLD ? "SELL" : "HOLD";
  if (votes.BUY === votes.SELL) verdictSignal = chg > 0 ? "BUY" : chg < 0 ? "SELL" : "HOLD";
  results["judge"] = {
    agent: "VERDICT",
    signal: verdictSignal,
    confidence: avgConf,
    decision: verdictSignal,
    text:
      `VERDICT — Chief Strategist\nLIVE DATA · ${timestamp}\n\nCoin: ${coin} | Price: $${market.price.toLocaleString("en-US", {maximumFractionDigits:0})}\n\n` +
      `Council vote: **BUY ${votes.BUY} · SELL ${votes.SELL} · HOLD ${votes.HOLD}** | Avg confidence: ${avgConf}%. ` +
      `The majority of agents signal ${verdictSignal} at the current price. ` +
      `${chg > 0 ? "Trend is supportive and momentum is with the bulls." : chg < 0 ? "Trend is against buyers — risk management is critical." : "No clear directional edge — patience is the play."} ` +
      `⛔ Not financial advice — always manage your own risk.\n\nDecision: ${verdictSignal}`,
  };

  return results;
}

// ── Live Dashboard ────────────────────────────────────────────
function LiveDashboard() {
  const marketCtx = useContext(MarketContext);

  // Derive seed prices: BTC from live context, others from fixed ratios
  const getSeedPrices = () => {
    const btc = (marketCtx.price && marketCtx.feedMode !== "loading") ? marketCtx.price : BASE_PRICES["BTC/USDT"];
    const ratio = btc / BASE_PRICES["BTC/USDT"];
    const p = {};
    DASHBOARD_PAIRS.forEach(pair => { p[pair] = BASE_PRICES[pair] * ratio; });
    return p;
  };

  const [prices, setPrices] = useState(getSeedPrices);
  const [changes, setChanges] = useState(() => {
    const c={};DASHBOARD_PAIRS.forEach(pair=>{c[pair]=0;}); return c;
  });
  const [selectedAgent, setSelectedAgent] = useState("ARB-7");
  const [agentStatuses, setAgentStatuses] = useState({ "ARB-7":"SCANNING","TREND-9":"ANALYSING","SENT-3":"MONITORING","RISK-1":"WATCHING" });
  const [pnl, setPnl] = useState(0);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const livePriceRef = useRef(null); // always holds latest live BTC price, readable inside intervals

  // Keep livePriceRef current — avoids stale closure in priceInt
  useEffect(() => { livePriceRef.current = marketCtx.price || null; }, [marketCtx.price]);

  // Snap BTC price to live context value whenever it updates
  useEffect(() => {
    if (!marketCtx.price || marketCtx.feedMode === "loading") return;
    const btc = marketCtx.price;
    const ratio = btc / BASE_PRICES["BTC/USDT"];
    setPrices(prev => {
      const next = { ...prev };
      next["BTC/USDT"] = btc;
      // Snap other pairs to maintain realistic ratios relative to their base
      DASHBOARD_PAIRS.filter(p => p !== "BTC/USDT").forEach(pair => {
        next[pair] = BASE_PRICES[pair] * ratio;
      });
      return next;
    });
  }, [marketCtx.price, marketCtx.feedMode]);

  const fmtPrice = (p,pair) => {
    if (pair==="BTC/USDT") return Math.round(p).toLocaleString("en-US");
    if (p>100) return p.toFixed(2);
    return p.toFixed(4);
  };
  const fmtTime = () => new Date().toTimeString().slice(0,8);

  useEffect(()=>{
    const priceInt = setInterval(()=>{
      setPrices(prev=>{
        const next={};const nextChg={};
        const liveBtc = livePriceRef.current;
        DASHBOARD_PAIRS.forEach(pair=>{
          const vol=pair==="BTC/USDT"?0.003:pair==="ETH/USDT"?0.004:0.008;
          const chg=(Math.random()-0.49)*vol;
          // Anchor BTC to live context price on every tick — prevents stale base drift
          const base = (pair==="BTC/USDT" && liveBtc) ? liveBtc : prev[pair];
          next[pair]=base*(1+chg);
          nextChg[pair]=chg;
        });
        setChanges(nextChg);
        return next;
      });
    },1200);
    const pnlInt = setInterval(()=>{ setPnl(p=>+(p+(Math.random()-0.47)*12).toFixed(2)); },1800);
    const logMsgs=[(a,p)=>`${a} detected momentum shift on ${p}`,(a,p)=>`${a} scanning order book for ${p}`,(a,p)=>`${a} confirmed breakout on ${p}`,(a,p)=>`${a} social spike detected — ${p}`,(a,p)=>`${a} volatility threshold crossed — ${p}`,(a,p)=>`${a} risk params updated for ${p}`,(a,p)=>`${a} arbitrage window found — ${p}`,(a,p)=>`${a} trend continuation signal — ${p}`];
    const logInt = setInterval(()=>{
      const agent=DASHBOARD_AGENTS[Math.floor(Math.random()*DASHBOARD_AGENTS.length)];
      const pair=DASHBOARD_PAIRS[Math.floor(Math.random()*DASHBOARD_PAIRS.length)];
      const msg=logMsgs[Math.floor(Math.random()*logMsgs.length)](agent.name,pair);
      setLogs(prev=>[{id:Date.now(),time:fmtTime(),agent:agent.name,color:agent.color,msg},...prev].slice(0,40));
    },2200);
    const orderInt = setInterval(()=>{
      const agent=DASHBOARD_AGENTS[Math.floor(Math.random()*DASHBOARD_AGENTS.length)];
      const pair=DASHBOARD_PAIRS[Math.floor(Math.random()*DASHBOARD_PAIRS.length)];
      const side=Math.random()>0.5?"BUY":"SELL";
      const size=[0.01,0.05,0.1,0.25,0.5,1.0][Math.floor(Math.random()*6)];
      setOrders(prev=>[{id:Date.now(),time:fmtTime(),agent:agent.name,agentColor:agent.color,pair,side,size},...prev].slice(0,12));
    },3500);
    const statusLabels=["SCANNING","ANALYSING","MONITORING","EXECUTING","HOLDING","WATCHING","COMPUTING"];
    const statusInt = setInterval(()=>{
      const agent=DASHBOARD_AGENTS[Math.floor(Math.random()*DASHBOARD_AGENTS.length)];
      setAgentStatuses(prev=>({...prev,[agent.id]:statusLabels[Math.floor(Math.random()*statusLabels.length)]}));
    },2800);
    return ()=>{clearInterval(priceInt);clearInterval(pnlInt);clearInterval(logInt);clearInterval(orderInt);clearInterval(statusInt);};
  },[]);

  const pnlColor=pnl>=0?"#4ade80":"#f87171";
  const selAgent=DASHBOARD_AGENTS.find(a=>a.id===selectedAgent);

  return (
    <div style={{padding:"16px"}}>
      <style>{`@keyframes dashPulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Price tickers — 5 col grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
        {DASHBOARD_PAIRS.map(pair=>{
          const chg=changes[pair]||0; const isUp=chg>=0;
          return (
            <div key={pair} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${isUp?"rgba(74,222,128,0.3)":"rgba(248,113,113,0.3)"}`,borderRadius:8,padding:"10px 8px",minWidth:0}}>
              <div style={{fontSize:9,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pair}</div>
              <div style={{fontSize:12,fontWeight:700,color:isUp?"#4ade80":"#f87171",fontFamily:"monospace",whiteSpace:"nowrap"}}>${fmtPrice(prices[pair],pair)}</div>
              <div style={{fontSize:9,color:isUp?"#4ade80":"#f87171",marginTop:2}}>{isUp?"▲":"▼"} {Math.abs((chg*100)).toFixed(3)}%</div>
            </div>
          );
        })}
      </div>

      {/* P&L + Agent selector + Status */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"12px 10px",textAlign:"center"}}>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:"0.15em",marginBottom:6}}>NET P&L (USD)</div>
          <div style={{fontSize:20,fontWeight:900,color:pnlColor,fontFamily:"monospace"}}>{pnl>=0?"+":""}{pnl.toFixed(2)}</div>
          <div style={{fontSize:9,color:"#64748b",marginTop:4}}>LIVE MARKET DATA</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px"}}>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:"0.15em",marginBottom:8}}>SELECT AGENT</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {DASHBOARD_AGENTS.map(agent=>(
              <button key={agent.id} onClick={()=>setSelectedAgent(agent.id)} style={{padding:"7px 8px",borderRadius:6,border:"1px solid",borderColor:selectedAgent===agent.id?agent.color:"rgba(255,255,255,0.08)",background:selectedAgent===agent.id?`${agent.color}18`:"transparent",color:selectedAgent===agent.id?agent.color:"#94a3b8",fontFamily:"inherit",fontSize:10,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:agent.color,flexShrink:0}}/>{agent.id}
              </button>
            ))}
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${selAgent?.color}33`,borderRadius:8,padding:"10px",textAlign:"center"}}>
          <RobotFace agentId={selectedAgent} color={selAgent?.color||"#00d4ff"} size={38} isActive={true}/>
          <div style={{fontSize:9,color:selAgent?.color,letterSpacing:"0.1em",marginTop:5,fontWeight:700}}>{selectedAgent}</div>
          <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>{selAgent?.label}</div>
          <div style={{fontSize:9,color:selAgent?.color,marginTop:5,fontWeight:700}}>⬡ {agentStatuses[selectedAgent]}</div>
        </div>
      </div>

      {/* Orders + Log */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"12px"}}>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:"0.15em",marginBottom:8}}>RECENT ORDERS</div>
          <div style={{maxHeight:180,overflow:"hidden"}}>
            {orders.length===0&&<div style={{fontSize:11,color:"#64748b"}}>Awaiting orders...</div>}
            {orders.map(o=>(
              <div key={o.id} style={{display:"flex",gap:5,fontSize:10,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",flexWrap:"nowrap",alignItems:"center"}}>
                <span style={{color:"#64748b",fontFamily:"monospace",flexShrink:0,fontSize:9}}>{o.time}</span>
                <span style={{color:o.agentColor,fontWeight:700,flexShrink:0}}>{o.agent}</span>
                <span style={{color:o.side==="BUY"?"#4ade80":"#f87171",fontWeight:700,flexShrink:0}}>{o.side}</span>
                <span style={{color:"#cbd5e1",flexShrink:0,fontSize:9}}>{o.pair}</span>
                <span style={{color:"#94a3b8",fontSize:9}}>{o.size}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"12px"}}>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:"0.15em",marginBottom:8}}>AGENT ACTIVITY LOG</div>
          <div style={{maxHeight:180,overflowY:"auto"}}>
            {logs.length===0&&<div style={{fontSize:11,color:"#64748b"}}>Initialising agents...</div>}
            {logs.map(l=>(
              <div key={l.id} style={{fontSize:9,display:"flex",gap:5,borderBottom:"1px solid rgba(255,255,255,0.03)",paddingBottom:3,marginBottom:3,flexWrap:"nowrap"}}>
                <span style={{color:"#475569",fontFamily:"monospace",flexShrink:0}}>{l.time}</span>
                <span style={{color:l.color,fontWeight:700,flexShrink:0}}>[{l.agent}]</span>
                <span style={{color:"#cbd5e1",wordBreak:"break-all"}}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent status bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
        {DASHBOARD_AGENTS.map(agent=>(
          <div key={agent.id} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${agent.color}22`,borderRadius:6,padding:"7px 10px",display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:agent.color,boxShadow:`0 0 5px ${agent.color}`}}/>
            <div>
              <div style={{fontSize:9,color:agent.color,fontWeight:700}}>{agent.id}</div>
              <div style={{fontSize:8,color:"#94a3b8"}}>{agentStatuses[agent.id]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
// ── Bitcorum Radio ────────────────────────────────────────────
function BitcorumRadio({ btcPrice }) {
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioHeadline, setRadioHeadline] = useState("");
  const [radioTicker, setRadioTicker] = useState([]);
  const [listeners, setListeners] = useState(() => Math.floor(Math.random()*800)+1200);
  const [eqAnim, setEqAnim] = useState([0.4,0.7,0.9,0.5,0.8,0.6,1.0,0.3,0.75,0.55]);
  const playingRef = useRef(false);
  const eqRef = useRef(null);
  const headlineIdx = useRef(0);
  const gold = "#d4a300";

  const getHeadlines = () => [
    `Bitcoin is currently trading around $${btcPrice ? Math.round(btcPrice).toLocaleString("en-US") : "78,000"}. Council signals remain active.`,
    "Institutional accumulation continues. On-chain data shows whale wallets adding to positions across multiple exchanges.",
    "Ethereum network fees drop to multi-month lows as Layer 2 adoption accelerates across the ecosystem.",
    "Bitcoin dominance holds above 54 percent as altcoins consolidate ahead of the next macro catalyst.",
    "Solana decentralised exchange volume surpasses centralised rivals for the third consecutive week.",
    "Federal Reserve minutes signal no immediate rate cuts. Crypto markets are digesting the implications carefully.",
    "Lightning Network capacity hits a new all-time high. Bitcoin's payments layer is maturing rapidly.",
    "BlackRock Bitcoin ETF continues record inflows. Institutional demand shows no sign of slowing.",
    "Miners reporting healthy margins as difficulty adjusts post-halving. Hash rate is at record levels globally.",
    "On-chain analysts point to an accumulation phase. Long-term holder supply has reached a historical peak.",
    "The crypto fear and greed index moves into greed territory. Sentiment is shifting bullish across the market.",
    "MicroStrategy adds to its Bitcoin treasury position. The corporate adoption trend continues to strengthen.",
    "Avalanche ecosystem surges as new decentralised finance protocols launch on the network.",
    "Bitcoin futures open interest climbs. Derivatives markets are signalling growing conviction among traders.",
    "Global stablecoin supply expands. Liquidity conditions are improving for digital assets worldwide.",
    "You are listening to Bitcorum Radio, giving you all the latest crypto news from around the world. Tune in, stay informed, stay ahead.",
  ];

  const speakNext = useRef(null);
  const audioCtxRef = useRef(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const identPending = useRef(false);
  const identTimerRef = useRef(null);

  // Clean news-style jingle: BBC-style 3-pip intro then silence
  const playNewsJingle = (ctx, duration, onDone) => {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.22, now);
    master.connect(ctx.destination);
    // Three pips (1000Hz, classic news tone)
    [0, 0.5, 1.0].forEach((t) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 1000;
      g.gain.setValueAtTime(0, now + t);
      g.gain.linearRampToValueAtTime(0.8, now + t + 0.01);
      g.gain.setValueAtTime(0.8, now + t + 0.08);
      g.gain.linearRampToValueAtTime(0, now + t + 0.1);
      osc.connect(g); g.connect(master);
      osc.start(now + t); osc.stop(now + t + 0.12);
    });
    // Long pip
    const long = ctx.createOscillator();
    const longG = ctx.createGain();
    long.type = "sine"; long.frequency.value = 1000;
    longG.gain.setValueAtTime(0, now + 1.5);
    longG.gain.linearRampToValueAtTime(0.8, now + 1.51);
    longG.gain.setValueAtTime(0.8, now + 1.8);
    longG.gain.linearRampToValueAtTime(0, now + 1.82);
    long.connect(longG); longG.connect(master);
    long.start(now + 1.5); long.stop(now + 1.85);
    setTimeout(onDone, (duration + 2) * 1000);
  };

  speakNext.current = () => {
    if (!playingRef.current) return;

    // If ident is queued, play it now (between bulletins — no interruption)
    let line;
    if (identPending.current) {
      identPending.current = false;
      line = "You are listening to Bitcorum Radio, giving you all the latest crypto news from around the world. Tune in, stay informed, stay ahead.";
    } else {
      const headlines = getHeadlines();
      const idx = headlineIdx.current % headlines.length;
      line = headlines[idx];
      headlineIdx.current++;
    }
    setRadioHeadline(line);
    setRadioTicker(prev => [...prev.slice(-8), line]);
    setListeners(l => Math.max(1000, l + Math.floor((Math.random()-0.4)*7)));

    const ctx = audioCtxRef.current;
    const synth = window.speechSynthesis;

    // Try speechSynthesis — works on bitcorum.com, blocked in Claude preview
    if (synth && synth.getVoices().length > 0) {
      synth.cancel();
      const utt = new SpeechSynthesisUtterance(line);
      utt.rate = 0.88; utt.pitch = 0.96; utt.volume = 1; utt.lang = "en-US";
      const voices = synth.getVoices();
      const v = voices.find(v => /google.*us.*english/i.test(v.name))
             || voices.find(v => /google.*english/i.test(v.name))
             || voices.find(v => v.lang === "en-US")
             || voices.find(v => v.lang.startsWith("en"));
      if (v) utt.voice = v;
      let started = false;
      utt.onstart = () => { started = true; setSandboxMode(false); };
      utt.onend = () => { if (!playingRef.current) return; setTimeout(() => speakNext.current?.(), 800); };
      utt.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") return;
        if (!playingRef.current) return;
        setSandboxMode(true);
        const dur = Math.max(5, Math.round(line.split(" ").length * 0.45));
        if (ctx) playNewsJingle(ctx, dur, () => { if (playingRef.current) speakNext.current?.(); });
      };
      synth.speak(utt);
      // Detect sandbox: only fall back to jingle if speech truly never starts (give it longer, and never cut off speech that has already started)
      setTimeout(() => {
        if (!started && playingRef.current && !synth.speaking) {
          synth.cancel();
          setSandboxMode(true);
          const dur = Math.max(5, Math.round(line.split(" ").length * 0.45));
          if (ctx) playNewsJingle(ctx, dur, () => { if (playingRef.current) speakNext.current?.(); });
        }
      }, 2500);
    } else {
      // No voices available — jingle + text display only
      setSandboxMode(true);
      const dur = Math.max(5, Math.round(line.split(" ").length * 0.45));
      if (ctx) playNewsJingle(ctx, dur, () => { if (playingRef.current) speakNext.current?.(); });
      else setTimeout(() => { if (playingRef.current) speakNext.current?.(); }, dur * 1000);
    }
  };

  const startRadio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    playingRef.current = true;
    setRadioPlaying(true);
    const trySpeak = () => speakNext.current?.();
    if (window.speechSynthesis) {
      const v = window.speechSynthesis.getVoices();
      // Prime the speech engine with a silent warm-up utterance — fixes the first 2-3 headlines getting cut short on Chrome/Android
      try {
        const warmup = new SpeechSynthesisUtterance(" ");
        warmup.volume = 0;
        window.speechSynthesis.speak(warmup);
      } catch(e) {}
      if (v.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; setTimeout(trySpeak, 400); };
        setTimeout(trySpeak, 1200);
      } else { setTimeout(trySpeak, 400); }
    } else { trySpeak(); }
    // Queue station ident every 30 minutes — plays between bulletins, no interruption
    identTimerRef.current = setInterval(() => {
      identPending.current = true;
    }, 30 * 60 * 1000);

    eqRef.current = setInterval(() => {
      const speaking = window.speechSynthesis?.speaking ?? false;
      if (speaking) {
        setEqAnim([0.4,0.7,0.9,0.5,0.8,0.6,1.0,0.3,0.75,0.55].map(b =>
          Math.max(0.08, b + (Math.random()-0.5)*0.6)
        ));
      } else {
        setEqAnim([0.14,0.14,0.14,0.14,0.14,0.14,0.14,0.14,0.14,0.14]);
      }
    }, 180);
  };

  const stopRadio = () => {
    playingRef.current = false;
    setRadioPlaying(false);
    window.speechSynthesis?.cancel();
    clearInterval(eqRef.current);
    clearInterval(identTimerRef.current);
    identPending.current = false;
    try { audioCtxRef.current?.suspend(); } catch {}
  };

  useEffect(() => {
    return () => {
      playingRef.current = false;
      window.speechSynthesis?.cancel();
      clearInterval(eqRef.current);
      clearInterval(identTimerRef.current);
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, []);

  return (
    <div style={{margin:"0 16px 28px",boxSizing:"border-box"}} className="btc-section">
      {/* Outer radio chassis */}
      <div style={{background:"linear-gradient(160deg,#0a0a0f 0%,#0d0d18 60%,#080810 100%)",border:"2px solid rgba(212,163,0,0.5)",borderRadius:20,overflow:"hidden",boxShadow:"0 0 60px rgba(212,163,0,0.12), inset 0 1px 0 rgba(212,163,0,0.2)",position:"relative"}}>

        {/* Top gold strip */}
        <div style={{height:4,background:"linear-gradient(90deg,transparent,#d4a300,#fbbf24,#d4a300,transparent)"}}/>

        {/* Header band */}
        <div style={{padding:"14px 20px 10px",background:"linear-gradient(90deg,rgba(212,163,0,0.1),rgba(212,163,0,0.04))",borderBottom:"1px solid rgba(212,163,0,0.2)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Bitcorum B logo SVG — circuit board B */}
            <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#1a1206,#0d0d18)",border:"1px solid rgba(212,163,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 0 12px rgba(212,163,0,0.2)"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 4h8a4 4 0 0 1 4 4 3.5 3.5 0 0 1-1.5 2.9A3.8 3.8 0 0 1 18 14.5 4 4 0 0 1 14 18H6V4z" fill="none" stroke="#d4a300" strokeWidth="1.8"/>
                <path d="M6 11h7" stroke="#d4a300" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M4 4v16M4 4h2M4 12h2M4 20h2" stroke="rgba(212,163,0,0.4)" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="18" cy="8" r="1" fill="#fbbf24"/>
                <circle cx="18" cy="15" r="1" fill="#fbbf24"/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:900,color:"#d4a300",letterSpacing:"0.25em",lineHeight:1}}>BITCORUM</div>
              <div style={{fontSize:9,color:"#d4a300",letterSpacing:"0.3em",marginTop:2}}>RADIO</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:radioPlaying?"#4ade80":"#374151",boxShadow:radioPlaying?"0 0 10px #4ade80":"none",flexShrink:0}}/>
            <span style={{fontSize:9,fontWeight:700,color:radioPlaying?"#4ade80":"#4b5563",letterSpacing:"0.2em"}}>{radioPlaying?"LIVE ON AIR":"OFF AIR"}</span>
          </div>
        </div>

        {/* Frequency display panel */}
        <div style={{margin:"14px 16px 0",background:"rgba(0,0,0,0.6)",border:"1px solid rgba(212,163,0,0.25)",borderRadius:10,padding:"10px 14px",fontFamily:"monospace"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:8,color:"rgba(212,163,0,0.5)",letterSpacing:"0.2em"}}>SIGNAL</span>
            <span style={{fontSize:8,color:radioPlaying?"#4ade80":"#4b5563",letterSpacing:"0.15em"}}>{radioPlaying?"● BROADCASTING":"○ STANDBY"}</span>
          </div>
          {/* Equalizer bars */}
          <div style={{display:"flex",alignItems:"flex-end",gap:1,height:22,justifyContent:"center"}}>
            {(radioPlaying ? eqAnim : [0.15,0.1,0.12,0.08,0.1,0.09,0.11,0.07,0.1,0.08,0.09,0.1,0.08,0.11,0.09,0.1,0.08,0.12,0.1,0.09]).map((h,i)=>(
              <div key={i} style={{flex:1,borderRadius:1,background:radioPlaying?`linear-gradient(to top,#d4a300,#fbbf24,rgba(251,191,36,0.3))`:"rgba(212,163,0,0.15)",height:`${Math.max(3,h*22)}px`,transition:"height 0.15s ease"}}/>
            ))}
          </div>
        </div>

        {/* Now playing ticker */}
        {radioPlaying && radioHeadline && (
          <div style={{margin:"10px 16px 0",overflow:"hidden",background:"rgba(212,163,0,0.04)",border:"1px solid rgba(212,163,0,0.15)",borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:8,color:"#d4a300",letterSpacing:"0.25em",fontWeight:700,marginBottom:4}}>{sandboxMode?"📰 NOW BROADCASTING":"🔊 NOW PLAYING"}</div>
            <div style={{fontSize:11,color:"#e2e8f0",lineHeight:1.6,letterSpacing:"0.03em"}}>{radioHeadline}</div>
          </div>
        )}

        {/* Sandbox notice */}
        {sandboxMode && radioPlaying && (
          <div style={{margin:"8px 16px 0",padding:"7px 12px",background:"rgba(212,163,0,0.04)",border:"1px solid rgba(212,163,0,0.15)",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11}}>🔊</span>
            <span style={{fontSize:9,color:"rgba(212,163,0,0.65)",letterSpacing:"0.08em"}}>AI VOICE BROADCAST LIVE ON <span style={{color:"#d4a300",fontWeight:700}}>BITCORUM.COM</span></span>
          </div>
        )}

        {/* Main controls */}
        <div style={{padding:"14px 16px"}}>
          {/* Play/Pause button — styled as a physical dial button */}
          <button
            onClick={radioPlaying ? stopRadio : startRadio}
            style={{width:"100%",padding:"14px 20px",minHeight:52,borderRadius:12,background:radioPlaying?"linear-gradient(135deg,rgba(212,163,0,0.18),rgba(212,163,0,0.08))":"linear-gradient(135deg,rgba(212,163,0,0.22),rgba(212,163,0,0.06))",border:`2px solid rgba(212,163,0,${radioPlaying?0.7:0.45})`,color:"#d4a300",fontFamily:"inherit",fontSize:12,fontWeight:900,letterSpacing:"0.25em",cursor:"pointer",boxShadow:radioPlaying?"0 0 30px rgba(212,163,0,0.25), inset 0 1px 0 rgba(212,163,0,0.2)":"0 0 12px rgba(212,163,0,0.1)",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}
          >
            {radioPlaying ? (
              <><span style={{fontSize:16}}>⏸</span> PAUSE BROADCAST</>
            ) : (
              <><span style={{fontSize:16}}>▶</span> PLAY BITCORUM RADIO</>
            )}
          </button>
        </div>

        {/* Recent broadcasts */}
        {radioTicker.length > 0 && (
          <div style={{margin:"0 16px 14px",borderTop:"1px solid rgba(212,163,0,0.12)",paddingTop:10}}>
            <div style={{fontSize:8,color:"rgba(212,163,0,0.5)",letterSpacing:"0.25em",marginBottom:6}}>RECENT BROADCASTS</div>
            {radioTicker.slice(-3).reverse().map((h,i)=>(
              <div key={i} style={{fontSize:10,color:i===0?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.28)",lineHeight:1.5,borderLeft:`2px solid rgba(212,163,0,${i===0?0.5:0.12})`,paddingLeft:8,marginBottom:4}}>{h}</div>
            ))}
          </div>
        )}

        {/* Feature strip */}
        <div style={{borderTop:"1px solid rgba(212,163,0,0.2)",background:"rgba(212,163,0,0.04)",padding:"10px 16px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
          {[
            ["LIVE & REAL-TIME", <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 4.9a10 10 0 0 0 0 14.14M19.1 4.9a10 10 0 0 1 0 14.14M8.46 8.46a5 5 0 0 0 0 7.07M15.54 8.46a5 5 0 0 1 0 7.07"/><circle cx="12" cy="12" r="1.5" fill="#d4a300"/></svg>],
            ["AI HOSTED", <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.46V12"/><path d="M8 6a4 4 0 0 1 8 0"/><ellipse cx="12" cy="15" rx="7" ry="5"/><path d="M5 15c0 2.76 3.13 5 7 5s7-2.24 7-5"/><path d="M9 12v1M15 12v1"/></svg>],
            ["GLOBAL COVERAGE", <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>],
            ["CRYPTO NEWS", <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 8h5a2 2 0 0 1 0 4H9v4h5a2 2 0 0 0 0-4"/><path d="M9 8V6M15 8V6M9 16v2M15 16v2"/><circle cx="12" cy="12" r="10"/></svg>],
            ["TRUSTED SOURCES", <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 4v6c0 5-3.5 9.74-7 11C8.5 21.74 5 17 5 12V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>],
          ].map(([label, svgIcon])=>(
            <div key={label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:"1 1 50px"}}>
              {svgIcon}
              <span style={{fontSize:7,color:"rgba(212,163,0,0.6)",letterSpacing:"0.1em",textAlign:"center",fontWeight:700}}>{label}</span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div style={{padding:"8px 16px 14px",textAlign:"center"}}>
          <span style={{fontSize:9,color:"#d4a300",letterSpacing:"0.15em"}}>TUNE IN · STAY INFORMED · </span>
          <span style={{fontSize:9,color:"#d4a300",letterSpacing:"0.15em",fontWeight:700}}>STAY AHEAD</span>
        </div>

        {/* Bottom gold strip */}
        <div style={{height:3,background:"linear-gradient(90deg,transparent,#d4a300,#fbbf24,#d4a300,transparent)"}}/>
      </div>
    </div>
  );
}

export default function Bitcorum() {
  const [coin, setCoin] = useState("BTC");
  const [customCoin, setCustomCoin] = useState("");
  const [running, setRunning] = useState(false);
  const [agentOutputs, setAgentOutputs] = useState({});
  const [currentAgent, setCurrentAgent] = useState(null);
  const [finalVerdict, setFinalVerdict] = useState(null);
  const [done, setDone] = useState(false);
  const [paulQ, setPaulQ] = useState("");
  const [paulA, setPaulA] = useState("");
  const [paulLoading, setPaulLoading] = useState(false);
  const [paulThread, setPaulThread] = useState([]);
  const [paulReplyQ, setPaulReplyQ] = useState("");
  const paulBottomRef = useRef(null);

  // ── Supabase auth session ──
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });
    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogOut = async () => {
    await supabase.auth.signOut();
  };

  // ── Luna personalised greeting ──
  const LUNA_GREETINGS = [
    "Good to see you again","You're back. Let's get started","Ready for today's market insights",
    "Your dashboard is ready","Continue where you left off","Markets are moving. Let's dive in",
    "Fresh insights are waiting","Today's opportunities are unfolding","The council is ready with a new verdict",
    "Your AI agents are standing by","New market intelligence is available","Great to see you again",
    "Glad you're back","Back for more insights","Let's pick up where we left off",
    "Ready to explore today's markets","The Council Awaits","Your AI Agents Are Ready",
    "Today's Verdict Is In","Fresh Insights. Smarter Decisions","The Market Never Sleeps. Neither Do We",
    "Your Next Insight Starts Here","Your insights are ready","A new day. A new perspective",
    "Everything you need is waiting","Your edge starts here","Let's get to work",
    "The next move begins now","Stay ahead of the market","Knowledge is power. Let's begin",
    "The market is moving","See what's shaping the market today","Discover today's opportunities",
    "Track the trends that matter","Stay informed. Stay ahead","The next signal is waiting",
    "Your crypto command centre is ready","Navigate the market with confidence",
    "Good to see you","You're all set","Let's continue","Ready when you are",
    "Let's explore","Back in action","Time to dive in","Let's see what's new",
    "Where Insight Meets Action","Clarity In A Noisy Market","Smarter Insights. Better Decisions",
    "The Future Of Market Intelligence","Powered By AI. Driven By Insight",
    "See Beyond The Headlines","Your Gateway To Smarter Markets","Turning Data Into Decisions",
    "We've kept your seat ready","Your insights are waiting","Ready to see what's changed since your last visit",
    "Back for another look at the markets","Your dashboard is ready when you are",
    "The Council welcomes your return","The Council has prepared a fresh verdict for you",
    "Your seat at the Council awaits","The Council has been watching the markets",
    "A new verdict has been reached since your last visit","The Council is ready to share its latest findings",
    "The discussion continues","The Council chamber is open",
    "Your agents have been hard at work","Fresh insights have been prepared for you",
    "The agents have new intelligence to share","Your AI team is ready with today's analysis",
    "New signals have been detected","The agents are standing by",
    "Market intelligence is ready for review","Your personal AI analysts are online",
    "The markets have been busy","Exclusive insights are waiting for you",
    "Your next opportunity may already be unfolding","Let's see what today's data reveals",
    "Ahead of the crowd, as always","Your market advantage starts here",
    "Intelligence. Insight. Opportunity","The latest analysis is ready for your review",
    "The Bitcorum community is glad to see you again","Good to see you back at Bitcorum",
    "Bitcorum is ready when you are","Back at Bitcorum. Let's begin",
    "Your Bitcorum dashboard is ready","Thanks for returning to Bitcorum",
    "Another day, another insight at Bitcorum","Bitcorum has fresh insights waiting for you",
    "Your journey with Bitcorum continues","Bitcorum's AI agents have new insights for you",
    "Your Bitcorum agents are standing by","Bitcorum has analysed the latest market activity",
    "Fresh intelligence from Bitcorum is ready","Bitcorum has been watching the markets for you",
    "The Bitcorum AI team is ready with today's analysis","New signals have been detected by Bitcorum",
    "Bitcorum is ready to help you navigate today's markets","You're back — let's explore the markets together",
    "Another day, another opportunity","Your journey with Bitcorum continues here",
    "The Bitcorum Council has reached a new verdict","Your seat at the Bitcorum Council awaits",
    "The Bitcorum Council is in session","A fresh verdict from the Bitcorum Council is ready",
    "The Bitcorum Council has been reviewing the markets","See what the Bitcorum Council discovered today",
    "The latest Council insights are now available on Bitcorum","Bitcorum's Council has spoken",
    "Bitcorum Intelligence is ready for your review","You're back at Bitcorum. Let's explore what's new",
    "Bitcorum has missed you","Good to have you back in the Bitcorum community",
    "The conversation continues at Bitcorum","Bitcorum is better with you here",
    "Welcome back to the future of market intelligence. Welcome back to Bitcorum",
    "Bitcorum is ready for another day of discovery","Exclusive market insights await at Bitcorum",
    "Stay ahead with Bitcorum","Bitcorum is your edge in the market",
    "Your next insight starts with Bitcorum","See what Bitcorum uncovered today",
    "The market evolves. Bitcorum keeps you informed","Bitcorum is tracking what matters most",
    "Back at Bitcorum. Ahead of the Market","Bitcorum: Fresh Insights Await",
    "Bitcorum Is Ready. Are You","Back to Bitcorum. Back to Smarter Decisions",
    "Bitcorum Never Stops Watching the Markets","See Today's Opportunities with Bitcorum",
    "Bitcorum Has Been Busy Since Your Last Visit","Discover What's New at Bitcorum Today",
  ];
  const [lunaGreeting] = useState(() => LUNA_GREETINGS[Math.floor(Math.random()*LUNA_GREETINGS.length)]);
  const [localUsername] = useState(() => { try { return localStorage.getItem("bitcorum_username") || ""; } catch { return ""; } });
  const bitcorumUsername = session?.user?.user_metadata?.username || session?.user?.email?.split("@")[0] || localUsername;
  const [legalModal, setLegalModal] = useState(null);
  const [cookieConsent, setCookieConsent] = useState(() => {
    try { return localStorage.getItem("bitcorum_cookie_consent") || null; } catch { return null; }
  });
  const acceptCookies = () => {
    try { localStorage.setItem("bitcorum_cookie_consent", "accepted"); } catch(e) {}
    setCookieConsent("accepted");
  };
  const [lastBriefing, setLastBriefing] = useState(() => {
    try { const s = localStorage.getItem("bitcorum_last_briefing"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [lastBriefingPlaying, setLastBriefingPlaying] = useState(false);
  const [lastBriefingIdx, setLastBriefingIdx] = useState(-1);
  const [lastBriefingDone, setLastBriefingDone] = useState(false);
  const lastBriefingCancelRef = useRef(false);
  // ── Hourly Countdown state ──
  const [countdown, setCountdown]       = useState(3600);
  const [lockedCoin, setLockedCoin]     = useState(null);
  const [verdictFired, setVerdictFired] = useState(false);
  const countdownRef                    = useRef(null);
  // ── Luna Tour state ──
  const [lunaPlaying, setLunaPlaying]   = useState(false);
  const [lunaStep, setLunaStep]         = useState(-1);
  const [lunaDone, setLunaDone]         = useState(false);
  const lunaCancelRef                   = useRef(false);
  const [briefingPlaying, setBriefingPlaying] = useState(false);
  const [briefingIdx, setBriefingIdx]         = useState(-1);
  const [briefingDone, setBriefingDone]       = useState(false);
  const briefingCancelRef                     = useRef(false);
  const [gloggsOutput, setGloggsOutput] = useState("");
  const [gloggsLoading, setGloggsLoading] = useState(false);
  const [marvinOutput, setMarvinOutput] = useState("");
  const [marvinLoading, setMarvinLoading] = useState(false);
  const [stanQ, setStanQ] = useState("");
  const [stanOutput, setStanOutput] = useState("");
  const [stanLoading, setStanLoading] = useState(false);
  const [stanThread, setStanThread] = useState([]);
  const [stanReplyQ, setStanReplyQ] = useState("");
  const stanBottomRef = useRef(null);
  const [councilStatus, setCouncilStatus] = useState("");
  const [liveData, setLiveData] = useState(null);
  const [agents, setAgents] = useState(null);
  const [decision, setDecision] = useState(null);
  const [councilHistory, setCouncilHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bitcorum_history") || "[]"); } catch { return []; }
  });

  const activeCoin = customCoin.trim().toUpperCase() || coin;
  const verdictCardRef = useRef(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharedImage, setSharedImage] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secsAgo, setSecsAgo] = useState(0);
  const [priceFlash, setPriceFlash] = useState(null); // "up" | "down" | null
  const [feedMode, setFeedMode] = useState("loading"); // "live" | "fallback" | "stale" | "loading"
  const [marketSource, setMarketSource] = useState(null);
  const prevPriceRef = useRef(null);
  const marketCtxRef = useRef({ price: null, change24h: null, source: null, feedMode: "loading" });

  // "Updated Xs ago" counter — resets on every lastUpdated change
  useEffect(() => {
    if (!lastUpdated) return;
    setSecsAgo(0);
    const t = setInterval(() => setSecsAgo(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // Price flash on change — opacity/shadow only, no infinite transform
  useEffect(() => {
    if (btcPrice === null) return;
    if (prevPriceRef.current !== null && prevPriceRef.current !== btcPrice) {
      const dir = btcPrice > prevPriceRef.current ? "up" : "down";
      setPriceFlash(dir);
      const t = setTimeout(() => setPriceFlash(null), 500);
      prevPriceRef.current = btcPrice;
      return () => clearTimeout(t);
    }
    prevPriceRef.current = btcPrice;
  }, [btcPrice]);

  useEffect(() => {
    const fetchBtcPrice = async () => {
      const timedFetch = async (url, label) => {
        const t0 = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
          clearTimeout(timer);
          return res;
        } catch (err) {
          clearTimeout(timer);
          throw err;
        }
      };

      // ── Tier 1: /api/market (Vercel serverless — works in production) ──
      try {
        const res = await timedFetch("/api/market", "/api/market");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const price = parseFloat(data?.price);
        const change24h = parseFloat(data?.change24h);
        if (!isFinite(price) || isNaN(price)) throw new Error("Invalid price");
        const source = data.source || "coinbase";
        const isFallback = source === "coingecko" || source === "binance" || source === "coinbase_partial";
        const now = new Date();
        setBtcPrice(price);
        setChange24h(isFinite(change24h) && !isNaN(change24h) ? change24h : null);
        setLastUpdated(now);
        setMarketSource(source);
        setFeedMode(isFallback ? "fallback" : "live");
        marketCtxRef.current = { price, change24h: isFinite(change24h) ? change24h : 0, source, feedMode: isFallback ? "fallback" : "live" };
        return;
      } catch (err) {
      }

      // ── Tier 2: CoinGecko direct (works in browser when no CORS block) ──
      try {
        const res = await timedFetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
          "CoinGecko"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const price = parseFloat(data?.bitcoin?.usd);
        const change24h = parseFloat(data?.bitcoin?.usd_24h_change);
        if (!isFinite(price) || isNaN(price)) throw new Error("CoinGecko invalid price");
        const now = new Date();
        setBtcPrice(price);
        setChange24h(isFinite(change24h) && !isNaN(change24h) ? change24h : null);
        setLastUpdated(now);
        setMarketSource("coingecko");
        setFeedMode("fallback");
        return;
      } catch (err) {
      }

      // ── Tier 3: Binance direct ──
      try {
        const res = await timedFetch(
          "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT",
          "Binance"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const price = parseFloat(data?.lastPrice);
        const change24h = parseFloat(data?.priceChangePercent);
        if (!isFinite(price) || isNaN(price)) throw new Error("Binance invalid price");
        const now = new Date();
        setBtcPrice(price);
        setChange24h(isFinite(change24h) && !isNaN(change24h) ? change24h : null);
        setLastUpdated(now);
        setMarketSource("binance");
        setFeedMode("fallback");
        return;
      } catch (err) {
      }

      // ── All failed ──
      setFeedMode("stale");
    };

    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 20000);
    return () => clearInterval(interval);
  }, []);

  const shareVerdict = async () => {
    if (!verdictCardRef.current || shareLoading) return;
    setShareLoading(true);
    try {
      const h2c = await new Promise((resolve, reject) => {
        if (window.html2canvas) { resolve(window.html2canvas); return; }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        s.onload = () => resolve(window.html2canvas);
        s.onerror = reject;
        document.head.appendChild(s);
      });
      const canvas = await h2c(verdictCardRef.current, { backgroundColor: "#050816", scale: 2, useCORS: true });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to generate image");
      const file = new File([blob], `bitcorum-${activeCoin}-verdict.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${activeCoin} Council Verdict`,
          text: `Bitcorum AI Council ${activeCoin} verdict`,
          files: [file],
        });
        return;
      }
      setSharedImage(canvas.toDataURL("image/png"));
    } catch (err) {
    } finally {
      setShareLoading(false);
    }
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms));
  const randomDelay = (min, max) => new Promise(res => setTimeout(res, Math.floor(Math.random() * (max - min) + min)));

  // Scanning dots animation while council is running
  useEffect(() => {
    if (!running) return;
    let dots = 0;
    const interval = setInterval(() => {
      dots = (dots + 1) % 4;
      setCouncilStatus(prev => {
        if (prev.includes("IS ANALYSING") || prev.includes("FETCHING") || prev.includes("CONVENED") || prev.includes("ERROR") || prev.includes("DELIBERATING")) return prev;
        return "⬡ SCANNING" + ".".repeat(dots);
      });
    }, 400);
    return () => clearInterval(interval);
  }, [running]);

  // ── Hourly countdown ──────────────────────────────────────────
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Fire verdict automatically
          setVerdictFired(true);
          return 3600;
        }
        if (prev === 10) {
          // Lock coin at 10 seconds
          setLockedCoin(activeCoin);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [activeCoin]);

  useEffect(() => {
    if (verdictFired && !running) {
      setVerdictFired(false);
      setLockedCoin(null);
      conveneCouncil();
    }
  }, [verdictFired]);

  const conveneCouncil = async () => {
    setRunning(true);
    setDone(false);
    setAgentOutputs({});
    setFinalVerdict(null);
    setCurrentAgent(null);
    setAgents(null);
    setDecision(null);
    setCouncilStatus("⬡ SCANNING...");

    // Fetch live market data — falls back to context price if API unavailable
    let market;
    try {
      market = await getMarketData(activeCoin);
      if (!market?.price || !isFinite(market.price)) throw new Error("invalid market data");
    } catch (e) {
      const ctxPrice = marketCtxRef.current?.price;
      const ctxChange = marketCtxRef.current?.change24h;
      market = {
        price: ctxPrice || BASE_PRICES["BTC/USDT"],
        change24h: (ctxChange !== null && ctxChange !== undefined && isFinite(ctxChange)) ? ctxChange : 0,
      };
    }
    setLiveData({ price: market.price, change24h: market.change24h, volume24h: null, timestamp: new Date().toISOString() });

    // Run all agents against market data
    setCouncilStatus(`⬡ COUNCIL CONVENED · ANALYSING ${activeCoin}...`);
    const agentResults = runAgentEngine(TRADING_AGENTS, market, activeCoin);

    // Initial pause — lets SCANNING animation play before agents start
    setAgents({});
    setCurrentAgent(null);
    await randomDelay(1200, 1800);

    // Stream agents one-by-one
    for (const agent of TRADING_AGENTS) {
      setCurrentAgent(agent.id);
      setCouncilStatus(`⬡ ${agent.name} IS ANALYSING ${activeCoin}...`);
      await randomDelay(1400, 2200);

      const result = agentResults[agent.id];
      if (result) {
        setAgentOutputs(prev => ({ ...prev, [agent.id]: result.text }));
        setAgents(prev => ({ ...(prev || {}), [agent.id]: result }));
        if (agent.id === "judge") {
          setFinalVerdict(verdictStyle(result.text));
        }
      }
    }

    // Deliberation pause then final decision
    setCurrentAgent(null);
    setCouncilStatus("⬡ DELIBERATING...");
    const judgeResult = agentResults["judge"];
    const calculatedDecision = judgeResult ? judgeResult.decision : "HOLD";
    await randomDelay(1500, 2500);
    setDecision(calculatedDecision);

    setCouncilStatus("");
    setDone(true);
    setCurrentAgent(null);
    setRunning(false);

    // Save last hourly briefing
    try {
      const briefingData = { coin: activeCoin, timestamp: new Date().toISOString(), outputs: agentResults };
      localStorage.setItem("bitcorum_last_briefing", JSON.stringify(briefingData));
      setLastBriefing(briefingData);
    } catch(e) {}

    // Save to council history
    if (judgeResult) {
      const entry = {
        id: Date.now(),
        asset: activeCoin,
        timestamp: new Date().toISOString(),
        price: market.price,
        verdict: calculatedDecision,
        confidence: judgeResult.confidence,
        winningAgent: (() => {
          const voteIds = ["news","technical","sentiment","risk","devil"];
          const tally = {};
          voteIds.forEach(id => {
            const r = agentResults[id];
            if (!r) return;
            const dec = r.decision === "BULLISH" ? "BUY" : r.decision === "BEARISH" ? "SELL" : r.decision;
            if (!tally[dec]) tally[dec] = [];
            tally[dec].push(r.agent);
          });
          const winners = tally[calculatedDecision] || [];
          return winners[0] || "VERDICT";
        })(),
      };
      setCouncilHistory(prev => {
        const updated = [entry, ...prev].slice(0, 100);
        try { localStorage.setItem("bitcorum_history", JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
  };

  const askGloggs = () => {
    setGloggsLoading(true); setGloggsOutput("");
    setTimeout(() => {
      const fact = CRYPTO_FACTS[Math.floor(Math.random()*CRYPTO_FACTS.length)];
      setGloggsOutput(`Here's something not many people know...\n\n${fact}`);
      setGloggsLoading(false);
    }, 600);
  };

  const askMarvin = () => {
    setMarvinLoading(true); setMarvinOutput("");
    setTimeout(() => {
      setMarvinOutput(MINING_MACHINES);
      setMarvinLoading(false);
    }, 800);
  };

  const askStan = async () => {
    if (!stanQ.trim()) return;
    const userMsg = stanQ.trim();
    setStanLoading(true); setStanOutput(""); setStanThread([]);
    setStanThread([{role:"user", text:userMsg}]);
    await new Promise(r=>setTimeout(r,500));
    const q = userMsg.toLowerCase();
    const isNegative = q.includes("not ") || q.includes("still ") || q.includes("doesn't") || q.includes("don't") || q.includes("isn't") || q.includes("won't") || q.includes("cant") || q.includes("can't") || q.includes("never");
    const isVague = !!q.match(/^(i have a question|i need help|can you help|can i ask|can i have|help me|got a question|quick question|i need assistance|hi|hello|hey|hiya|what can you|do you help)[\s?.!*]*$/) || (q.trim().length < 25 && (q.includes('question') || q.includes('ask') || q.includes('help')) && !q.includes('my ') && !q.includes('the ') && !q.includes('is '));
    const isAck = !isNegative && (q.match(/^(ok|okay|alright|sure|will do|i will|i'll|sounds good|got it|on it|understood|noted|right|cool|yep|yup|yeah)\b/) || q.includes("i will do") || q.includes("will try") || q.includes("i'll try") || q.includes("going to") || q.includes("gonna"));
    const reply =
      isVague
        ? "Stan here — of course! Go ahead and describe your problem. The more detail you give me the faster I can sort it. What's going on? ⚡"
      : isAck
        ? "Good stuff — give it a go and let me know how you get on. I'm right here if you need me. ⚡"
      : !isNegative && (q.includes("thank") || q.includes("cheers") || q.includes("brilliant") || q.includes("perfect") || q.includes("great") || q.includes("sorted") || q.includes("fixed") || (q.includes("working") && !q.includes("not")))
        ? [
            "Brilliant — glad we got that sorted! Come back anytime something plays up. Happy mining! ⚡",
            "Nice one — happy to help! You know where I am if anything else comes up. ⚡",
            "Sorted! Always here if you need me. Good luck out there. ⚡",
            "Great stuff — glad that's fixed. Don't hesitate to come back if something else crops up. ⚡",
          ][Math.floor(Math.random()*4)]
      : q.includes("no") && (q.includes("thanks") || q.includes("help") || q.includes("fine") || q.includes("good"))
        ? "No problem at all. You know where to find me if anything else comes up. ⚡"
      : getStanOfflineResponse(userMsg);
    setStanOutput(reply);
    setStanThread([{role:"user",text:userMsg},{role:"stan",text:reply}]);
    setStanLoading(false);
    setTimeout(() => { if (stanBottomRef.current) { const el = stanBottomRef.current; const rect = el.getBoundingClientRect(); if (rect.bottom > window.innerHeight - 80) { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } } }, 100);
  };

  const sendStanReply = async () => {
    if (!stanReplyQ.trim() || stanLoading) return;
    const userMsg = stanReplyQ.trim();
    setStanReplyQ("");
    setStanLoading(true);
    setStanThread(prev => [...prev, {role:"user", text:userMsg}]);
    await new Promise(r => setTimeout(r, 600));
    const q = userMsg.toLowerCase();
    const isNegative = q.includes("not ") || q.includes("still ") || q.includes("doesn't") || q.includes("don't") || q.includes("isn't") || q.includes("won't") || q.includes("cant") || q.includes("can't") || q.includes("never");
    const isVague = !!q.match(/^(i have a question|i need help|can you help|can i ask|can i have|help me|got a question|quick question|i need assistance|hi|hello|hey|hiya|what can you|do you help)[\s?.!*]*$/) || (q.trim().length < 25 && (q.includes('question') || q.includes('ask') || q.includes('help')) && !q.includes('my ') && !q.includes('the ') && !q.includes('is '));
    const isAck = !isNegative && (q.match(/^(ok|okay|alright|sure|will do|i will|i'll|sounds good|got it|on it|understood|noted|right|cool|yep|yup|yeah)\b/) || q.includes("i will do") || q.includes("will try") || q.includes("i'll try") || q.includes("going to") || q.includes("gonna"));
    const reply =
      isVague
        ? "Go ahead — what's happening? Describe the problem and I'll get you sorted. ⚡"
      : isAck
        ? "Good stuff — give it a go and come back if you need me. ⚡"
      : !isNegative && (q.includes("thank") || q.includes("cheers") || q.includes("sorted") || q.includes("fixed") || q.includes("brilliant") || q.includes("perfect") || (q.includes("working") && !q.includes("not")))
        ? [
            "Brilliant — glad we got that sorted! You know where I am if anything else comes up. ⚡",
            "Nice one — always happy to help! ⚡",
            "Sorted! Come back anytime. ⚡",
            "Great — glad that's fixed. Good luck! ⚡",
          ][Math.floor(Math.random()*4)]
      : getStanOfflineResponse(userMsg);
    setStanThread(prev => [...prev, {role:"stan", text:reply}]);
    setStanLoading(false);
    setTimeout(() => { if (stanBottomRef.current) { const el = stanBottomRef.current; const rect = el.getBoundingClientRect(); if (rect.bottom > window.innerHeight - 80) { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } } }, 100);
  };

  function getStanOfflineResponse(q) {
    const lq = q.toLowerCase();

    // General "not working" / "broken" mining machine
    if ((lq.includes("miner") || lq.includes("machine") || lq.includes("mining")) && (lq.includes("not working") || lq.includes("broken") || lq.includes("won't work") || lq.includes("doesn't work") || lq.includes("stopped") || lq.includes("dead") || lq.includes("not start") || lq.includes("won't start") || lq.includes("no power") || lq.includes("problem") || lq.includes("issue") || lq.includes("help"))) {
      return `Stan here — let's get your miner sorted. ⚡\n\n**First things first — what is it doing?**\n\n• **No power at all** — check the power cable and PSU. Try a different socket. Check the PSU fan is spinning.\n• **Powers on but no hashrate** — check your pool settings in the web interface. Verify stratum URL, worker name and password.\n• **Web interface not loading** — find the IP on your router's device list. Try typing it directly into your browser. Default login: root/root.\n• **Overheating and shutting down** — clean dust filters, check all fans are spinning, improve airflow around the miner.\n• **Low hashrate** — check hash board status in the web interface. Red or missing boards need attention.\n• **Making loud noise** — a fan is failing. Check which fan and replace it.\n• **Connected but offline on pool** — double-check your stratum URL and port. Try the backup pool address.\n\n**What miner model do you have and what exactly is it doing (or not doing)?**`;
    }

    // Bitaxe specific
    if (lq.includes("bitaxe")) {
      if (lq.includes("setup") || lq.includes("set up") || lq.includes("configure") || lq.includes("start")) {
        return `Stan here — let's get your Bitaxe up and running.\n\n**Bitaxe Setup:**\n\n1. **Power on** — connect via USB-C power supply (5V/3A minimum).\n2. **Connect to WiFi** — on first boot, Bitaxe creates a hotspot called "Bitaxe". Connect to it from your phone or laptop.\n3. **Open AxeOS** — go to 192.168.4.1 in your browser. This is the Bitaxe web interface.\n4. **Enter your WiFi details** — so Bitaxe connects to your home network.\n5. **Set your pool** — go to Settings → Pool. Enter your pool stratum URL, port, and worker name.\n6. **For solo mining** — use Public Pool: stratum+tcp://public-pool.io:21496, worker: your BTC address.\n7. **For Braiins Pool** — stratum+tcp://stratum.braiins.com:3333, worker: username.workername.\n8. **Save and reboot** — Bitaxe will start hashing within a minute.\n\nWhat model Bitaxe do you have?`;
      }
      if (lq.includes("hot") || lq.includes("heat") || lq.includes("temp")) {
        return `Stan here — Bitaxe temperatures explained.\n\n**Normal operating temps:**\n• Bitaxe Ultra/Supra: 45-65°C on the ASIC chip is normal.\n• Above 75°C: too hot — check airflow.\n• Above 85°C: shut down immediately.\n\n**Cooling fixes:**\n1. Ensure airflow over the heatsink — a small 5V fan pointed at it helps enormously.\n2. Don't enclose it in a box without ventilation.\n3. Thermal paste between chip and heatsink — reapply if temps are creeping up.\n4. Reduce frequency in AxeOS Settings to lower heat output.\n\nWhat temperature is yours running at?`;
      }
      return `Stan here — let's sort your Bitaxe.\n\n**Common Bitaxe fixes:**\n\n• **Not hashing** — check pool settings in AxeOS. Verify stratum URL and worker name.\n• **WiFi not connecting** — reset to factory defaults, hold button for 5 seconds.\n• **AxeOS not loading** — find Bitaxe IP on your router's device list, use that IP directly.\n• **Low hashrate** — check temperature. If overheating, reduce frequency in Settings.\n• **Firmware update** — go to AxeOS → System → OTA Update for latest firmware.\n• **Braiins Pool setup** — stratum+tcp://stratum.braiins.com:3333\n• **Public Pool solo** — stratum+tcp://public-pool.io:21496\n\nWhat's the specific issue you're seeing?`;
    }

    // Antminer specific
    if (lq.includes("antminer") || lq.includes("s19") || lq.includes("s21") || lq.includes("bitmain")) {
      if (lq.includes("reset") || lq.includes("factory")) {
        return `Stan here — Antminer factory reset steps:\n\n1. Power on the miner and wait for it to fully boot (2-3 minutes).\n2. Find the IP address on your router's device list.\n3. Open the web interface in your browser.\n4. Go to **System → Factory Reset**.\n5. Confirm the reset — the miner will reboot.\n6. Reconfigure your pool settings after reset.\n\n**Alternative hardware reset:**\nHold the IP Report button on the control board for 10 seconds while powered on. Release when the light flashes. This resets network settings only.\n\nWhich model do you have?`;
      }
      if (lq.includes("web interface") || lq.includes("can't access") || lq.includes("cannot access") || lq.includes("ip")) {
        return `Stan here — can't access your Antminer web interface?\n\n1. **Find the IP** — check your router's connected devices list. Look for "Antminer" or an unknown device.\n2. **Use IP Reporter** — download Bitmain's IP Reporter tool (bitmain.com), run it, then press the IP Report button on the miner. It will show the IP.\n3. **Default IP** — if on a fresh network, try 192.168.1.1 or the default shown in your router.\n4. **Browser** — type the IP directly into your browser address bar. Use Chrome or Firefox.\n5. **Default login** — username: root, password: root.\n6. **Firewall** — make sure your PC and miner are on the same network/subnet.\n\nWhat happens when you try to access it?`;
      }
      return `Stan here — let's sort your Antminer.\n\n**Common fixes:**\n\n• **No hashrate** — check hash boards in the web interface. Red boards need reseating or repair.\n• **Overheating** — clean dust filters, check fans are all spinning, improve room airflow.\n• **Pool not connecting** — verify stratum URL, port and worker name. Try backup pool.\n• **High reject rate** — check your internet connection stability. Try a different pool server.\n• **Miner not found on network** — use Bitmain IP Reporter tool to find the IP address.\n• **Firmware update** — download from bitmain.com only. Flash via System → Upgrade.\n\nWhat model and what's the exact problem?`;
    }

    // Whatsminer specific
    if (lq.includes("whatsminer") || lq.includes("microbt") || lq.includes("m30") || lq.includes("m50") || lq.includes("m60")) {
      return `Stan here — let's sort your Whatsminer.\n\n**Common Whatsminer fixes:**\n\n• **Access web interface** — use VB Miner or BTMiner tool to find IP. Default login: admin/admin.\n• **Hash board issues** — check the Miner Status page. Red or missing boards need professional repair.\n• **Overheating** — Whatsminers run hot by design. Ensure strong airflow front to back. Clean fins monthly.\n• **Pool connection** — go to Miner Configuration → Pool Settings. Use official MicroBT pool list.\n• **Firmware** — download only from microbt.com. Flash via Upgrade page in web interface.\n• **Lost password** — hold the reset button for 10 seconds to restore factory defaults.\n\nWhat model and what's happening?`;
    }

    // Wallet recovery
    if (lq.includes("recover") || lq.includes("lost wallet") || lq.includes("lost access") || lq.includes("can't access") || lq.includes("cannot access") || lq.includes("access my wallet") || lq.includes("forgot password") || lq.includes("lost seed") || lq.includes("seed phrase") || lq.includes("private key") || lq.includes("restore wallet") || lq.includes("12 words") || lq.includes("24 words") || lq.includes("locked out") || lq.includes("locked out of")) {
      return `Stan here — let's work through this carefully.\n\n**Wallet recovery depends on what you still have:**\n\n1. **You have your seed phrase (12 or 24 words)** — you can fully restore your wallet. Download the official wallet app, select "Restore from seed" and enter your words in the exact order. Your funds will reappear once synced.\n\n2. **You have your private key** — import it into a compatible wallet. In Electrum: Wallet → Import → paste your private key.\n\n3. **You have the wallet.dat file** — for Bitcoin Core, copy wallet.dat into the data directory and resync.\n\n4. **You have nothing** — unfortunately there is no way to recover a crypto wallet without at least one of the above. Anyone claiming they can recover it for a fee is a scam. Do not pay anyone.\n\n**Popular wallet restore guides:**\n• Electrum: File → New/Restore → "I already have a seed"\n• Ledger: set up new device → Restore from recovery phrase\n• Trezor: Create new wallet → Recover wallet\n• Trust Wallet: + icon → Import wallet → enter seed phrase\n\nWhat do you still have access to?`;
    }

    // Scam / fraud
    if (lq.includes("scam") || lq.includes("fraud") || lq.includes("hack") || lq.includes("stolen") || lq.includes("phish") || lq.includes("rug pull") || lq.includes("rugpull")) {
      return `Stan here — this is serious, let's act fast.\n\n**Immediate steps if compromised:**\n\n1. **Move funds NOW** — if you still have access, send remaining funds to a completely new wallet immediately.\n2. **Revoke permissions** — go to revoke.cash (Ethereum) or equivalent for your chain. Revoke all suspicious approvals.\n3. **Secure everything** — change passwords on email, exchange accounts. Enable 2FA everywhere.\n4. **Don't interact with the attacker** — never send more funds to "recover" lost crypto. Always a secondary scam.\n5. **Report it:**\n   • UK: actionfraud.police.uk\n   • US: ic3.gov\n   • Exchange: report to their fraud team directly\n\n**Remember:** Crypto transactions are irreversible. Focus on securing what remains.\n\nWhat happened exactly?`;
    }

    // Stuck / pending transaction
    if (lq.includes("stuck") || lq.includes("pending") || lq.includes("unconfirmed") || lq.includes("not arrived") || lq.includes("not received") || lq.includes("transaction") || lq.includes("transfer")) {
      return `Stan here — let's track this down.\n\n**Stuck or pending transaction fixes:**\n\n1. **Check mempool.space** — paste your TXID (transaction ID) to see exactly where it is and the fee rate.\n2. **Low fee** — if fee is below current mempool rate it will sit until congestion clears or drop after ~2 weeks.\n3. **RBF — bump the fee** — if your wallet supports it (Electrum, Bitcoin Core): right-click transaction → Increase Fee. Pay a higher fee to push it through.\n4. **CPFP — Child Pays for Parent** — if you're the recipient, spend the unconfirmed output with a high-fee transaction to pull it through.\n5. **Exchange deposit** — most exchanges need 1-3 confirmations. Check mempool.space with your TXID to see confirmation count.\n6. **Wrong network** — if you sent to the wrong chain (e.g. ETH to BTC address), contact the exchange immediately. Some can recover this.\n\nDo you have the transaction ID (TXID)?`;
    }

    // Hardware wallet
    if (lq.includes("ledger") || lq.includes("trezor") || lq.includes("cold storage") || lq.includes("hardware wallet") || lq.includes("coldcard") || lq.includes("keepkey")) {
      return `Stan here — hardware wallet support.\n\n**Common fixes:**\n\n• **Device not recognised** — try a different USB cable (charge-only cables won't work — use a data cable). Try different USB port. Restart the companion app.\n• **Ledger "device is locked"** — enter PIN on the device itself first, then open Ledger Live.\n• **Firmware update stuck** — reconnect and retry. The device automatically recovers from failed updates.\n• **Lost PIN** — if you have your 24-word seed, factory reset the device and restore. Without seed = unrecoverable.\n• **New device setup** — only buy from official manufacturer. Seed phrase generated on-device, NEVER type it into any website or app.\n• **Ledger Live not syncing** — go to Settings → Clear Cache. Or try a different internet connection.\n• **Trezor Suite issues** — try the web version at trezor.io/start instead of the desktop app.\n\nWhat model and what's the specific issue?`;
    }

    // Exchange problems
    if (lq.includes("exchange") || lq.includes("binance") || lq.includes("coinbase") || lq.includes("kraken") || lq.includes("withdraw") || lq.includes("deposit") || lq.includes("kyc") || lq.includes("verify") || lq.includes("2fa") || lq.includes("two factor") || lq.includes("authenticator")) {
      return `Stan here — exchange support.\n\n**Common exchange fixes:**\n\n• **Withdrawal blocked / KYC required** — complete identity verification in account settings. Use clear photos of ID. Government ID + selfie usually required.\n• **2FA locked out** — use your backup codes (you should have saved these). If lost, contact exchange support with full account verification.\n• **Deposit not showing** — check the blockchain with your TXID. If confirmed on-chain but not in exchange, contact support with the TXID.\n• **Wrong network deposit** — contact exchange support immediately with TXID. Many exchanges can recover this for a fee.\n• **Account frozen** — respond to any emails from the exchange. Provide requested ID documents. Usually resolved within 24-72 hours.\n• **High withdrawal fees** — some networks are cheaper. ETH on Arbitrum is far cheaper than mainnet. Check if exchange supports Layer 2.\n• **Can't log in** — use "Forgot Password". If 2FA is also blocked, go through the exchange's official account recovery process.\n\nWhich exchange and what's the exact issue?`;
    }

    // Mining - overheating
    if (lq.includes("heat") || lq.includes("hot") || lq.includes("temperature") || lq.includes("overheat") || lq.includes("thermal") || lq.includes("fan")) {
      return `Stan here — let's cool this down.\n\n**Mining overheating fixes:**\n\n1. **Room temperature** — must be under 35°C (95°F). Ideal 15-25°C. Hot room = hot miner.\n2. **Fans** — manually spin each fan. Replace any that are stiff, noisy or not spinning. Antminer fans: search your model on Amazon.\n3. **Dust** — use compressed air to blow out all heatsinks, PCBs and filters monthly.\n4. **Airflow** — miners need clear input AND output. No hot air recirculating back in. Use ducting if in an enclosure.\n5. **Thermal paste** — degraded paste causes 15-20°C temperature rise. Replacing it on hash boards makes a huge difference.\n6. **Reduce overclock** — dial back frequency in the web interface.\n7. **Immersion cooling** — for serious operations, immersion in dielectric fluid eliminates heat issues entirely.\n\n**Temperature limits:**\n• Hash boards above 85°C: shut down immediately to prevent damage.\n• Ideal hash board temp: 60-75°C.\n\nWhat temperature are you seeing and on which miner?`;
    }

    // Mining - hash rate
    if (lq.includes("hash") || lq.includes("hashrate") || lq.includes("hash rate") || lq.includes("low rate") || lq.includes("dropping")) {
      return `Stan here — hash rate troubleshooting.\n\n**Low or dropping hash rate fixes:**\n\n1. **Check hash boards** — open web interface → Miner Status. Any red or missing boards need attention. Try reseating data cables.\n2. **Temperature** — if boards are above 80°C, hash rate throttles automatically. Fix cooling first.\n3. **Power supply** — underpowered PSU causes hash rate drops. Check PSU wattage matches your miner's requirements.\n4. **Pool connection** — verify stratum URL and port. High reject rate (above 1%) indicates network issues.\n5. **Restart** — power cycle the miner. Many temporary hash rate issues resolve with a simple restart.\n6. **Firmware** — outdated firmware can cause efficiency issues. Update from manufacturer's official site.\n7. **Cables** — reseat all data cables between control board and hash boards. These work loose over time.\n8. **Chips** — if a hash board shows significantly lower output than others, individual chips may have failed — requires professional repair.\n\nWhat miner model and what hash rate are you getting vs expected?`;
    }

    // Pool connection
    if (lq.includes("pool") || lq.includes("stratum") || lq.includes("connect") || lq.includes("offline") || lq.includes("reject")) {
      return `Stan here — pool connection fixes.\n\n**Can't connect to mining pool:**\n\n1. **Verify stratum URL** — check the pool's official website for current URLs. These occasionally change.\n2. **Try backup stratum** — configure 3 pool URLs (primary, secondary, tertiary) in your miner settings.\n3. **Ports** — mining pools use: 3333, 3334, 4444, 14444, 25. Make sure your router isn't blocking these.\n4. **Worker name format:**\n   • Braiins Pool: username.workername\n   • F2Pool: username.workername\n   • Public Pool: your_btc_address.workername\n5. **DNS** — try using IP address instead of hostname if hostname isn't resolving.\n6. **ISP blocking** — some ISPs block mining ports. Try a VPN or contact your ISP.\n\n**Recommended pools:**\n• Braiins Pool: stratum.braiins.com:3333\n• F2Pool: btc.f2pool.com:3333\n• Foundry USA: btc.foundryusapool.com:3333\n• Public Pool (solo): public-pool.io:21496\n\nWhat pool and miner are you using?`;
    }

    // Firmware
    if (lq.includes("firmware") || lq.includes("update") || lq.includes("flash") || lq.includes("upgrade")) {
      return `Stan here — firmware update guide.\n\n**Safe firmware update steps:**\n\n1. **Official sources only** — download ONLY from the manufacturer's website:\n   • Antminer/Bitmain: bitmain.com\n   • Whatsminer: microbt.com\n   • Bitaxe: AxeOS OTA update or GitHub releases\n2. **Backup config** — export your pool settings before updating.\n3. **Stable power** — never update during a power outage. Use a UPS if possible.\n4. **Don't interrupt** — once flashing starts, do not unplug or restart. Let it complete fully.\n5. **Flash process:**\n   • Antminer: System → Upgrade → choose file → Upgrade\n   • Whatsminer: System → Upgrade Firmware\n   • Bitaxe: AxeOS → System → OTA Update\n6. **If update fails** — reconnect and retry. Most miners have recovery mode that kicks in automatically.\n7. **Third party firmware** — Braiins OS+ and LuxOS offer efficiency gains but void warranty. Research before flashing.\n\nWhich miner model are you updating?`;
    }

    // Bitcoin basics
    if (lq.includes("what is bitcoin") || lq.includes("how does bitcoin") || lq.includes("blockchain") || lq.includes("what is crypto") || lq.includes("how does mining work") || lq.includes("what is mining")) {
      return `Stan here — happy to explain.\n\n**Bitcoin basics:**\n\n• **Bitcoin** is a decentralised digital currency. No bank, no government controls it. Transactions are verified by a global network of computers.\n\n• **Blockchain** is the public ledger that records every Bitcoin transaction ever made. It's immutable — once recorded, it cannot be changed.\n\n• **Mining** is the process of using specialised computers (ASICs) to solve complex mathematical puzzles. The winner gets to add the next block of transactions and receives the block reward (currently 3.125 BTC).\n\n• **Wallets** don't actually store Bitcoin — they store the private keys that prove ownership. The Bitcoin itself lives on the blockchain.\n\n• **Keys:** Your private key = full access to your funds. Seed phrase = master key that generates all private keys. Never share either.\n\nWhat would you like to know more about?`;
    }

    // DeFi
    if (lq.includes("defi") || lq.includes("uniswap") || lq.includes("liquidity") || lq.includes("yield") || lq.includes("staking") || lq.includes("smart contract") || lq.includes("approve") || lq.includes("token approval")) {
      return `Stan here — DeFi support.\n\n**Common DeFi issues:**\n\n• **Transaction failing** — check you have enough ETH/BNB for gas fees. Gas prices fluctuate — try again when network is quieter.\n• **Revoke token approvals** — go to revoke.cash, connect wallet, revoke any approvals from protocols you no longer use. This is good security practice.\n• **Impermanent loss** — when providing liquidity, price changes between paired tokens cause impermanent loss. Calculate this before committing.\n• **Slippage errors** — increase slippage tolerance in swap settings (0.5% → 1% → 2%). High for volatile tokens.\n• **Contract interaction failed** — check the contract address is the official one. Scammers deploy fake contracts with similar names.\n• **Staking rewards not showing** — allow 24 hours for rewards to appear. If still missing, check the protocol's official Discord.\n\nWhat DeFi issue are you having?`;
    }

    // Security / passwords / 2FA
    if (lq.includes("security") || lq.includes("password") || lq.includes("safe") || lq.includes("protect") || lq.includes("best practice")) {
      return `Stan here — crypto security essentials.\n\n**The most important rules:**\n\n1. **Seed phrase** — write it on paper, store in a fireproof safe. Never digital. Never cloud. Never photo. Never email.\n2. **Hardware wallet** — for any significant amount, use a Ledger or Trezor. Keep funds off exchanges.\n3. **2FA** — use an authenticator app (Google Authenticator, Authy) not SMS. SMS can be SIM-swapped.\n4. **Unique passwords** — use a password manager (Bitwarden is free and excellent). Never reuse passwords.\n5. **Phishing** — always check the URL. Bookmark official sites. Never click links in emails or DMs.\n6. **"Support" DMs** — legitimate support never DMs you first. Anyone offering to help via DM is a scammer.\n7. **Verify before sending** — always verify the recipient address. Send a small test amount first.\n8. **Software wallet** — only download from official sources. Check the developer's GitHub.\n\nIs there a specific security concern you're dealing with?`;
    }

    // Braiins pool specific
    if (lq.includes("braiins") || lq.includes("slush") || lq.includes("slushpool")) {
      return `Stan here — Braiins Pool support.\n\n**Braiins Pool setup:**\n\n• **Stratum URL:** stratum.braiins.com:3333 (or port 3334 backup)\n• **Worker format:** username.workername (e.g. paul.bitaxe1)\n• **Password:** anything (usually "x" or "123")\n\n**Braiins OS+ on Antminer:**\n1. Download from braiins.com/braiins-os\n2. Flash via the web interface or BOS Toolbox\n3. Autotuning will optimise your miner's efficiency automatically\n\n**Common issues:**\n• Workers not showing — allow 10-15 minutes after connecting for stats to appear\n• Low hashrate shown — check your actual miner web interface. Pool stats update every 5 minutes\n• Payout threshold — default is 0.001 BTC. Change in Account → Settings\n• Lightning payouts — Braiins supports Lightning Network for instant low-fee payouts\n\nWhat's the specific issue you're having with Braiins?`;
    }

    // Generic / unknown
    return `Stan here — let's get this sorted.\n\nI can help with:\n\n• **Bitaxe** — setup, WiFi, AxeOS, pool config, temperatures\n• **Antminer / Bitmain** — web interface, hash boards, overheating, firmware\n• **Whatsminer / MicroBT** — setup, pool connection, troubleshooting\n• **Wallet issues** — seed phrase recovery, lost access, hardware wallets\n• **Transactions** — stuck/pending, wrong address, deposits not arriving\n• **Exchange problems** — withdrawals, KYC, 2FA, account access\n• **Mining pools** — Braiins, F2Pool, Public Pool, connection issues\n• **Crypto security** — scams, account protection, best practices\n• **DeFi** — token approvals, failed transactions, staking\n\nDescribe your problem in as much detail as you can and I'll walk you through fixing it. ⚡`;
  }

  const S = {
    page:{minHeight:"100vh",background:"#020409",color:"#e2e8f0",fontFamily:"'IBM Plex Mono','Courier New',monospace",position:"relative",overflowX:"hidden"},
    grid:{display:"none"},
    wrap:{position:"relative",zIndex:1,maxWidth:920,margin:"0 auto",padding:"0 0 60px",boxSizing:"border-box",width:"100%"},
    section:{margin:"0 16px 28px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(212,163,0,0.15)",borderRadius:14,overflow:"hidden",boxSizing:"border-box"},
    sHead:{padding:"12px 20px",background:"linear-gradient(90deg,rgba(212,163,0,0.08),transparent)",borderBottom:"1px solid rgba(212,163,0,0.15)",fontSize:12,fontWeight:700,letterSpacing:"0.25em",color:"#d4a300",wordBreak:"break-word"},
    card:{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"14px 16px",transition:"all 0.3s",boxSizing:"border-box",minWidth:0},
    btn:{background:"linear-gradient(135deg,rgba(212,163,0,0.2),rgba(212,163,0,0.08))",border:"1px solid rgba(212,163,0,0.5)",color:"#d4a300",fontFamily:"inherit",fontSize:11,fontWeight:700,letterSpacing:"0.15em",cursor:"pointer",borderRadius:8,padding:"14px 20px",minHeight:48,transition:"all 0.2s"},
    inp:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,163,0,0.25)",borderRadius:8,padding:"10px 14px",color:"#e2e8f0",fontFamily:"inherit",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"},
    aName:{fontSize:14,fontWeight:900,letterSpacing:"0.15em"},
    aLabel:{fontSize:10,color:"rgba(255,255,255,0.65)",letterSpacing:"0.2em",marginTop:2},
    out:{fontSize:13,lineHeight:1.85,color:"#e2e8f0",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:12,marginTop:10},
  };

  const marketCtxValue = { price: btcPrice, change24h, source: marketSource, feedMode };

  // ── Auth gate ──
  if (authLoading) {
    return (
      <div style={{minHeight:"100vh",background:"#020409",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:11,color:"rgba(212,163,0,0.6)",letterSpacing:"0.3em",fontWeight:700}}>LOADING BITCORUM…</div>
      </div>
    );
  }
  if (!session) {
    return <AuthPage />;
  }

  return (
    <MarketContext.Provider value={marketCtxValue}>
    <div style={S.page}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes liveDot{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes priceIn{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shareGlow{0%,100%{box-shadow:0 0 18px rgba(212,163,0,0.15)}50%{box-shadow:0 0 36px rgba(212,163,0,0.45)}}
        @keyframes bAgentPulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes lunaGlow{0%,100%{box-shadow:0 0 12px rgba(200,170,90,0.2)}50%{box-shadow:0 0 28px rgba(200,170,90,0.6)}}
        @keyframes lunaPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
        @keyframes redGlow{0%,100%{text-shadow:0 0 8px #f87171,0 0 20px #f87171}50%{text-shadow:0 0 20px #f87171,0 0 40px #f87171,0 0 60px #f87171}}
        @keyframes amberPulse{0%,100%{opacity:0.8}50%{opacity:1}}
        @keyframes paulDot{0%,80%,100%{opacity:0.2;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
        @keyframes stanDot{0%,80%,100%{opacity:0.2;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
        @keyframes marvinDot{0%,80%,100%{opacity:0.2;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
        @media(max-width:600px){
          .btc-wrap{padding:0 0 80px!important}
          .btc-section{margin:0 12px 24px!important}
          .btc-card{padding:16px!important}
          .btc-hero{padding:32px 16px 28px!important;margin-bottom:20px!important}
          .btc-shead{padding:12px 16px!important}
          .btc-inner{padding:16px!important}
          .btc-nowrap{white-space:normal!important}
          img{max-width:100%!important;height:auto!important}
          pre,code{white-space:pre-wrap!important;word-break:break-word!important}
          .btc-card-hover:hover{transform:none;}
        }
      `}</style>
      <div style={S.grid}/>
      <div style={S.wrap} className="btc-wrap">

        {/* HERO */}
        <div style={{position:"relative",textAlign:"center",background:"linear-gradient(180deg,#000 0%,rgba(2,4,9,0.95) 70%,#020409 100%)",padding:"40px 20px 32px",marginBottom:28,borderBottom:"1px solid rgba(212,163,0,0.2)",overflow:"hidden"}} className="btc-hero">
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",pointerEvents:"none",background:"radial-gradient(circle,rgba(212,163,0,0.07) 0%,transparent 70%)"}}/>
          <img src={NEW_LOGO_SRC} alt="Bitcorum" style={{width:"min(240px,60vw)",height:"auto",margin:"0 auto 18px",display:"block",filter:"drop-shadow(0 0 40px rgba(212,163,0,0.6))",position:"relative",zIndex:1}}/>
          <div style={{fontSize:13,color:"#d4a300",letterSpacing:"0.25em",fontWeight:700,marginBottom:6,position:"relative",zIndex:1}}>MULTI-AGENT CRYPTO INTELLIGENCE</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",letterSpacing:"0.12em",position:"relative",zIndex:1,whiteSpace:"normal"}}>6 AI Agents. One Verdict. Before You Trade.</div>
          {btcPrice && (
              <div style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",background:"rgba(212,163,0,0.07)",border:"1px solid rgba(212,163,0,0.2)",borderRadius:20,position:"relative",zIndex:1}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:feedMode==="live"?"#4ade80":"#fb923c",display:"inline-block",flexShrink:0,animation:feedMode==="live"?"liveDot 2.4s ease-in-out infinite":"none"}}/>
                <span
                  key={btcPrice}
                  style={{
                    fontSize:12,fontWeight:700,color:"#f1f5f9",fontFamily:"monospace",letterSpacing:"0.05em",
                    animation:"priceIn 0.25s ease-out both",
                    textShadow: priceFlash==="up" ? "0 0 8px rgba(74,222,128,0.7)" : priceFlash==="down" ? "0 0 8px rgba(248,113,113,0.7)" : "none",
                    transition:"text-shadow 0.5s ease",
                  }}
                >BTC ${btcPrice.toLocaleString("en-US",{maximumFractionDigits:0})}</span>
                <span style={{fontSize:9,letterSpacing:"0.12em",fontWeight:700,color:feedMode==="live"?"#4ade80":"#fb923c"}}>
                  {feedMode==="live"?"LIVE DATA":"FALLBACK DATA"}
                </span>
                {feedMode==="live"&&<span style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.06em"}}>
                  · {secsAgo < 5 ? "Updated just now" : `Updated ${secsAgo}s ago`}
                </span>}
              </div>
          )}
        </div>

        {/* ABOUT */}
        <div style={S.section} className="btc-section">
          <div style={{...S.sHead,display:"flex",alignItems:"center",justifyContent:"space-between"}} className="btc-shead">
            <span>⬡ WELCOME TO BITCORUM</span>
            <button
              onClick={handleLogOut}
              style={{fontSize:8,letterSpacing:"0.15em",fontWeight:700,color:"rgba(212,163,0,0.65)",background:"rgba(212,163,0,0.06)",border:"1px solid rgba(212,163,0,0.25)",borderRadius:6,padding:"5px 10px",cursor:"pointer",whiteSpace:"nowrap"}}
            >LOG OUT</button>
          </div>
          <div style={{padding:"20px"}} className="btc-inner">
            {/* Luna header */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
              <div style={{width:52,height:52,flexShrink:0,animation:lunaPlaying?"lunaGlow 1.5s ease-in-out infinite":"none",transition:"all 0.3s"}}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  {/* Head */}
                  <circle cx="26" cy="26" r="22" fill="#0d0d0d" stroke="rgba(200,170,90,0.25)" strokeWidth="1"/>
                  {/* Eyes */}
                  <circle cx="18" cy="23" r="5" fill="#0d0d0d" stroke="rgba(200,170,90,0.3)" strokeWidth="1"/>
                  <circle cx="34" cy="23" r="5" fill="#0d0d0d" stroke="rgba(200,170,90,0.3)" strokeWidth="1"/>
                  <circle cx="18" cy="23" r="2.8" fill="#c8aa5a" opacity="0.45"/>
                  <circle cx="34" cy="23" r="2.8" fill="#c8aa5a" opacity="0.45"/>
                  <circle cx="19.5" cy="21.5" r="1" fill="white" opacity="0.15"/>
                  <circle cx="35.5" cy="21.5" r="1" fill="white" opacity="0.15"/>
                  {/* Smile */}
                  <path d="M18 33 Q26 40 34 33" stroke="rgba(200,170,90,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  {/* Small bow */}
                  <path d="M22 6 L26 9 L30 6 L26 8 Z" fill="#c8aa5a" opacity="0.3"/>
                </svg>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"rgba(200,170,90,0.65)",letterSpacing:"0.2em"}}>I AM LUNA</div>
                <div style={{fontSize:10,color:"rgba(200,170,90,0.8)",letterSpacing:"0.15em"}}>YOUR BITCORUM GUIDE</div>
                <div style={{fontSize:12,color:"rgba(200,170,90,0.95)",letterSpacing:"0.06em",marginTop:6,fontStyle:"italic"}}>
                  {lunaGreeting}{bitcorumUsername ? `, ${bitcorumUsername}` : ""}.
                </div>
                {lunaPlaying && lunaStep >= 0 && (
                  <div style={{fontSize:10,color:"rgba(200,170,90,0.9)",marginTop:3,letterSpacing:"0.08em",animation:"lunaPulse 1s ease-in-out infinite"}}>
                    ● {["WELCOME","LIVE DASHBOARD","THE COUNCIL","SHARE VERDICT","PERSONAL BRIEFING","COUNCIL HISTORY","BITCORUM RADIO","CLEVER GLOGGS","MARVIN","STAN","CLOSING"][lunaStep] || "SPEAKING"}
                  </div>
                )}
              </div>
            </div>

            {/* Script display */}
            {(() => {
              const LUNA_SCRIPT = [
                {title:"WELCOME", text:"Welcome to Bitcorum. I'm Luna — I will be your guide. Before you make your next trade, let me show you everything Bitcorum has to offer."},
                {title:"LIVE DASHBOARD", text:"At the top of Bitcorum you'll find the Live Dashboard — real time prices across Bitcoin, Ethereum, Solana and more, updating every 20 seconds. Before you trade, always know exactly where the market stands."},
                {title:"HOURLY BRIEFING COUNTDOWN", text:"This is the heart of Bitcorum — your Hourly Briefing Countdown. Every hour, six specialist AI agents automatically analyse the market and deliver a live verdict on your selected asset. Watch the countdown clock — green means plenty of time, amber means select your asset, red means your asset is locked in and your verdict is seconds away."},
                {title:"SELECT YOUR ASSET", text:"Below the countdown you'll find the asset selector. Choose Bitcoin, Ethereum, Solana or any other asset before the countdown turns red. At ten seconds your asset locks in — that's when the anticipation begins."},
                {title:"THE COUNCIL — LIVE VERDICT", text:"When the countdown hits zero, scroll down to The Council — Trading Intelligence. Watch all six agents come to life — NOVA analyses the news, AXIOM reads the charts, PULSE measures sentiment, AEGIS assesses the risk, ROGUE challenges the consensus, and VERDICT delivers the final call. BUY. SELL. or HOLD. Six perspectives. One verdict. Every hour."},
                {title:"YOUR HOURLY BRIEFING", text:"Once the verdict is in, your Hourly Briefing is waiting. Press play and hear your six agents discuss the verdict in their own voices. This is your personal crypto podcast — generated just for you, every single hour."},
                {title:"SHARE YOUR VERDICT", text:"After every verdict, share it with the world. One tap generates a shareable card showing exactly what your agents decided. Share it on social media to keep other crypto investors up to date — or save it to track your market history over time."},
                {title:"COUNCIL HISTORY", text:"Every verdict you receive is automatically saved to your Council History. Track how the market has moved hour by hour, see which assets you've been monitoring, and watch how the agents' thinking evolves as conditions change."},
                {title:"BITCORUM RADIO", text:"While you wait for your next verdict, Bitcorum Radio is here for you. Live crypto news, market updates and intelligence broadcasting around the clock. Tune in the morning before your trading day starts, and tune in the evening to stay ahead of tomorrow's market. Tune in. Stay informed. Stay ahead."},
                {title:"CLEVER GLOGGS, MARVIN & STAN", text:"Bitcorum has more to offer. Clever Gloggs will tell you something about crypto you never knew. Marvin has the latest Bitcoin mining machines with specs and prices. And Stan — your technical support specialist — is open 24 hours a day, seven days a week for any crypto or mining problem you need solving."},
                {title:"CLOSING", text:"Six agents. One verdict. Every hour. Real time intelligence. Always on. This is your edge — check Bitcorum before every trade, listen to your hourly briefing, and when the trading day ends, Bitcorum begins. The market never sleeps. Neither do we. Welcome to Bitcorum — your personal crypto intelligence. Keep informed. Be confident. Be ahead."},
              ];

              const lunaSpeak = (idx) => {
                if (lunaCancelRef.current || idx >= LUNA_SCRIPT.length) {
                  setLunaPlaying(false); setLunaStep(-1); setLunaDone(true); return;
                }
                if (!window.speechSynthesis) { setLunaPlaying(false); return; }
                const item = LUNA_SCRIPT[idx];
                setLunaStep(idx);
                const u = new SpeechSynthesisUtterance(item.text);
                u.pitch = 1.2; u.rate = 0.92; u.volume = 1; u.lang = "en-GB";
                const vs = window.speechSynthesis.getVoices();
                if (vs.length) {
                  u.voice = vs.find(v=>v.lang==="en-GB"&&v.name.toLowerCase().includes("female"))
                         || vs.find(v=>v.lang==="en-GB")
                         || vs.find(v=>v.lang.startsWith("en")&&(v.name.toLowerCase().includes("female")||v.name.toLowerCase().includes("zira")||v.name.toLowerCase().includes("samantha")||v.name.toLowerCase().includes("victoria")))
                         || vs.find(v=>v.lang.startsWith("en"))
                         || vs[0];
                }
                u.onend = () => { if (!lunaCancelRef.current) setTimeout(()=>lunaSpeak(idx+1), 500); };
                u.onerror = (e) => { if (e.error==="interrupted"||e.error==="canceled") return; if (!lunaCancelRef.current) setTimeout(()=>lunaSpeak(idx+1), 500); };
                window.speechSynthesis.speak(u);
              };

              const handleLuna = () => {
                if (lunaPlaying) {
                  lunaCancelRef.current = true;
                  window.speechSynthesis?.cancel();
                  setLunaPlaying(false); setLunaStep(-1);
                } else {
                  lunaCancelRef.current = false;
                  setLunaDone(false); setLunaPlaying(true);
                  window.speechSynthesis?.cancel();
                  lunaSpeak(0);
                }
              };

              return (
                <div>
                  {/* Current step text display */}
                  <div style={{minHeight:90,padding:"14px 16px",background:"rgba(200,170,90,0.05)",border:"1px solid rgba(200,170,90,0.15)",borderRadius:10,marginBottom:16,boxSizing:"border-box"}}>
                    {lunaStep >= 0 ? (
                      <div>
                        <div style={{fontSize:9,color:"rgba(200,170,90,0.7)",letterSpacing:"0.2em",fontWeight:700,marginBottom:6}}>{LUNA_SCRIPT[lunaStep]?.title}</div>
                        <p style={{fontSize:13,color:"rgba(255,255,255,0.88)",lineHeight:1.8,margin:0}}>{LUNA_SCRIPT[lunaStep]?.text}</p>
                      </div>
                    ) : lunaDone ? (
                      <p style={{fontSize:13,color:"rgba(200,170,90,0.7)",lineHeight:1.8,margin:0,fontStyle:"italic"}}>Tour complete. Welcome to Bitcorum.</p>
                    ) : (
                      <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",lineHeight:1.8,margin:0}}>First time here? Or do you want Luna to give you a refresher tour? Let Luna walk you through everything Bitcorum has to offer.</p>
                    )}
                  </div>

                  {/* Step indicators */}
                  <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
                    {LUNA_SCRIPT.map((s,i)=>(
                      <div key={i} style={{height:3,flex:1,minWidth:8,borderRadius:2,background:i<lunaStep?"#c8aa5a":i===lunaStep?"#c8aa5a":"rgba(200,170,90,0.2)",transition:"background 0.4s",opacity:i===lunaStep?1:i<lunaStep?0.7:0.3}}/>
                    ))}
                  </div>

                  {/* Button */}
                  <button onClick={handleLuna} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 24px",background:lunaPlaying?"rgba(248,113,113,0.08)":"rgba(200,170,90,0.1)",border:`1px solid ${lunaPlaying?"#f87171":"#c8aa5a"}`,borderRadius:8,cursor:"pointer",color:lunaPlaying?"#f87171":"#c8aa5a",fontSize:11,fontWeight:700,letterSpacing:"0.15em",transition:"all 0.2s",width:"100%",justifyContent:"center",boxSizing:"border-box"}}>
                    {lunaPlaying ? (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> STOP TOUR</>
                    ) : lunaDone ? (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> TAKE THE TOUR AGAIN</>
                    ) : (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> LET'S WALK YOU THROUGH</>
                    )}
                  </button>
                </div>
              );
            })()}

          </div>
        </div>

        {/* DASHBOARD */}
        <div style={S.section} className="btc-section">
          <div style={S.sHead} className="btc-shead">⬡ CRYPTO MULTI-AGENT TRADING DASHBOARD</div>
          <LiveDashboard/>
        </div>

        {/* LAST HOURLY BRIEFING */}
        {lastBriefing && (() => {
          const BVOICES2 = [
            {id:"news",name:"NOVA",color:"#00d4ff",pitch:0.85,rate:1.1,lang:"en-US"},
            {id:"technical",name:"AXIOM",color:"#c8aa5a",pitch:0.7,rate:0.88,lang:"en-GB"},
            {id:"sentiment",name:"PULSE",color:"#f472b6",pitch:0.9,rate:1.05,lang:"en-AU"},
            {id:"risk",name:"AEGIS",color:"#fb923c",pitch:1.2,rate:0.82,lang:"en-GB",female:true},
            {id:"devil",name:"ROGUE",color:"#4ade80",pitch:0.75,rate:1.15,lang:"en-US"},
            {id:"judge",name:"VERDICT",color:"#fbbf24",pitch:0.6,rate:0.80,lang:"en-GB"},
          ];
          const CLOSING2 = "That's your personal Bitcorum hourly briefing. The market never sleeps — and neither do we. The countdown has begun for your next hourly briefing, keeping you up to date hour by hour on market changes.";
          const ts = new Date(lastBriefing.timestamp);
          const timeStr = ts.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}) + " · " + ts.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
          const getLastLines = () => {
            const lines = [];
            BVOICES2.forEach(av => {
              const out = lastBriefing.outputs?.[av.id];
              const text = typeof out === "string" ? out : out?.text || "";
              if (text.trim()) lines.push({...av, text: text.replace(/\*\*/g,"").replace(/#+/g,"").replace(/---/g,"").trim().slice(0,500)});
            });
            lines.push({...BVOICES2[5], id:"closing", text: CLOSING2});
            return lines;
          };
          const lastLines = getLastLines();
          const speakLast = (idx) => {
            if (lastBriefingCancelRef.current || idx >= lastLines.length) {
              setLastBriefingPlaying(false); setLastBriefingIdx(-1); setLastBriefingDone(true); return;
            }
            const synth = window.speechSynthesis;
            if (!synth) { setLastBriefingPlaying(false); return; }
            const line = lastLines[idx];
            setLastBriefingIdx(idx);
            if (synth.getVoices().length > 0) {
              synth.cancel();
              const u = new SpeechSynthesisUtterance(line.text);
              u.pitch = line.pitch; u.rate = line.rate; u.volume = 1; u.lang = line.lang||"en-US";
              const vs = synth.getVoices();
              const avoid = ["samantha","victoria","karen","moira","zira","tessa","fiona","female","siri"];
              let v;
              if (line.female) {
                v = vs.find(v=>v.lang===u.lang&&(v.name.toLowerCase().includes("female")||v.name.toLowerCase().includes("samantha")))||vs.find(v=>v.lang===u.lang)||vs[0];
              } else {
                const lv = vs.filter(v=>v.lang===u.lang&&!avoid.some(a=>v.name.toLowerCase().includes(a)));
                v = lv[0]||vs.find(v=>v.lang.startsWith("en")&&!avoid.some(a=>v.name.toLowerCase().includes(a)))||vs[0];
              }
              if (v) u.voice = v;
              u.onend = () => { if (!lastBriefingCancelRef.current) setTimeout(()=>speakLast(idx+1),350); };
              u.onerror = (e) => { if (e.error==="interrupted"||e.error==="canceled") return; if (!lastBriefingCancelRef.current) setTimeout(()=>speakLast(idx+1),350); };
              synth.speak(u);
            } else {
              synth.onvoiceschanged = () => { synth.onvoiceschanged = null; speakLast(idx); };
            }
          };
          const handleLastPlay = () => {
            if (lastBriefingPlaying) {
              lastBriefingCancelRef.current = true;
              window.speechSynthesis?.cancel();
              setLastBriefingPlaying(false); setLastBriefingIdx(-1);
            } else {
              lastBriefingCancelRef.current = false;
              setLastBriefingDone(false); setLastBriefingPlaying(true);
              speakLast(0);
            }
          };
          return (
            <div style={{margin:"0 16px 16px",padding:"18px 20px",background:"rgba(212,163,0,0.03)",border:"1px solid rgba(212,163,0,0.2)",borderRadius:12,boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                <span style={{fontSize:11,fontWeight:700,color:"#fbbf24",letterSpacing:"0.15em"}}>YOUR LAST HOURLY BRIEFING</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:"0.06em",marginBottom:12}}>
                {lastBriefing.coin} · {timeStr} — Catch up on what your agents said last time.
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
                {BVOICES2.map((av,i)=>{
                  const active = lastBriefingIdx===i||(av.name==="VERDICT"&&lastBriefingIdx===lastLines.length-1&&lastLines[lastLines.length-1]?.id==="closing");
                  return (
                    <div key={av.id} style={{padding:"3px 8px",borderRadius:20,border:`1px solid ${active?av.color:"rgba(255,255,255,0.08)"}`,background:active?`${av.color}22`:"transparent",transition:"all 0.3s"}}>
                      <span style={{fontSize:9,fontWeight:700,color:active?av.color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em"}}>{av.name}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleLastPlay} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",background:lastBriefingPlaying?"rgba(248,113,113,0.08)":"rgba(212,163,0,0.08)",border:`1px solid ${lastBriefingPlaying?"#f87171":"rgba(212,163,0,0.35)"}`,borderRadius:7,cursor:"pointer",color:lastBriefingPlaying?"#f87171":"#fbbf24",fontSize:10,fontWeight:700,letterSpacing:"0.12em",transition:"all 0.2s",fontFamily:"inherit"}}>
                {lastBriefingPlaying
                  ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> STOP</>
                  : <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> {lastBriefingDone?"PLAY AGAIN":"PLAY LAST BRIEFING"}</>
                }
              </button>
            </div>
          );
        })()}

        {/* HOURLY VERDICT COUNTDOWN */}
        {!running&&(
          <div style={{margin:"0 16px 20px",padding:"20px",background:"rgba(212,163,0,0.04)",border:"1px solid rgba(212,163,0,0.2)",borderRadius:12,boxSizing:"border-box",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#60a5fa",letterSpacing:"0.25em",marginBottom:8}}>⬡ HOURLY BRIEFING COUNTDOWN</div>
            {/* Countdown display */}
            {(()=>{
              const mins = Math.floor(countdown/60);
              const secs = countdown%60;
              const timeStr = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
              const isRed = countdown<=10;
              const isAmber = countdown>10&&countdown<=20;
              const color = isRed?"#f87171":isAmber?"#fbbf24":"#4ade80";
              return (
                <div>
                  <div style={{fontSize:52,fontWeight:900,color,fontFamily:"monospace",letterSpacing:"0.1em",lineHeight:1,animation:isRed?"redGlow 0.8s ease-in-out infinite":isAmber?"amberPulse 1s ease-in-out infinite":"none",transition:"color 0.5s"}}>
                    {timeStr}
                  </div>
                  <div style={{marginTop:8,fontSize:11,letterSpacing:"0.12em",color:isRed?"#f87171":isAmber?"#fbbf24":"rgba(255,255,255,0.5)",fontWeight:isRed||isAmber?700:400,lineHeight:1.6}}>
                    {isRed ? (
                      <div>
                        <div>🔒 {lockedCoin||activeCoin} LOCKED IN — VERDICT INCOMING</div>
                        <div style={{marginTop:8,fontSize:10,color:"rgba(248,113,113,0.8)",letterSpacing:"0.08em",fontWeight:400}}>
                          Scroll down to <span style={{color:"#f87171",fontWeight:700}}>THE COUNCIL — TRADING INTELLIGENCE</span> to watch your agents deliver your live verdict in real time.
                        </div>
                      </div>
                    ) : isAmber ? (
                      <div>
                        <div>⚠ {countdown} SECONDS TO LOCK IN YOUR ASSET</div>
                        <div style={{marginTop:4,fontSize:10,color:"rgba(251,191,36,0.7)",letterSpacing:"0.08em",fontWeight:400}}>Select your asset below before the countdown hits red.</div>
                      </div>
                    ) : (
                      <div style={{color:"#60a5fa",fontSize:10,lineHeight:1.5}}>SELECT YOUR ASSET<br/>FOR THE NEXT HOURLY VERDICT</div>
                    )}
                  </div>
                </div>
              );
            })()}
            <div style={{marginTop:14,fontSize:10,color:"rgba(212,163,0,0.6)",letterSpacing:"0.08em",lineHeight:1.7,fontStyle:"italic"}}>
              📻 Tune into <span style={{color:"#d4a300",fontWeight:700}}>Bitcorum Radio</span> while you wait for your next hourly verdict — live crypto news, market updates and intelligence.
            </div>
          </div>
        )}
        {running&&(
          <div style={{margin:"0 16px 20px",textAlign:"center",padding:14,background:"rgba(212,163,0,0.05)",border:"1px solid rgba(212,163,0,0.2)",borderRadius:10,fontSize:12,color:"#d4a300",letterSpacing:"0.15em"}}>
            <span>{councilStatus || `⬡ COUNCIL IN SESSION · ANALYSING ${activeCoin}`}</span>
            {liveData&&<div style={{marginTop:6,fontSize:10,color:"rgba(255,255,255,0.65)",letterSpacing:"0.1em"}}>🟢 LIVE · ${Number(liveData.price).toLocaleString("en-US",{maximumFractionDigits:0})} · {liveData.change24h!=null?(parseFloat(liveData.change24h)>=0?`+${parseFloat(liveData.change24h).toFixed(2)}%`:`${parseFloat(liveData.change24h).toFixed(2)}%`):"N/A"} 24H{liveData.volume24h!=null?` · Vol: ${liveData.volume24h>1e9?`$${(liveData.volume24h/1e9).toFixed(2)}B`:`$${(liveData.volume24h/1e6).toFixed(2)}M`}`:""}</div>}
          </div>
        )}

        {/* COIN SELECTOR */}
        <div style={S.section} className="btc-section">
          <div style={S.sHead} className="btc-shead">⬡ SELECT ASSET FOR COUNCIL ANALYSIS</div>
          <div style={{padding:"18px"}} className="btc-inner">
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
              {COINS.map(c=>(
                <button key={c} onClick={()=>{setCoin(c);setCustomCoin("");}} style={{padding:"7px 15px",borderRadius:6,border:"1px solid",borderColor:(coin===c&&!customCoin)?"#d4a300":"rgba(255,255,255,0.1)",background:(coin===c&&!customCoin)?"rgba(212,163,0,0.12)":"transparent",color:(coin===c&&!customCoin)?"#d4a300":"#cbd5e1",fontFamily:"inherit",fontSize:11,cursor:"pointer",fontWeight:700,letterSpacing:"0.1em",transition:"all 0.15s"}}>{c}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <input value={customCoin} onChange={e=>setCustomCoin(e.target.value.toUpperCase())} placeholder="OTHER TICKER (e.g. PEPE)" style={{...S.inp,maxWidth:220}}/>
              {customCoin&&<span style={{fontSize:11,color:"#d4a300"}}>→ {customCoin}</span>}
            </div>
          </div>
        </div>

        {/* VERDICT BANNER */}
        {finalVerdict?.label&&(
          <div style={{margin:"0 16px 20px",textAlign:"center",padding:"20px",background:`rgba(${finalVerdict.color==="#4ade80"?"74,222,128":finalVerdict.color==="#f87171"?"248,113,113":"251,191,36"},0.07)`,border:`2px solid ${finalVerdict.color}`,borderRadius:12,boxShadow:`0 0 50px ${finalVerdict.color}22`,wordBreak:"break-word",overflowWrap:"break-word",boxSizing:"border-box"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",letterSpacing:"0.3em",marginBottom:6}}>COUNCIL VERDICT · {activeCoin}</div>
            <div style={{fontSize:44,fontWeight:900,color:finalVerdict.color,letterSpacing:"0.1em"}}>{finalVerdict.label}</div>
            {liveData&&<div style={{marginTop:8,fontSize:10,color:"rgba(255,255,255,0.55)",letterSpacing:"0.1em"}}>BASED ON LIVE DATA · ${Number(liveData.price).toLocaleString("en-US",{maximumFractionDigits:0})} · {new Date(liveData.timestamp).toLocaleTimeString()}</div>}
          </div>
        )}

        {/* COUNCIL AGENTS */}
        <div style={S.section} className="btc-section">
          <div style={S.sHead} className="btc-shead">⬡ THE COUNCIL — TRADING INTELLIGENCE</div>
          <div style={{padding:"14px",display:"flex",flexDirection:"column",gap:10,overflow:"hidden",position:"relative"}}>
            {TRADING_AGENTS.map(agent=>{
              const output=agentOutputs[agent.id];
              const isActive=currentAgent===agent.id;
              const hasOutput=!!output;
              const rgb=agent.color.replace("#","").match(/.{2}/g)?.map(h=>parseInt(h,16)).join(",");
              return (
                <div key={agent.id} style={{...S.card,background:isActive?`linear-gradient(135deg,rgba(${rgb},0.07),rgba(0,0,0,0.4))`:"rgba(255,255,255,0.02)",borderColor:isActive?agent.color:hasOutput?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.04)",boxShadow:isActive?`0 0 20px rgba(${rgb},0.4)`:"none",opacity:(!hasOutput&&!isActive&&Object.keys(agentOutputs).length===0&&!running)?0.5:1,transition:"all 0.3s ease"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <RobotFace agentId={agent.id} color={agent.color} size={46} isActive={isActive}/>
                    <div style={{flex:1}}>
                      <div style={{...S.aName,color:agent.color}}>{agent.name}</div>
                      <div style={S.aLabel}>{agent.label}</div>
                    </div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      {isActive&&<div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:agent.color}}/>)}</div>}
                      {hasOutput&&(()=>{const v=verdictStyle(output);return v.label?<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:4,border:`1px solid ${v.color}`,color:v.color,letterSpacing:"0.1em",background:`${v.color}18`}}>{v.label}</span>:null;})()}
                    </div>
                  </div>
                  {isActive&&!output&&<div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:7,letterSpacing:"0.1em"}}>{agent.id==="news"?"searching live news feeds...":liveData?`processing live data — $${Number(liveData.price).toLocaleString("en-US",{maximumFractionDigits:0})} · ${liveData.change24h!=null?(parseFloat(liveData.change24h)>=0?`+${parseFloat(liveData.change24h).toFixed(2)}%`:`${parseFloat(liveData.change24h).toFixed(2)}%`):""}...`:"fetching live market data..."}</div>}
                  {hasOutput&&<MarkdownText text={output} color="#e2e8f0" borderColor="rgba(255,255,255,0.08)"/>}
                </div>
              );
            })}
          </div>
          {done&&(
            <div style={{padding:"0 14px 14px",display:"flex",flexDirection:"column",gap:10}}>

              {finalVerdict?.label&&(
                <button
                  onClick={shareVerdict}
                  style={{width:"100%",padding:"14px 20px",minHeight:48,borderRadius:8,background:shareLoading?"rgba(212,163,0,0.12)":"linear-gradient(135deg,rgba(212,163,0,0.15),rgba(212,163,0,0.05))",border:`1px solid rgba(212,163,0,${shareLoading?0.6:0.4})`,color:"#d4a300",fontFamily:"inherit",fontSize:11,fontWeight:700,letterSpacing:"0.18em",cursor:shareLoading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:9,transition:"all 0.15s",opacity:shareLoading?1:1,boxShadow:shareLoading?"0 0 28px rgba(212,163,0,0.25)":"0 0 18px rgba(212,163,0,0.08)",animation:shareLoading?"shareGlow 1.2s ease-in-out infinite":undefined}}
                  onMouseEnter={e=>{if(!shareLoading){e.currentTarget.style.background="linear-gradient(135deg,rgba(212,163,0,0.22),rgba(212,163,0,0.09))";e.currentTarget.style.boxShadow="0 0 28px rgba(212,163,0,0.18)";}}}
                  onMouseLeave={e=>{if(!shareLoading){e.currentTarget.style.background="linear-gradient(135deg,rgba(212,163,0,0.15),rgba(212,163,0,0.05))";e.currentTarget.style.boxShadow="0 0 18px rgba(212,163,0,0.08)";}}}
                  onMouseDown={e=>{e.currentTarget.style.transform="scale(0.96)";}}
                  onMouseUp={e=>{e.currentTarget.style.transform="scale(1)";}}
                  onTouchStart={e=>{e.currentTarget.style.transform="scale(0.96)";e.currentTarget.style.background="linear-gradient(135deg,rgba(212,163,0,0.22),rgba(212,163,0,0.09))";}}
                  onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.background="linear-gradient(135deg,rgba(212,163,0,0.15),rgba(212,163,0,0.05))";}}>
                  {shareLoading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
                      </svg>
                      GENERATING IMAGE...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      SHARE VERDICT
                    </>
                  )}
                </button>
              )}
              <div style={{padding:"10px 14px",background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.2)",borderRadius:8,fontSize:10,color:"#60a5fa",letterSpacing:"0.05em",lineHeight:1.6,textAlign:"center"}}>
                Market data refreshes every 20 seconds. Price at verdict may differ slightly from current exchange rates.
              </div>
              {/* Post-verdict message */}
              <div style={{padding:"14px 16px",background:"rgba(212,163,0,0.04)",border:"1px solid rgba(212,163,0,0.2)",borderRadius:10,fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.8,letterSpacing:"0.04em"}}>
                <div style={{fontWeight:700,color:"#fbbf24",marginBottom:6,letterSpacing:"0.1em"}}>⬡ YOU ARE UP TO DATE</div>
                You are up to date with the price of <span style={{color:"#fbbf24",fontWeight:700}}>{activeCoin}</span>. Your next hourly verdict countdown has begun — keeping you informed and ahead of the crypto game.
                <br/><br/>
                Don't forget to <span style={{color:"#fbbf24"}}>save your verdict</span> to keep track of your results and monitor your market data, or <span style={{color:"#fbbf24"}}>share your results</span> on social media to keep other crypto investors up to date.
                <br/><br/>
                Your <span style={{color:"#fbbf24"}}>Hourly Briefing</span> is now available. Listen to your agents discuss your latest crypto verdict and results.
                <br/><br/>
                <span style={{color:"rgba(212,163,0,0.7)",fontStyle:"italic"}}>Bitcorum Radio is here for you while you wait for your next verdict — for even more insights, latest news and market changes. Tune in. Stay informed. Stay ahead.</span>
              </div>
            </div>
          )}
        </div>

        {/* HOURLY BRIEFING */}
        {done && finalVerdict?.label && (() => {
          const BVOICES = [
            {id:"news",    name:"NOVA",    color:"#00d4ff", pitch:0.85, rate:1.1,  lang:"en-US"},
            {id:"technical",name:"AXIOM",  color:"#c8aa5a", pitch:0.7,  rate:0.88, lang:"en-GB"},
            {id:"sentiment",name:"PULSE",  color:"#f472b6", pitch:0.9,  rate:1.05, lang:"en-AU"},
            {id:"risk",    name:"AEGIS",   color:"#fb923c", pitch:1.2,  rate:0.82, lang:"en-GB", female:true},
            {id:"devil",   name:"ROGUE",   color:"#4ade80", pitch:0.75, rate:1.15, lang:"en-US"},
            {id:"judge",   name:"VERDICT", color:"#fbbf24", pitch:0.6,  rate:0.80, lang:"en-GB"},
          ];
          const CLOSING = "That's your personal Bitcorum hourly briefing. The market never sleeps — and neither do we. The countdown has begun for your next hourly briefing, keeping you up to date hour by hour on market changes.";
          const getLines = () => {
            const lines = [];
            BVOICES.forEach(av => {
              const text = typeof agentOutputs?.[av.id] === "string" ? agentOutputs[av.id] : "";
              if (text.trim()) lines.push({...av, text: text.replace(/\*\*/g,"").replace(/#+/g,"").replace(/---/g,"").trim().slice(0,500)});
            });
            lines.push({...BVOICES[5], id:"closing", text: CLOSING});
            return lines;
          };
          const lines = getLines();
          const speakFrom = (idx) => {
            if (briefingCancelRef.current || idx >= lines.length) {
              setBriefingPlaying(false); setBriefingIdx(-1); setBriefingDone(true); return;
            }
            const synth = window.speechSynthesis;
            if (!synth) { setBriefingPlaying(false); return; }
            const line = lines[idx];
            setBriefingIdx(idx);
            if (synth.getVoices().length > 0) {
              synth.cancel();
              const u = new SpeechSynthesisUtterance(line.text);
              u.pitch = line.pitch; u.rate = line.rate; u.volume = 1;
              const vs = synth.getVoices();
              let v;
              u.lang = line.lang || "en-US";
              if (line.female) {
                v = vs.find(v=>v.lang===u.lang&&(v.name.toLowerCase().includes("female")||v.name.toLowerCase().includes("samantha")||v.name.toLowerCase().includes("victoria")||v.name.toLowerCase().includes("karen")||v.name.toLowerCase().includes("moira")||v.name.toLowerCase().includes("zira")))
                  || vs.find(v=>v.lang===u.lang)
                  || vs.find(v=>v.lang.startsWith("en")&&(v.name.toLowerCase().includes("samantha")||v.name.toLowerCase().includes("zira")||v.name.toLowerCase().includes("victoria")))
                  || vs[0];
              } else {
                // For male agents pick voice matching their lang, avoiding known female names
                const avoid = ["samantha","victoria","karen","moira","zira","tessa","fiona","female","siri"];
                const langVoices = vs.filter(v=>v.lang===u.lang&&!avoid.some(a=>v.name.toLowerCase().includes(a)));
                const enVoices = vs.filter(v=>v.lang.startsWith("en")&&!avoid.some(a=>v.name.toLowerCase().includes(a)));
                v = langVoices[0] || enVoices[0] || vs[0];
              }
              if (v) u.voice = v;
              u.onend = () => { if (!briefingCancelRef.current) setTimeout(()=>speakFrom(idx+1), 350); };
              u.onerror = (e) => { if (e.error==="interrupted"||e.error==="canceled") return; if (!briefingCancelRef.current) setTimeout(()=>speakFrom(idx+1), 350); };
              synth.speak(u);
            } else {
              synth.onvoiceschanged = () => { synth.onvoiceschanged = null; speakFrom(idx); };
              setTimeout(() => { if (!briefingCancelRef.current) speakFrom(idx); }, 700);
            }
          };
          const handlePlay = () => {
            if (briefingPlaying) {
              briefingCancelRef.current = true;
              window.speechSynthesis?.cancel();
              setBriefingPlaying(false); setBriefingIdx(-1);
            } else {
              briefingCancelRef.current = false;
              setBriefingDone(false); setBriefingPlaying(true);
              speakFrom(0);
            }
          };
          return (
            <div style={{margin:"0 16px 20px",padding:"20px",background:"rgba(212,163,0,0.04)",border:"1px solid rgba(212,163,0,0.25)",borderRadius:12,boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                <span style={{fontSize:12,fontWeight:700,color:"#fbbf24",letterSpacing:"0.15em"}}>YOUR HOURLY BRIEFING</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:"0.08em",marginBottom:14}}>Hear your agents discuss this {activeCoin} verdict</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                {BVOICES.map((av,i)=>{
                  const active = briefingIdx===i || (av.name==="VERDICT" && briefingIdx===lines.length-1 && lines[lines.length-1]?.id==="closing");
                  return (
                    <div key={av.id} style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${active?av.color:"rgba(255,255,255,0.1)"}`,background:active?`${av.color}22`:"transparent",transition:"all 0.3s",animation:active?"bAgentPulse 1s ease-in-out infinite":"none"}}>
                      <span style={{fontSize:10,fontWeight:700,color:active?av.color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em"}}>{av.name}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={handlePlay} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 22px",background:briefingPlaying?"rgba(248,113,113,0.1)":"rgba(212,163,0,0.1)",border:`1px solid ${briefingPlaying?"#f87171":"#d4a300"}`,borderRadius:8,cursor:"pointer",color:briefingPlaying?"#f87171":"#fbbf24",fontSize:11,fontWeight:700,letterSpacing:"0.12em",transition:"all 0.2s"}}>
                {briefingPlaying
                  ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> STOP</>
                  : <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> {briefingDone?"PLAY AGAIN":"PLAY BRIEFING"}</>
                }
              </button>
              {briefingDone&&!briefingPlaying&&(
                <div style={{marginTop:10,fontSize:10,color:"rgba(212,163,0,0.55)",letterSpacing:"0.08em",fontStyle:"italic"}}>Briefing complete. The countdown has begun for your next hourly briefing.</div>
              )}
            </div>
          );
        })()}

        {/* HIDDEN VERDICT CARD — off-screen, captured by html2canvas */}
        {finalVerdict?.label&&liveData&&(()=>{
          const vc=finalVerdict.color;
          const vcRgb=vc==="#4ade80"?"74,222,128":vc==="#f87171"?"248,113,113":"251,191,36";
          const judgeResult=agents?.["judge"];
          const winnerName=(()=>{
            const voteIds=["news","technical","sentiment","risk","devil"];
            const tally={};
            voteIds.forEach(id=>{const r=agents?.[id];if(!r)return;const dec=r.decision==="BULLISH"?"BUY":r.decision==="BEARISH"?"SELL":r.decision;if(!tally[dec])tally[dec]=[];tally[dec].push(r.agent);});
            return(tally[finalVerdict.label]||[])[0]||"VERDICT";
          })();
          const tsStr=new Date(liveData.timestamp).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
          return(
            <div ref={verdictCardRef} style={{position:"fixed",left:"-9999px",top:0,width:520,background:"#020409",padding:"36px 40px",fontFamily:"'IBM Plex Mono','Courier New',monospace",border:`2px solid ${vc}`,borderRadius:16,boxSizing:"border-box",zIndex:-1}}>
              <div style={{position:"absolute",inset:0,borderRadius:14,pointerEvents:"none"}}/>
              <div style={{position:"absolute",inset:0,borderRadius:14,background:`radial-gradient(ellipse at 50% 0%,rgba(${vcRgb},0.12) 0%,transparent 65%)`,pointerEvents:"none"}}/>
              <div style={{position:"relative",zIndex:1}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
                  <div>
                    <div style={{fontSize:18,fontWeight:900,color:"#d4a300",letterSpacing:"0.2em"}}>BITCORUM</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.88)",letterSpacing:"0.2em",marginTop:2}}>MULTI-AGENT CRYPTO INTELLIGENCE</div>
                  </div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.88)",letterSpacing:"0.1em",textAlign:"right"}}>
                    <div>COUNCIL VERDICT</div>
                    <div style={{marginTop:2,color:"rgba(255,255,255,0.88)"}}>{tsStr}</div>
                  </div>
                </div>
                <div style={{height:1,background:`linear-gradient(90deg,transparent,${vc}55,transparent)`,marginBottom:28}}/>
                <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24}}>
                  <div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.88)",letterSpacing:"0.2em",marginBottom:4}}>ASSET</div>
                    <div style={{fontSize:32,fontWeight:900,color:"#f1f5f9",letterSpacing:"0.1em"}}>{activeCoin}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.88)",letterSpacing:"0.2em",marginBottom:4}}>PRICE AT VERDICT</div>
                    <div style={{fontSize:24,fontWeight:700,color:"#e2e8f0",fontFamily:"monospace"}}>${Number(liveData.price).toLocaleString("en-US",{maximumFractionDigits:0})}</div>
                  </div>
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.88)",letterSpacing:"0.35em",marginBottom:8,display:"block",textAlign:"center"}}>COUNCIL DECISION</div>
                <div style={{background:`rgba(${vcRgb},0.07)`,border:`1px solid rgba(${vcRgb},0.35)`,borderRadius:12,marginBottom:24,boxShadow:`0 0 40px rgba(${vcRgb},0.12) inset`,width:"100%",boxSizing:"border-box",display:"table",height:100}}>
                  <div style={{display:"table-cell",verticalAlign:"middle",textAlign:"center",paddingBottom:32}}>
                    <div style={{fontSize:52,fontWeight:900,color:vc,letterSpacing:"0.08em",lineHeight:1}}>{finalVerdict.label}</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"14px 16px"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.88)",letterSpacing:"0.2em",marginBottom:6}}>CONFIDENCE</div>
                    <div style={{fontSize:22,fontWeight:900,color:"#e2e8f0"}}>{judgeResult?.confidence||"—"}%</div>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"14px 16px"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.88)",letterSpacing:"0.2em",marginBottom:6}}>LEADING AGENT</div>
                    <div style={{fontSize:16,fontWeight:900,color:"#d4a300",letterSpacing:"0.1em"}}>{winnerName}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>
                  {["news","technical","sentiment","risk","devil"].map(id=>{
                    const r=agents?.[id];if(!r)return null;
                    const dec=r.decision==="BULLISH"?"BUY":r.decision==="BEARISH"?"SELL":r.decision;
                    const dc=dec==="BUY"?"#4ade80":dec==="SELL"?"#f87171":"#fbbf24";
                    return(
                      <div key={id} style={{flex:"1 1 70px",background:"rgba(255,255,255,0.03)",border:`1px solid ${dc}33`,borderRadius:6,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.88)",letterSpacing:"0.08em",marginBottom:3}}>{r.agent}</div>
                        <div style={{fontSize:10,fontWeight:700,color:dc}}>{dec}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{height:1,background:"rgba(255,255,255,0.06)",marginBottom:16}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:9,color:"#d4a300",letterSpacing:"0.15em",fontWeight:700}}>BITCORUM.COM</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.88)",letterSpacing:"0.08em"}}>NOT FINANCIAL ADVICE · FOR INFORMATION ONLY</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* COUNCIL HISTORY */}
        {(()=>{
          const filtered = councilHistory.filter(e => e.asset === activeCoin);
          const display = filtered.slice(0, 10);
          const clearAssetHistory = () => {
            setCouncilHistory(prev => {
              const updated = prev.filter(e => e.asset !== activeCoin);
              try { localStorage.setItem("bitcorum_history", JSON.stringify(updated)); } catch {}
              return updated;
            });
          };
          const badgeColor = v => v === "BUY" ? "#4ade80" : v === "SELL" ? "#f87171" : "#fbbf24";
          const badgeRgb  = v => v === "BUY" ? "74,222,128" : v === "SELL" ? "248,113,113" : "251,191,36";
          return (
            <div style={{...S.section, marginTop:4}} className="btc-section">
              {/* Header row with Clear button */}
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 4px"}}>
                <div style={S.sHead}>⬡ COUNCIL HISTORY · {activeCoin}</div>
                {filtered.length > 0 && (
                  <button onClick={clearAssetHistory} style={{fontSize:9, fontWeight:700, letterSpacing:"0.12em", color:"#64748b", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:5, padding:"3px 10px", cursor:"pointer", marginRight:14, transition:"all 0.2s ease"}}
                    onMouseEnter={e=>{e.currentTarget.style.color="#f87171";e.currentTarget.style.borderColor="rgba(248,113,113,0.4)";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="#64748b";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
                    CLEAR
                  </button>
                )}
              </div>
              {filtered.length === 0 ? (
                <div style={{padding:"20px 14px", textAlign:"center", fontSize:11, color:"#475569", letterSpacing:"0.12em"}}>
                  No council history yet for {activeCoin}.
                </div>
              ) : (
                <div style={{padding:"14px", display:"flex", flexDirection:"column", gap:10, maxHeight: filtered.length > 10 ? 520 : "none", overflowY: filtered.length > 10 ? "auto" : "visible"}}>
                  {display.map((entry, i) => {
                    const bc = badgeColor(entry.verdict);
                    const rgb = badgeRgb(entry.verdict);
                    const dt = new Date(entry.timestamp);
                    const dateStr = dt.toLocaleDateString("en-GB", {day:"2-digit", month:"short", year:"numeric"});
                    const timeStr = dt.toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit"});
                    return (
                      <div key={entry.id} className="btc-card-hover" style={{
                        ...S.card,
                        background:`linear-gradient(135deg,rgba(${rgb},0.05),rgba(0,0,0,0.35))`,
                        border:`1px solid rgba(${rgb},0.25)`,
                        transition:"all 0.25s ease",
                        animation: i === 0 ? "fadeInUp 0.5s ease both" : undefined,
                        cursor:"default",
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 30px rgba(${rgb},0.18)`;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
                      >
                        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8}}>
                          <div style={{display:"flex", flexDirection:"column", gap:3}}>
                            <div style={{display:"flex", alignItems:"center", gap:8}}>
                              <span style={{fontSize:13, fontWeight:900, color:"#f1f5f9", letterSpacing:"0.12em"}}>{entry.asset}</span>
                              <span style={{fontSize:9, color:"#64748b", letterSpacing:"0.12em"}}>{dateStr} · {timeStr}</span>
                            </div>
                            <div style={{fontSize:11, color:"#94a3b8", letterSpacing:"0.08em"}}>
                              Price at verdict: <span style={{color:"#e2e8f0", fontWeight:700}}>${Number(entry.price).toLocaleString("en-US",{maximumFractionDigits:0})}</span>
                            </div>
                            <div style={{fontSize:10, color:"#64748b", letterSpacing:"0.08em"}}>
                              Leading agent: <span style={{color:"#94a3b8", fontWeight:600}}>{entry.winningAgent}</span>
                            </div>
                          </div>
                          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5}}>
                            <span style={{fontSize:13, fontWeight:900, padding:"5px 14px", borderRadius:6, border:`1px solid ${bc}`, color:bc, background:`${bc}20`, letterSpacing:"0.15em"}}>{entry.verdict}</span>
                            <span style={{fontSize:10, color:"#64748b", letterSpacing:"0.1em"}}>{entry.confidence}% CONFIDENCE</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* BITCORUM RADIO */}
        <BitcorumRadio btcPrice={btcPrice}/>

        {/* HELP & SUPPORT */}

        {/* HELP & SUPPORT */}
        <div style={{...S.section,marginTop:4}} className="btc-section">
          <div style={S.sHead} className="btc-shead">⬡ HELP & SUPPORT</div>
          <div style={{padding:"18px",display:"flex",flexDirection:"column",gap:16}} className="btc-inner">

            {/* GLOGGS */}
            <div style={S.card} className="btc-card-hover">
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                <RobotFace agentId="gloggs" color="#06b6d4" size={46}/>
                <div>
                  <div style={{...S.aName,color:"#06b6d4"}}>CLEVER GLOGGS</div>
                  <div style={S.aLabel}>HIDDEN CRYPTO KNOWLEDGE & FACTS</div>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.82)",margin:"6px 0 0",lineHeight:1.7}}>Gloggs knows things about crypto that most people never discover — facts, history, stats, research and secrets from the blockchain world.</p>
                </div>
              </div>
              <button onClick={askGloggs} disabled={gloggsLoading} style={{...S.btn,borderColor:"rgba(6,182,212,0.5)",color:"#06b6d4",background:"linear-gradient(135deg,rgba(6,182,212,0.15),rgba(6,182,212,0.05))",opacity:gloggsLoading?0.6:1}}>
                {gloggsLoading?"Gloggs is thinking...":"⬡ TELL ME SOMETHING I DON'T KNOW"}
              </button>
              {gloggsOutput&&<MarkdownText text={gloggsOutput} color="#a5f3fc" borderColor="rgba(6,182,212,0.15)"/>}
            </div>

            {/* MARVIN */}
            <div style={S.card} className="btc-card-hover">
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                <RobotFace agentId="marvin" color="#c084fc" size={46}/>
                <div>
                  <div style={{...S.aName,color:"#c084fc"}}>MARVIN</div>
                  <div style={S.aLabel}>BITCOIN MINING MACHINE SPECIALIST</div>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.82)",margin:"6px 0 0",lineHeight:1.7}}>Marvin knows every ASIC miner on the market — hash rates, prices, where to buy and ROI calculations. Always up to date on the best deals.</p>
                </div>
              </div>
              <button onClick={askMarvin} disabled={marvinLoading} style={{...S.btn,borderColor:"rgba(192,132,252,0.5)",color:"#c084fc",background:"linear-gradient(135deg,rgba(192,132,252,0.15),rgba(192,132,252,0.05))",opacity:marvinLoading?0.6:1}}>
                {marvinLoading?(
                  <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <span>Marvin is checking stock</span>
                    <span style={{display:"inline-flex",gap:3}}>
                      {[0,1,2].map(i=>(
                        <span key={i} style={{width:4,height:4,borderRadius:"50%",background:"#c084fc",display:"inline-block",animation:"marvinDot 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>
                      ))}
                    </span>
                  </span>
                ):"⬡ SHOW ME THE BEST MINING MACHINES"}
              </button>
              {marvinOutput&&<MarkdownText text={marvinOutput} color="#e9d5ff" borderColor="rgba(192,132,252,0.15)"/>}
            </div>

            {/* STAN */}
            <div style={S.card} className="btc-card-hover">
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                <RobotFace agentId="stan" color="#38bdf8" size={46}/>
                <div>
                  <div style={{...S.aName,color:"#38bdf8"}}>STAN</div>
                  <div style={S.aLabel}>TECHNICAL SUPPORT SPECIALIST</div>
                  <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:3}}>
                    <span style={{fontSize:11,color:"rgba(56,189,248,0.9)",letterSpacing:"0.08em",fontWeight:700}}>Fast. Reliable. Expert Support.</span>
                    <span style={{fontSize:11,color:"rgba(56,189,248,0.7)",letterSpacing:"0.08em"}}>24/7 Technical Assistance.</span>
                    <span style={{fontSize:11,color:"rgba(56,189,248,0.7)",letterSpacing:"0.08em"}}>Describe Your Problem. Get Solutions.</span>
                  </div>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.82)",margin:"6px 0 0",lineHeight:1.7}}>Stan fixes things — mining machine overheating, hash rate drops, pool connection issues, firmware problems, crypto website errors. Describe your problem and Stan will walk you through fixing it.</p>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                <input value={stanQ} onChange={e=>setStanQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askStan()} placeholder="Let's Fix It..." style={S.inp}/>
                <button onClick={askStan} disabled={stanLoading} style={{...S.btn,whiteSpace:"nowrap",borderColor:"rgba(56,189,248,0.5)",color:"#38bdf8",background:"linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))",opacity:stanLoading?0.6:1}}>
                  {stanLoading?"...":"ASK STAN"}
                </button>
              </div>
              {/* Initial single response (no thread yet) */}
              {stanOutput&&!stanThread.length&&<MarkdownText text={stanOutput} color="#bae6fd" borderColor="rgba(56,189,248,0.15)"/>}
              {/* Persistent chat thread */}
              {stanThread.length>0&&(
                <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:10}}>
                  {stanThread.map((msg,idx)=>(
                    <div key={idx} style={{
                      padding:"10px 14px",
                      borderRadius:8,
                      background: msg.role==="user"
                        ? "rgba(56,189,248,0.06)"
                        : "rgba(255,255,255,0.03)",
                      border: msg.role==="user"
                        ? "1px solid rgba(56,189,248,0.2)"
                        : "1px solid rgba(255,255,255,0.07)",
                      alignSelf: msg.role==="user" ? "flex-end" : "flex-start",
                      maxWidth:"92%",
                      boxSizing:"border-box",
                    }}>
                      {msg.role==="user"
                        ? <div style={{fontSize:12,color:"#bae6fd",lineHeight:1.7}}>{msg.text}</div>
                        : <MarkdownText text={msg.text} color="#bae6fd" borderColor="transparent"/>
                      }
                    </div>
                  ))}
                  {stanLoading&&(
                  <div style={{fontSize:11,color:"rgba(56,189,248,0.5)",letterSpacing:"0.1em",padding:"4px 14px",display:"flex",alignItems:"center",gap:4}}>
                    <span>Stan is thinking</span>
                    <span style={{display:"inline-flex",gap:3}}>
                      {[0,1,2].map(i=>(
                        <span key={i} style={{
                          width:4,height:4,borderRadius:"50%",
                          background:"rgba(56,189,248,0.7)",
                          display:"inline-block",
                          animation:"stanDot 1.2s ease-in-out infinite",
                          animationDelay:`${i*0.2}s`
                        }}/>
                      ))}
                    </span>
                  </div>
                )}
                  <div ref={stanBottomRef}/>
                  {/* Reply input */}
                  <div style={{display:"flex",gap:10,marginTop:4,borderTop:"1px solid rgba(56,189,248,0.12)",paddingTop:12}}>
                    <input
                      value={stanReplyQ}
                      onChange={e=>setStanReplyQ(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&sendStanReply()}
                      placeholder="Reply to Stan..."
                      style={{...S.inp,borderColor:"rgba(56,189,248,0.2)"}}
                    />
                    <button
                      onClick={sendStanReply}
                      disabled={stanLoading||!stanReplyQ.trim()}
                      style={{...S.btn,whiteSpace:"nowrap",borderColor:"rgba(56,189,248,0.5)",color:"#38bdf8",background:"linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))",opacity:(stanLoading||!stanReplyQ.trim())?0.5:1,minHeight:48}}
                    >
                      {stanLoading?"...":"SEND"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAUL */}
        <div style={S.section} className="btc-section">
          <div style={S.sHead} className="btc-shead">⬡ OUR MISSION</div>
          <div style={{padding:"20px"}} className="btc-inner">
            <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:16}}>
              <RobotFace agentId="paul" color="#d4a300" size={52}/>
              <div>
                <div style={{...S.aName,color:"#d4a300",fontSize:15}}>PAUL</div>
                <div style={S.aLabel}>FOUNDER & CREATOR OF BITCORUM</div>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.82)",margin:"8px 0 0",lineHeight:1.75,maxWidth:520}}>
                  Bitcorum brings together specialized AI agents that debate, analyze, and deliver real-time actionable crypto intelligence. Our mission is to make advanced market analysis accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{margin:"0 16px 28px",padding:"18px 22px",background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12}} className="btc-section btc-inner">
          <div style={{fontSize:12,fontWeight:700,color:"#f87171",letterSpacing:"0.2em",marginBottom:8}}>⚠ IMPORTANT DISCLAIMER</div>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.85)",lineHeight:1.85,margin:0}}>
            Bitcorum is <strong style={{color:"#f87171"}}>not financial advice</strong>. The AI agents on this platform provide discussion, analysis and debate for informational and entertainment purposes only. Any decisions you make based on their outputs are entirely your own responsibility. Bitcorum, its creator and its agents accept <strong>no liability</strong> whatsoever for financial losses. <strong style={{color:"#f87171"}}>Cryptocurrency is highly volatile — you can lose money.</strong> Always conduct your own research and consult a qualified financial adviser before investing.
          </p>
        </div>

        {/* FOOTER */}
        <footer style={{margin:"0 16px",padding:"30px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(212,163,0,0.15)",borderRadius:14}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:28,marginBottom:26,paddingBottom:22,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
            {/* CONTACT US */}
            <div style={{flex:"1 1 220px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#d4a300",letterSpacing:"0.2em",marginBottom:12}}>CONTACT US</div>
              <p style={{fontSize:12,color:"#e2e8f0",lineHeight:1.8,margin:"0 0 12px"}}>
                Have a question, suggestion or partnership enquiry? We'd love to hear from you.
              </p>
              <a href="mailto:contact@bitcorum.com" style={{fontSize:12,color:"#d4a300",textDecoration:"none",letterSpacing:"0.05em",display:"flex",alignItems:"center",gap:8}}>
                ✉ contact@bitcorum.com
              </a>
            </div>
            {/* ABOUT PAUL */}
            <div style={{flex:"1 1 200px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#d4a300",letterSpacing:"0.2em",marginBottom:12}}>FOUNDER</div>
              <p style={{fontSize:12,color:"#e2e8f0",lineHeight:1.8,margin:"0 0 10px"}}>
                Paul Frederick — creator, founder and driving force behind Bitcorum. Built to give everyone access to multi-agent AI crypto intelligence.
              </p>
              <a href="https://facebook.com/paulfrederickmusic" target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#d4a300",textDecoration:"none",letterSpacing:"0.05em"}}>
                ⬡ Facebook: paulfrederickmusic ↗
              </a>
            </div>
            {/* OUR AGENTS */}
            <div style={{flex:"1 1 180px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#d4a300",letterSpacing:"0.2em",marginBottom:12}}>OUR AGENTS</div>
              <div style={{fontSize:12,color:"#e2e8f0",lineHeight:2.1}}>
                NOVA · News Analyst<br/>
                AXIOM · Tech Analyst<br/>
                PULSE · Sentiment Scout<br/>
                AEGIS · Risk Manager<br/>
                ROGUE · Devil's Advocate<br/>
                VERDICT · Chief Strategist
              </div>
            </div>
          </div>

          {/* LEGAL LINKS */}
          <div style={{display:"flex",justifyContent:"center",gap:24,paddingBottom:20,borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:20,flexWrap:"wrap"}}>
            {[["Privacy Policy","privacy"],["Cookie Policy","cookie"],["Terms of Service","terms"]].map(([label,key])=>(
              <button key={key} onClick={()=>setLegalModal(key)} style={{background:"transparent",border:"none",color:"rgba(212,163,0,0.7)",fontSize:11,letterSpacing:"0.1em",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline",textUnderlineOffset:3,padding:0}}>
                {label}
              </button>
            ))}
          </div>

          <div style={{textAlign:"center",marginBottom:24}}>
            <img
              src={FOOTER_LOGO_SRC}
              alt="Bitcorum"
              style={{
                width:"clamp(110px,15vw,140px)",
                height:"auto",
                display:"block",
                margin:"0 auto 24px",
                filter:"drop-shadow(0 0 20px rgba(212,163,0,0.4))",
              }}
            />
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"#cbd5e1",letterSpacing:"0.15em",marginBottom:6}}>
              <div style={{whiteSpace:"nowrap"}} className="btc-nowrap">WEBSITE CREATED BY</div>
              <div style={{whiteSpace:"nowrap"}} className="btc-nowrap">
                <a href="https://nightskystudio.co.uk" target="_blank" rel="noopener noreferrer" style={{color:"#d4a300",textDecoration:"none"}}>
                  NIGHTSKYSTUDIO.CO.UK ↗
                </a>
              </div>
              <div style={{whiteSpace:"nowrap"}} className="btc-nowrap">WITH AI COLLABORATION</div>
            </div>
            <div style={{fontSize:"clamp(9px,2.5vw,11px)",color:"#cbd5e1",letterSpacing:"0.15em",whiteSpace:"nowrap"}}>
              © 2026 BITCORUM · ALL RIGHTS RESERVED
            </div>
          </div>
        </footer>

      </div>

      {sharedImage && (
        <div
          onClick={() => setSharedImage(null)}
          style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,0.92)",padding:16,overflowY:"auto"}}
        >
          <div onClick={e => e.stopPropagation()} style={{width:"100%",maxWidth:520,display:"flex",flexDirection:"column",alignItems:"center",paddingBottom:24,margin:"auto"}}>
            <img
              src={sharedImage}
              alt="Council Verdict"
              style={{maxWidth:"100%",width:"100%",height:"auto",borderRadius:16,border:"1px solid rgba(212,163,0,0.4)",boxShadow:"0 0 60px rgba(0,0,0,0.8)",display:"block"}}
            />
            <button
              onClick={() => setSharedImage(null)}
              style={{marginTop:16,width:"100%",borderRadius:12,border:"1px solid rgba(212,163,0,0.3)",background:"rgba(212,163,0,0.1)",padding:"14px 20px",minHeight:48,color:"#d4a300",fontFamily:"'IBM Plex Mono','Courier New',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.2em",cursor:"pointer"}}
            >
              CLOSE
            </button>
            <p style={{marginTop:12,textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.88)",fontFamily:"'IBM Plex Mono','Courier New',monospace",letterSpacing:"0.08em",whiteSpace:"normal",maxWidth:280}}>
              Screenshot or save to share your Bitcorum verdict.
            </p>
          </div>
        </div>
      )}

        {/* LEGAL MODAL */}
        {legalModal && (() => {
          const docs = {
            privacy: {
              title: "PRIVACY POLICY",
              content: `Last updated: June 2026

1. WHO WE ARE
Bitcorum is a multi-agent AI crypto intelligence platform operated by Paul Frederick trading as Bitcorum.
Contact: contact@bitcorum.com | Website: bitcorum.com

2. AI GENERATED CONTENT
Bitcorum provides AI-generated analysis, insights and opinions for informational purposes only. Content generated by Bitcorum's AI agents does not constitute financial, investment, legal or tax advice. Users should conduct their own independent research before making any financial decisions.

3. FINANCIAL RISK DISCLAIMER
Cryptocurrency markets are highly volatile and involve significant financial risk. Past performance does not guarantee future results. Users are solely responsible for any investment decisions made based on information provided by Bitcorum.

4. LIMITATION OF LIABILITY
To the maximum extent permitted by law, Bitcorum's total liability arising from use of the platform shall not exceed £100 or the amount paid by the user to Bitcorum during the previous 12 months, whichever is greater.

5. WHAT DATA WE COLLECT
• Council verdict history stored locally on your device (localStorage) — this never leaves your browser
• When you create an account: your chosen username and email address
• Bitcorum may collect anonymised usage analytics in the future to improve the platform. Any such collection will be disclosed in updates to this policy

6. HOW WE USE YOUR DATA
• To provide the Bitcorum service
• To personalise your experience (username, verdict history)
• We do not sell your data to third parties
• We do not use your data for advertising

7. LOCAL STORAGE
Bitcorum uses browser local storage to save your council verdict history on your own device. This data is stored locally and is not transmitted to our servers. You can clear it at any time by clearing your browser site data.

8. THIRD PARTY SERVICES
• Anthropic — AI agent responses (anthropic.com/privacy)
• Binance — live market price data (binance.com/en/privacy)
• CoinGecko — live market price data (coingecko.com/en/privacy)
• Vercel — website hosting (vercel.com/legal/privacy-policy)

No personal data is shared with these services beyond what is necessary to provide the platform.

9. YOUR RIGHTS (GDPR)
As a UK/EU user you have the right to access, correct or request deletion of your personal data. Contact us at contact@bitcorum.com to exercise any of these rights. We will respond within 30 days.

10. DATA RETENTION
Account data is retained for as long as your account is active. You may request deletion at any time by contacting contact@bitcorum.com.

11. CHILDREN
Bitcorum is not intended for users under the age of 18. Cryptocurrency involves significant financial risk and is not suitable for minors.

12. TERMS OF SERVICE
Use of Bitcorum is subject to our Terms of Service available at bitcorum.com/terms.

13. CHANGES
We may update this policy as Bitcorum develops. The date at the top reflects the latest version.

14. CONTACT
contact@bitcorum.com`
            },
            cookie: {
              title: "COOKIE POLICY",
              content: `Last updated: June 2026

WHAT WE USE
Bitcorum uses minimal cookies and browser storage technologies required for functionality, security and user preferences.

BROWSER LOCAL STORAGE
We use browser localStorage to store your council verdict history and preferences directly on your device. This data never leaves your browser and is not accessible by Bitcorum or any third party.

WHAT IS STORED
• Your council verdict history (asset analysed, verdict given, date and time)
• Your selected preferences within the platform

WHY WE STORE IT
To provide you with a personal verdict history and a consistent experience each time you visit.

HOW TO CLEAR IT
Clear your browser's site data or local storage in your browser settings at any time.

THIRD PARTY COOKIES
Vercel, our hosting provider, may set cookies for performance and security purposes. Please refer to Vercel's cookie policy at vercel.com/legal/privacy-policy for details.

CONTACT
contact@bitcorum.com`
            },
            terms: {
              title: "TERMS OF SERVICE",
              content: `Last updated: June 2026

1. ACCEPTANCE OF TERMS
By accessing or using Bitcorum (bitcorum.com) you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.

2. ABOUT BITCORUM
Bitcorum is a multi-agent AI crypto intelligence platform operated by Paul Frederick trading as Bitcorum. The platform provides AI-generated market analysis, insights and verdicts for informational and educational purposes only.

3. NOT FINANCIAL ADVICE
Bitcorum is not a financial adviser, broker, dealer or investment adviser. Nothing on this platform constitutes financial, investment, legal or tax advice. All content is provided for informational and entertainment purposes only. You must make your own independent financial decisions.

4. NO WARRANTIES
Bitcorum makes no warranties, express or implied, regarding the accuracy, reliability, completeness, availability or suitability of any content, verdicts, analysis or market data provided through the platform. Use of Bitcorum is entirely at your own risk.

5. NO LIABILITY FOR FINANCIAL LOSS
Bitcorum, its creator and its AI agents accept no liability whatsoever for financial losses, investment losses, missed trading opportunities, inaccurate market data, or any reliance placed on AI-generated verdicts or analysis. Cryptocurrency trading involves substantial risk of loss.

6. LIMITATION OF LIABILITY
To the maximum extent permitted by law, Bitcorum's total liability arising from use of the platform shall not exceed £100 or the amount paid by the user to Bitcorum during the previous 12 months, whichever is greater.

7. AI GENERATED CONTENT
Content on Bitcorum is generated by artificial intelligence. Agent verdicts may be inaccurate or incomplete, should not be the sole basis for any financial decision, and are not predictions or guarantees of future market performance.

8. USER ACCOUNTS
When you create a Bitcorum account you agree to provide accurate information, keep your credentials secure, not share your account, be responsible for all activity under your account, and be at least 18 years of age. Bitcorum reserves the right to suspend or terminate accounts that violate these terms.

9. ACCEPTABLE USE
You agree not to use Bitcorum for any unlawful purpose, interfere with the platform, scrape or reproduce content without permission, impersonate others, or reverse engineer any part of the platform.

10. INTELLECTUAL PROPERTY
All content, design, code, agent names, branding and features of Bitcorum are the intellectual property of Paul Frederick trading as Bitcorum. You may not reproduce or distribute without prior written permission.

11. THIRD PARTY SERVICES
Bitcorum connects to Anthropic, Binance, CoinGecko and Vercel. Bitcorum is not responsible for the availability, accuracy or content of these third party services.

12. MARKET DATA
Live market data is provided by third party sources and may be delayed or inaccurate. Bitcorum does not guarantee the accuracy or timeliness of any market data.

13. FUTURE PAID SERVICES
Certain features may require payment or subscription in the future. Additional terms will apply to such services and will be communicated clearly before any charges are made.

14. PLATFORM AVAILABILITY
Bitcorum is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted or error-free service and reserve the right to modify or discontinue any part of the platform at any time.

15. PRIVACY
Use of Bitcorum is also governed by our Privacy Policy and Cookie Policy available at bitcorum.com.

16. CHANGES TO TERMS
We reserve the right to update these Terms at any time. Continued use constitutes acceptance of updated terms.

17. GOVERNING LAW
These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.

18. CONTACT
contact@bitcorum.com`
            }
          };
          const doc = docs[legalModal];
          return (
            <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:9999,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px",boxSizing:"border-box",overflowY:"auto"}}>
              <div style={{background:"#0a0a0a",border:"1px solid rgba(212,163,0,0.3)",borderRadius:14,maxWidth:680,width:"100%",padding:"28px 24px",boxSizing:"border-box",marginTop:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,borderBottom:"1px solid rgba(212,163,0,0.2)",paddingBottom:16}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#d4a300",letterSpacing:"0.2em"}}>⬡ {doc.title}</div>
                  <button onClick={()=>setLegalModal(null)} style={{background:"transparent",border:"1px solid rgba(212,163,0,0.3)",borderRadius:6,color:"#d4a300",cursor:"pointer",padding:"6px 14px",fontSize:11,letterSpacing:"0.1em",fontFamily:"inherit"}}>✕ CLOSE</button>
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.82)",lineHeight:1.9,whiteSpace:"pre-line",letterSpacing:"0.02em"}}>
                  {doc.content}
                </div>
                <div style={{marginTop:24,textAlign:"center"}}>
                  <button onClick={()=>setLegalModal(null)} style={{background:"rgba(212,163,0,0.1)",border:"1px solid rgba(212,163,0,0.4)",borderRadius:8,color:"#d4a300",cursor:"pointer",padding:"10px 28px",fontSize:11,letterSpacing:"0.15em",fontFamily:"inherit"}}>CLOSE</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* COOKIE CONSENT BANNER */}
        {!cookieConsent && (
          <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:9998,background:"#0a0a0a",borderTop:"1px solid rgba(212,163,0,0.35)",padding:"16px 20px",boxSizing:"border-box",boxShadow:"0 -4px 24px rgba(0,0,0,0.6)"}}>
            <div style={{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",lineHeight:1.7,letterSpacing:"0.02em"}}>
                Bitcorum uses minimal local storage to save your council history and preferences. By continuing to use this site, you accept our{" "}
                <button onClick={()=>setLegalModal("cookie")} style={{background:"none",border:"none",color:"#d4a300",textDecoration:"underline",textUnderlineOffset:2,cursor:"pointer",fontFamily:"inherit",fontSize:12,padding:0}}>Cookie Policy</button>.
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button onClick={acceptCookies} style={{flex:"1 1 140px",background:"linear-gradient(135deg,rgba(212,163,0,0.2),rgba(212,163,0,0.08))",border:"1px solid #d4a300",borderRadius:8,color:"#d4a300",cursor:"pointer",padding:"10px 20px",fontSize:11,fontWeight:700,letterSpacing:"0.12em",fontFamily:"inherit"}}>
                  ACCEPT
                </button>
                <button onClick={()=>setLegalModal("cookie")} style={{flex:"1 1 140px",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"rgba(255,255,255,0.6)",cursor:"pointer",padding:"10px 20px",fontSize:11,letterSpacing:"0.1em",fontFamily:"inherit"}}>
                  COOKIE POLICY
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
    </MarketContext.Provider>
  );
}
