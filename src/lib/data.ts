import {
  MarketInsight,
  ProgramService,
  GlobalSettings,
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  ServiceItem,
  PortfolioItem,
} from "./types";

export const EXPERT_INFO = {
  name: "Kamal Verma",
  title: "Trading Mentor, Financial Markets Educator & Market Analyst",
  experienceYears: 6,
  studentsCount: "1,000+",
  phone: "9053216093",
  markets: ["Stock Market", "Forex", "Cryptocurrency"],
  headline: "Learn the Markets. Build Your Trading Knowledge.",
  bioIntro: "I'm Kamal Verma, a trading mentor and financial markets educator specializing in stock market, forex, and cryptocurrency trading. With six years of stated experience and more than 1,000 people guided and taught, my focus is on financial-market education, technical analysis, market understanding, and disciplined learning.",
  mission: "To make financial-market education more accessible through structured learning, technical analysis, mentorship, and responsible trading practices.",
  vision: "To build a recognized and trusted financial education brand that helps individuals develop market knowledge, analytical thinking, and a disciplined approach to financial markets.",
  coreValues: [
    { title: "Financial Education", desc: "Prioritizing deep foundational knowledge and sustainable skill development over quick-fix speculation." },
    { title: "Professionalism & Transparency", desc: "Honest communication with zero fabricated promises, unrealistic returns, or misleading claims." },
    { title: "Analytical Thinking", desc: "Teaching objective chart analysis, price action, and market structure rather than emotional guesswork." },
    { title: "Risk Awareness & Discipline", desc: "Instilling stop-loss discipline, position sizing, capital protection, and emotional mastery from day one." },
    { title: "Continuous Learning", desc: "Adapting to evolving global markets across equities, currencies, and digital assets." },
    { title: "Realistic Expectations", desc: "Treating trading as an intellectual discipline that requires patience, practice, and emotional maturity." }
  ],
};

export const MULTI_MARKET_TICKERS = [
  // Stock Market (India & Global)
  { symbol: "NIFTY 50", market: "Stocks", price: "24,850.20", change: "+0.58%", positive: true },
  { symbol: "BANK NIFTY", market: "Stocks", price: "53,390.40", change: "+0.85%", positive: true },
  { symbol: "SENSEX", market: "Stocks", price: "81,420.15", change: "+0.52%", positive: true },
  // Forex Market
  { symbol: "EUR/USD", market: "Forex", price: "1.0874", change: "+0.22%", positive: true },
  { symbol: "GBP/USD", market: "Forex", price: "1.2985", change: "-0.15%", positive: false },
  { symbol: "USD/INR", market: "Forex", price: "84.05", change: "+0.08%", positive: true },
  // Cryptocurrency Market
  { symbol: "BTC/USDT", market: "Crypto", price: "$67,420", change: "+2.45%", positive: true },
  { symbol: "ETH/USDT", market: "Crypto", price: "$2,640", change: "+1.80%", positive: true },
  { symbol: "SOL/USDT", market: "Crypto", price: "$158.50", change: "+4.12%", positive: true },
];

export const PRIMARY_MARKET_SPECIALTIES = [
  {
    market: "Stock Market Trading",
    tagline: "Equities & Index Dynamics",
    description: "Education covering stock market fundamentals, price movements, candlestick charts, technical indicators, market trends, support and resistance, and structured trading strategies.",
    points: [
      "Understanding market structure and price trends",
      "Support and resistance identification",
      "Candlestick patterns and price action setups",
      "Index dynamics (Nifty 50, Bank Nifty, and Global Indices)",
    ],
  },
  {
    market: "Forex Trading",
    tagline: "Global Currency Pairs",
    description: "Comprehensive education about currency pairs, pips, spreads, leverage, global forex market sessions, technical analysis, and rigorous risk management across majors and crosses.",
    points: [
      "Major, minor, and exotic currency pair behavior",
      "Understanding spreads, pips, and margin leverage",
      "Global trading sessions (London, New York, Asian)",
      "Multi-timeframe trend alignment and risk controls",
    ],
  },
  {
    market: "Cryptocurrency Trading",
    tagline: "Digital Assets & Volatility Management",
    description: "Education on cryptocurrency market cycles, digital assets, volatility dynamics, chart analysis, order flow concepts, and navigating high-volatility environments safely.",
    points: [
      "Bitcoin and digital asset market structure",
      "Chart analysis across high-volatility instruments",
      "Understanding liquidity cycles and breakout dynamics",
      "Managing severe drawdown risks and position limits",
    ],
  },
];

export const EDUCATIONAL_PILLARS = [
  {
    title: "Technical Analysis",
    description: "Chart interpretation, candlestick patterns, trend analysis, support and resistance, price action, breakouts, market structure, and technical indicators.",
  },
  {
    title: "Market Analysis",
    description: "Educational analysis of financial-market movements, price trends, chart patterns, and relevant macroeconomic developments.",
  },
  {
    title: "Trading Psychology",
    description: "Understanding emotional discipline, patience, consistency, decision-making, and conquering psychological hurdles like FOMO and revenge trading.",
  },
  {
    title: "Risk Management",
    description: "Understanding stop-loss concepts, position sizing, risk-to-reward ratios, drawdowns, capital protection, and responsible risk-taking.",
  },
];

export const SERVICES_LIST = [
  {
    id: "trading-education",
    title: "Trading Education",
    subtitle: "Stock, Forex & Crypto",
    description: "Comprehensive educational guidance for individuals seeking to understand stock, forex, and cryptocurrency markets through structured modules.",
    scope: "Foundational & Intermediate Market Concepts",
    features: [
      "Core market mechanics and order execution concepts",
      "Understanding price action, candlestick anatomy, and chart patterns",
      "Multi-market orientation: Equities, Currencies, and Digital Assets",
      "Study material, recorded educational modules, and chart assignments",
    ],
  },
  {
    id: "trading-mentorship",
    title: "Trading Mentorship",
    subtitle: "Structured Guidance",
    description: "Interactive educational guidance designed to help learners build their market knowledge, analytical skills, and emotional discipline progressively.",
    scope: "Step-by-Step Practical Learning",
    features: [
      "Structured curriculum tailored to developing disciplined thinking",
      "Weekly educational review sessions and chart discussion",
      "Guidance on building a personal trading plan and trade journal",
      "Direct interactive Q&A sessions on technical setups",
    ],
  },
  {
    id: "technical-analysis",
    title: "Technical Analysis Education",
    subtitle: "Chart Reading Mastery",
    description: "In-depth education on reading charts objectively using price action, market structure, trend lines, support/resistance, and volume confirmation.",
    scope: "Analytical Frameworks",
    features: [
      "Identifying high-probability support and resistance zones",
      "Spotting authentic breakouts versus false exhaustion moves",
      "Multiple timeframe analysis (Daily, Hourly, and Execution timeframes)",
      "Indicator application: Moving averages, volume profile, and momentum oscillators",
    ],
  },
  {
    id: "market-analysis",
    title: "Market Analysis & Commentary",
    subtitle: "Educational Case Studies",
    description: "Educational commentary and chart breakdowns analyzing ongoing market trends across stocks, currencies, and cryptocurrencies.",
    scope: "Ongoing Learning & Context",
    features: [
      "Regular chart breakdowns demonstrating technical concepts in active markets",
      "Historical case studies analyzing past market moves and setups",
      "Discussion of risk factors, invalidation levels, and trend shifts",
      "Educational focus: Understanding why prices move rather than prediction",
    ],
  },
];

export const EDUCATIONAL_INSIGHTS: MarketInsight[] = [
  {
    id: "insight-1",
    slug: "understanding-price-action-market-structure",
    title: "Understanding Price Action & Market Structure Across Equities, Forex, and Crypto",
    category: "Index Analysis",
    date: "Educational Guide",
    readTime: "6 min read",
    summary: "How market structure principles—higher highs, higher lows, and liquidity shifts—apply uniformly whether you trade Indian stocks, currency pairs, or digital assets.",
    tags: ["PriceAction", "TechnicalAnalysis", "MarketStructure", "Educational"],
    content: [
      "At its core, price action is the graphical representation of collective human psychology and order flow over time.",
      "Regardless of whether an asset is an equity like Nifty 50, a currency pair like EUR/USD, or a cryptocurrency like Bitcoin, price moves in three fundamental phases: Trend (Expansion), Consolidation (Accumulation/Distribution), and Retracement (Pullback).",
      "A healthy uptrend is defined by sequential Higher Highs (HH) and Higher Lows (HL). When a prior swing low is broken on high volume, it signals a potential shift in market character.",
      "The goal of technical analysis is not to predict the future with certainty, but to identify zones where risk is defined and reward potential is favorable.",
    ],
  },
  {
    id: "insight-2",
    slug: "forex-sessions-and-volatility-management",
    title: "The Forex Session Dynamic: Managing Volatility Across London and New York",
    category: "Options Strategies",
    date: "Educational Guide",
    readTime: "5 min read",
    summary: "An educational overview of how global trading sessions overlap to create liquidity windows in major currency pairs, and why risk rules must adapt.",
    tags: ["Forex", "CurrencyTrading", "Volatility", "RiskManagement"],
    content: [
      "The foreign exchange market operates 24 hours a day, 5 days a week, but volatility is not evenly distributed across the clock.",
      "The highest liquidity typically occurs during the London-New York overlap (around 1:30 PM to 4:30 PM GMT / evening IST), where major economic releases and institutional cross-border settlements take place.",
      "Understanding session timing helps traders avoid trading during low-liquidity periods where spreads widen unexpectedly.",
      "Responsible forex education emphasizes strict position sizing based on pips at risk rather than arbitrary leverage multiples.",
    ],
  },
  {
    id: "insight-3",
    slug: "cryptocurrency-risk-management-volatility",
    title: "Cryptocurrency Risk Architecture: Surviving Volatility and Protecting Capital",
    category: "Swing Trading",
    date: "Educational Guide",
    readTime: "7 min read",
    summary: "Key principles of capital preservation when studying digital asset charts with 10x higher average true range than traditional markets.",
    tags: ["Crypto", "RiskManagement", "Drawdown", "Discipline"],
    content: [
      "Cryptocurrencies exhibit significantly higher Average True Range (ATR) and volatility compared to traditional equities and fiat currencies.",
      "When volatility increases, position sizes must mathematically decrease to maintain the same monetary risk per trade.",
      "For example, if your standard risk tolerance is 1% of capital, a 5% stop loss in crypto requires half the capital allocation of a 2.5% stop loss in equities.",
      "Capital protection is the prerequisite for longevity. Without risk limits, even nine profitable trades can be erased by one unmanaged loss.",
    ],
  },
  {
    id: "insight-4",
    slug: "trading-psychology-fomo-discipline",
    title: "Trading Psychology: Conquering FOMO, Revenge Trading, and Over-Leveraging",
    category: "Trading Psychology",
    date: "Educational Guide",
    readTime: "5 min read",
    summary: "Why emotional discipline and a pre-defined trade plan matter far more than finding a magical indicator.",
    tags: ["Psychology", "Discipline", "Mindset", "Consistency"],
    content: [
      "Most developing traders believe their struggle is technical, but in reality, over 80% of unforced trading errors stem from emotional distress.",
      "Fear of Missing Out (FOMO) causes traders to chase extended candles after the move has already transpired, leading to high-risk entries.",
      "Revenge trading happens when a loss triggers an emotional need to be right, prompting immediate impulsive re-entries with doubled size.",
      "A disciplined trader views every trade as merely one execution among a statistical series of hundreds, detaching ego from any individual outcome.",
    ],
  },
];

export const BRAND_FAQS = [
  {
    q: "Who is Kamal Verma?",
    a: "Kamal Verma is a trading mentor, financial markets educator, and market analyst with six years of experience across stock market, forex, and cryptocurrency trading. He has guided and taught more than 1,000 people with a strong emphasis on structured learning, technical analysis, and risk management.",
  },
  {
    q: "What markets does Kamal Verma focus on?",
    a: "Kamal specializes in educational guidance across three primary markets: Stock Market (Indian equities & indices), Forex (major currency pairs & sessions), and Cryptocurrency (digital assets & volatility dynamics).",
  },
  {
    q: "Do you guarantee trading returns or profits?",
    a: "No. Kamal Verma operates strictly as a financial markets educator and mentor. Financial markets carry risk, and losses are possible. Educational material does not guarantee profits, and Kamal Verma does not promise guaranteed returns or risk-free trading.",
  },
  {
    q: "Are trading signals or portfolio management offered?",
    a: "No. Services such as trading signals, portfolio management, or personalized investment advisory are not offered. Any such proposed services require formal regulatory authorization and verification before launch. Kamal Verma's brand focuses strictly on education and mentorship.",
  },
  {
    q: "What is Kamal Verma's educational approach?",
    a: "Kamal's methodology focuses on four core pillars: Technical Analysis (chart reading & price action), Market Analysis (macro & sector context), Trading Psychology (emotional discipline), and Risk Management (position sizing, stop-loss discipline, and capital preservation).",
  },
  {
    q: "How can I contact Kamal Verma for mentorship inquiries?",
    a: "You can reach out directly via phone/WhatsApp at 9053216093 or submit an inquiry through the Contact & Booking form on this website.",
  },
];

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  websiteName: "Kamal Verma",
  logoText: "Kamal Verma",
  logoSubtext: "Trading Mentor & Educator",
  phone: "9053216093",
  email: "contact@kamalverma.com",
  whatsapp: "9053216093",
  location: "Delhi NCR / Haryana, India",
  socialLinks: {
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    telegram: "https://t.me",
    youtube: "https://youtube.com",
    instagram: "https://instagram.com",
  },
  navItems: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/contact", label: "Contact" },
  ],
  footerText: "Trading mentor & financial markets educator. 6 years experience. 1,000+ people guided.",
  seo: {
    home: {
      title: "Kamal Verma | Professional Trading Mentor & Market Analyst",
      description: "Learn stock market, forex, and cryptocurrency trading with structured mentorship, price action analysis, and risk management.",
    },
    about: {
      title: "About Kamal Verma | Trading Mentor & Financial Markets Educator",
      description: "Discover Kamal Verma's 6-year trading journey, core philosophy, and disciplined educational mission.",
    },
    services: {
      title: "Trading Mentorship Programs & Curriculum | Kamal Verma",
      description: "Structured educational programs for stock market, forex, and cryptocurrency trading.",
    },
    portfolio: {
      title: "Trading Portfolio & Analytical Case Studies | Kamal Verma",
      description: "Explore technical analysis case studies, asset class breakdowns, and position sizing frameworks.",
    },
    contact: {
      title: "Contact Kamal Verma | Mentorship & Consultation Desk",
      description: "Reach out to Kamal Verma's desk for 1-on-1 trading mentorship inquiries and market education.",
    },
  },
};

export const DEFAULT_HOME_CONTENT: HomePageContent = {
  heroBadge: "Financial Markets Educator & Trading Mentor",
  heroTitle: "Learn the Markets. Build Your Trading Knowledge.",
  heroSubtitle: "Structured education across stock market, forex, and cryptocurrency trading. Grounded in technical analysis, risk management, and disciplined learning.",
  heroPrimaryCtaText: "Explore Programs",
  heroSecondaryCtaText: "Book Consultation",
  stats: [
    { label: "Stated Experience", value: "6 Years" },
    { label: "People Guided & Taught", value: "1,000+" },
    { label: "Markets Covered", value: "3 Markets" },
    { label: "Risk Management", value: "Stop-Loss Focused" },
  ],
  specialtiesTitle: "Primary Market Coverage",
  specialtiesDesc: "Educational guidance across equities, global foreign exchange, and digital assets.",
  pillarsTitle: "Four Educational Pillars",
  pillarsDesc: "Foundational principles guiding our structured mentorship curriculum.",
  heroImageUrl: "/kamal_verma_portrait_1792055483270.jpg",
};

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  heading: "About Kamal Verma",
  subheading: "Trading Mentor, Financial Markets Educator & Market Analyst",
  bioIntro: EXPERT_INFO.bioIntro,
  experienceYears: 6,
  studentsCount: "1,000+",
  mission: EXPERT_INFO.mission,
  vision: EXPERT_INFO.vision,
  profileImageUrl: "/images/kamal-verma-professional.jpg",
  coreValues: EXPERT_INFO.coreValues,
};

export const DEFAULT_CONTACT_CONTENT: ContactPageContent = {
  heading: "Get in Touch with Kamal Verma's Desk",
  subheading: "Have questions about curriculum, mentorship structure, or market education? Send an inquiry directly to Kamal Verma's desk.",
  phone: "9053216093",
  email: "contact@kamalverma.com",
  responseTime: "Within 24 business hours",
  officeLocation: "Delhi NCR / Haryana, India",
  disclaimerText: "Kamal Verma operates strictly as an educator and mentor. Financial markets involve risk of loss. No guaranteed returns or advisory services are provided.",
};

export const DEFAULT_SERVICES_CMS: ServiceItem[] = SERVICES_LIST.map((svc, idx) => ({
  id: svc.id,
  title: svc.title,
  subtitle: svc.subtitle,
  slug: svc.id,
  description: svc.description,
  scope: svc.scope,
  features: svc.features,
  image: "",
  published: true,
  order: idx,
}));

export const DEFAULT_PORTFOLIO_CMS: PortfolioItem[] = EDUCATIONAL_INSIGHTS.map((item, idx) => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  category: item.category,
  subtitle: item.date,
  summary: item.summary,
  description: item.summary,
  image: "",
  projectUrl: `/portfolio#${item.slug}`,
  tags: item.tags,
  date: item.date,
  readTime: item.readTime,
  content: item.content,
  published: true,
  order: idx,
  featured: idx === 0,
}));

