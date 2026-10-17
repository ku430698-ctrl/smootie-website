/**
 * MongoDB Seeding & Verification Script for Kamal Verma Platform
 * 
 * Usage:
 *   node scripts/seed-mongo.js
 * 
 * Reads MONGODB_URI from .env.local or defaults to mongodb://localhost:27017/kamalverma_db
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Load .env.local if present
const envPath = path.join(__dirname, "..", ".env.local");
let mongoUri = "mongodb://localhost:27017/kamalverma_db";
let dbName = "kamalverma_db";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("MONGODB_URI=")) {
      mongoUri = trimmed.replace("MONGODB_URI=", "").trim();
    }
    if (trimmed.startsWith("MONGODB_DB=")) {
      dbName = trimmed.replace("MONGODB_DB=", "").trim();
    }
  });
}

const sampleInsights = [
  {
    slug: "understanding-price-action-market-structure",
    title: "Understanding Price Action & Market Structure Across Equities, Forex, and Crypto",
    category: "Index Analysis",
    date: "Educational Guide",
    readTime: "6 min read",
    summary: "How market structure principles—higher highs, higher lows, and liquidity shifts—apply uniformly whether you trade Indian stocks, currency pairs, or digital assets.",
    tags: ["PriceAction", "TechnicalAnalysis", "MarketStructure", "Educational"],
    featured: true,
    content: [
      "At its core, price action is the graphical representation of collective human psychology and order flow over time.",
      "Regardless of whether an asset is an equity like Nifty 50, a currency pair like EUR/USD, or a cryptocurrency like Bitcoin, price moves in three fundamental phases: Trend (Expansion), Consolidation (Accumulation/Distribution), and Retracement (Pullback).",
      "A healthy uptrend is defined by sequential Higher Highs (HH) and Higher Lows (HL). When a prior swing low is broken on high volume, it signals a potential shift in market character.",
      "The goal of technical analysis is not to predict the future with certainty, but to identify zones where risk is defined and reward potential is favorable.",
    ],
  },
  {
    slug: "forex-sessions-and-volatility-management",
    title: "The Forex Session Dynamic: Managing Volatility Across London and New York",
    category: "Options Strategies",
    date: "Educational Guide",
    readTime: "5 min read",
    summary: "An educational overview of how global trading sessions overlap to create liquidity windows in major currency pairs, and why risk rules must adapt.",
    tags: ["Forex", "CurrencyTrading", "Volatility", "RiskManagement"],
    featured: true,
    content: [
      "The foreign exchange market operates 24 hours a day, 5 days a week, but volatility is not evenly distributed across the clock.",
      "The highest liquidity typically occurs during the London-New York overlap (around 1:30 PM to 4:30 PM GMT / evening IST), where major economic releases and institutional cross-border settlements take place.",
      "Understanding session timing helps traders avoid trading during low-liquidity periods where spreads widen unexpectedly.",
      "Responsible forex education emphasizes strict position sizing based on pips at risk rather than arbitrary leverage multiples.",
    ],
  },
  {
    slug: "cryptocurrency-risk-management-volatility",
    title: "Cryptocurrency Risk Architecture: Surviving Volatility and Protecting Capital",
    category: "Swing Trading",
    date: "Educational Guide",
    readTime: "7 min read",
    summary: "Key principles of capital preservation when studying digital asset charts with 10x higher average true range than traditional markets.",
    tags: ["Crypto", "RiskManagement", "Drawdown", "Discipline"],
    featured: false,
    content: [
      "Cryptocurrencies exhibit significantly higher Average True Range (ATR) and volatility compared to traditional equities and fiat currencies.",
      "When volatility increases, position sizes must mathematically decrease to maintain the same monetary risk per trade.",
      "For example, if your standard risk tolerance is 1% of capital, a 5% stop loss in crypto requires half the capital allocation of a 2.5% stop loss in equities.",
      "Capital protection is the prerequisite for longevity. Without risk limits, even nine profitable trades can be erased by one unmanaged loss.",
    ],
  },
  {
    slug: "trading-psychology-fomo-discipline",
    title: "Trading Psychology: Conquering FOMO, Revenge Trading, and Over-Leveraging",
    category: "Trading Psychology",
    date: "Educational Guide",
    readTime: "5 min read",
    summary: "Why emotional discipline and a pre-defined trade plan matter far more than finding a magical indicator.",
    tags: ["Psychology", "Discipline", "Mindset", "Consistency"],
    featured: false,
    content: [
      "Most developing traders believe their struggle is technical, but in reality, over 80% of unforced trading errors stem from emotional distress.",
      "Fear of Missing Out (FOMO) causes traders to chase extended candles after the move has already transpired, leading to high-risk entries.",
      "Revenge trading happens when a loss triggers an emotional need to be right, prompting immediate impulsive re-entries with doubled size.",
      "A disciplined trader views every trade as merely one execution among a statistical series of hundreds, detaching ego from any individual outcome.",
    ],
  },
];

async function seedDatabase() {
  console.log("Connecting to MongoDB at:", mongoUri);
  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 4000 });

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB server successfully!");
    const db = client.db(dbName);

    // 1. Inquiries Collection & Index
    const inquiriesCol = db.collection("inquiries");
    await inquiriesCol.createIndex({ createdAt: -1 });
    await inquiriesCol.createIndex({ phone: 1 });
    console.log("✓ Verified collection: 'inquiries' (Indexes created)");

    // 2. Subscribers Collection & Unique Index
    const subscribersCol = db.collection("subscribers");
    await subscribersCol.createIndex({ email: 1 }, { unique: true });
    console.log("✓ Verified collection: 'subscribers' (Unique email index created)");

    // 3. Insights Collection & Seeding
    const insightsCol = db.collection("insights");
    await insightsCol.createIndex({ slug: 1 }, { unique: true });
    await insightsCol.createIndex({ category: 1 });

    const existingCount = await insightsCol.countDocuments();
    if (existingCount === 0) {
      await insightsCol.insertMany(sampleInsights);
      console.log(`✓ Seeded ${sampleInsights.length} educational insights into 'insights' collection`);
    } else {
      console.log(`✓ Collection 'insights' already has ${existingCount} documents`);
    }

    console.log("\n========================================================");
    console.log("MongoDB setup & seeding completed successfully!");
    console.log(`Database: ${dbName}`);
    console.log("========================================================\n");
  } catch (error) {
    console.warn("Could not connect to MongoDB server:", error.message);
    console.log("Tip: If using MongoDB Atlas, make sure MONGODB_URI in .env.local has your correct username and password.");
  } finally {
    await client.close();
  }
}

seedDatabase();
