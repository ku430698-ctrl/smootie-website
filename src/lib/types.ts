export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  tradingCapital: string;
  serviceInterest: string;
  message?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  status: "pending" | "contacted" | "enrolled";
}

export interface Subscriber {
  id?: string;
  email: string;
  subscribedAt: string;
  source?: string;
  active?: boolean;
}

export interface MarketInsight {
  id: string;
  slug: string;
  title: string;
  category: "Index Analysis" | "Swing Trading" | "Options Strategies" | "Trading Psychology";
  date: string;
  readTime: string;
  summary: string;
  keyLevels?: {
    instrument: string;
    trend: "Bullish" | "Bearish" | "Neutral";
    support: string;
    resistance: string;
    invalidation: string;
  };
  tags: string[];
  featured?: boolean;
  content: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramService {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  duration: string;
  batchSize: string;
  level: string;
  price: string;
  originalPrice: string;
  description: string;
  highlights: string[];
  curriculum: {
    week: string;
    topic: string;
    details: string;
  }[];
  popular?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteProfile {
  id?: string;
  name: string;
  title: string;
  experienceYears: number;
  studentsCount: string;
  phone: string;
  email: string;
  markets: string[];
  headline: string;
  bioIntro: string;
  mission: string;
  vision: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  avatarText: string;
  experienceBefore: string;
  pnlHighlight: string;
  quote: string;
  rating: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  scope: string;
  features: string[];
  image?: string;
  published: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  subtitle?: string;
  summary: string;
  description?: string;
  image?: string;
  projectUrl?: string;
  metrics?: { label: string; value: string }[];
  tags: string[];
  date: string;
  readTime?: string;
  content?: string[];
  published: boolean;
  order: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlobalSettings {
  websiteName: string;
  logoText: string;
  logoSubtext: string;
  phone: string;
  email: string;
  whatsapp: string;
  location: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    telegram: string;
    youtube: string;
    instagram: string;
  };
  navItems: { href: string; label: string }[];
  footerText: string;
  seo: {
    home: { title: string; description: string };
    about: { title: string; description: string };
    services: { title: string; description: string };
    portfolio: { title: string; description: string };
    contact: { title: string; description: string };
  };
  updatedAt?: string;
}

export interface HomePageContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCtaText: string;
  heroSecondaryCtaText: string;
  stats: { label: string; value: string }[];
  specialtiesTitle: string;
  specialtiesDesc: string;
  pillarsTitle: string;
  pillarsDesc: string;
  heroImageUrl?: string;
  updatedAt?: string;
}

export interface AboutPageContent {
  heading: string;
  subheading: string;
  bioIntro: string;
  experienceYears: number | string;
  studentsCount: string;
  mission: string;
  vision: string;
  profileImageUrl?: string;
  coreValues: { title: string; desc: string }[];
  updatedAt?: string;
}

export interface ContactPageContent {
  heading: string;
  subheading: string;
  phone: string;
  email: string;
  responseTime: string;
  officeLocation: string;
  disclaimerText: string;
  updatedAt?: string;
}
