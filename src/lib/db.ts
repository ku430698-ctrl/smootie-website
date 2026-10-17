import { getMongoDb, isMongoConnected } from "./mongodb";
import { ObjectId, Filter } from "mongodb";
import {
  Inquiry,
  Subscriber,
  MarketInsight,
  GlobalSettings,
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  ServiceItem,
  PortfolioItem,
} from "./types";
import {
  EDUCATIONAL_INSIGHTS,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_HOME_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_SERVICES_CMS,
  DEFAULT_PORTFOLIO_CMS,
} from "./data";

// In-memory fallback stores (used strictly when MongoDB connection is unreachable)
const fallbackInquiries: Inquiry[] = [
  {
    id: "lead_1",
    name: "Aman Sharma",
    email: "aman.sharma@example.com",
    phone: "9876543210",
    experienceLevel: "beginner",
    tradingCapital: "₹1L - ₹5L",
    serviceInterest: "Comprehensive Trading Mentorship",
    message: "Interested in learning technical analysis and risk management rules for NIFTY options.",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "pending",
  },
  {
    id: "lead_2",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "9811223344",
    experienceLevel: "intermediate",
    tradingCapital: "₹5L - ₹15L",
    serviceInterest: "Technical Analysis Mastery",
    message: "Trading for 2 years in equities, want to master supply & demand zones and multi-timeframe analysis.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "contacted",
  },
  {
    id: "lead_3",
    name: "Rohit Verma",
    email: "rohit.v@example.com",
    phone: "9053210000",
    experienceLevel: "advanced",
    tradingCapital: "₹15L+",
    serviceInterest: "Multi-Market Mentorship",
    message: "Looking for 1-on-1 guidance across both Forex and Indian Indices.",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: "enrolled",
  },
];

const fallbackSubscribers: Subscriber[] = [
  { id: "sub_1", email: "priya.trader@gmail.com", subscribedAt: new Date(Date.now() - 86400000 * 2).toISOString(), source: "homepage_footer" },
  { id: "sub_2", email: "rajesh.invest@yahoo.com", subscribedAt: new Date(Date.now() - 86400000 * 5).toISOString(), source: "portfolio_page" },
  { id: "sub_3", email: "alok.nifty@outlook.com", subscribedAt: new Date(Date.now() - 86400000 * 8).toISOString(), source: "lead_modal" },
];

let fallbackInsights: MarketInsight[] = [...EDUCATIONAL_INSIGHTS];
let fallbackSettings: GlobalSettings = { ...DEFAULT_GLOBAL_SETTINGS };
let fallbackHomeContent: HomePageContent = { ...DEFAULT_HOME_CONTENT };
let fallbackAboutContent: AboutPageContent = { ...DEFAULT_ABOUT_CONTENT };
let fallbackContactContent: ContactPageContent = { ...DEFAULT_CONTACT_CONTENT };
let fallbackServices: ServiceItem[] = [...DEFAULT_SERVICES_CMS];
let fallbackPortfolio: PortfolioItem[] = [...DEFAULT_PORTFOLIO_CMS];

/**
 * Builds a query matching either a MongoDB ObjectId string or a custom string ID.
 */
function buildIdQuery(id: string): Record<string, unknown> {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return { $or: [{ _id: new ObjectId(id) }, { id }] };
  }
  return { id };
}

/**
 * Normalizes a string into a clean URL-friendly slug.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ========================================================================= */
/*                              INQUIRIES (CRM)                             */
/* ========================================================================= */

export async function saveInquiry(inquiryData: Omit<Inquiry, "id" | "createdAt" | "status">): Promise<{
  success: boolean;
  id?: string;
  savedToDb: boolean;
  error?: string;
}> {
  // Server-side validation
  if (!inquiryData.name || inquiryData.name.trim().length < 2) {
    return { success: false, savedToDb: false, error: "Name must be at least 2 characters long." };
  }
  if (!inquiryData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryData.email)) {
    return { success: false, savedToDb: false, error: "Please provide a valid email address." };
  }
  if (!inquiryData.phone || inquiryData.phone.trim().length < 8) {
    return { success: false, savedToDb: false, error: "Please provide a valid phone number." };
  }

  const now = new Date().toISOString();
  const newInquiry: Inquiry = {
    name: inquiryData.name.trim(),
    email: inquiryData.email.trim().toLowerCase(),
    phone: inquiryData.phone.trim(),
    experienceLevel: inquiryData.experienceLevel || "beginner",
    tradingCapital: inquiryData.tradingCapital || "< ₹1 Lakh",
    serviceInterest: inquiryData.serviceInterest || "1-on-1 Trading Mentorship",
    message: inquiryData.message?.trim() || "",
    createdAt: now,
    updatedAt: now,
    status: "pending",
  };

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<Inquiry>("inquiries");
      const result = await collection.insertOne(newInquiry);

      if (result.acknowledged && result.insertedId) {
        return {
          success: true,
          id: result.insertedId.toString(),
          savedToDb: true,
        };
      }
      return { success: false, savedToDb: false, error: "MongoDB did not acknowledge insertion." };
    }
  } catch (error) {
    console.error("MongoDB saveInquiry failure:", (error as Error).message);
    return { success: false, savedToDb: false, error: `Database error: ${(error as Error).message}` };
  }

  // Resilient memory fallback only if MongoDB is completely offline
  const fallbackId = "mem_" + Date.now();
  newInquiry.id = fallbackId;
  fallbackInquiries.unshift(newInquiry);
  return { success: true, id: fallbackId, savedToDb: false };
}

export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<Inquiry>("inquiries");
      const items = await collection.find({}).sort({ createdAt: -1 }).toArray();
      if (items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: (item as unknown as { _id?: { toString(): string } })._id?.toString() || item.id,
        }));
      }
      // If collection is empty but DB is connected, return empty array
      return [];
    }
  } catch (error) {
    console.warn("MongoDB getInquiries warning:", (error as Error).message);
  }

  return [...fallbackInquiries];
}

export async function updateInquiry(
  id: string,
  updates: Partial<Pick<Inquiry, "status" | "notes">>
): Promise<{ success: boolean; message: string; notFound?: boolean }> {
  if (!id) {
    return { success: false, message: "Inquiry ID is required" };
  }

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<Inquiry>("inquiries");
      const query = buildIdQuery(id);
      const res = await collection.updateOne(query, {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });

      if (res.matchedCount > 0) {
        return { success: true, message: "Inquiry updated successfully in MongoDB." };
      }
      return { success: false, notFound: true, message: "Inquiry document not found in MongoDB." };
    }
  } catch (error) {
    console.error("MongoDB updateInquiry error:", (error as Error).message);
    return { success: false, message: `Database error: ${(error as Error).message}` };
  }

  // Memory fallback
  const index = fallbackInquiries.findIndex((i) => i.id === id);
  if (index !== -1) {
    fallbackInquiries[index] = { ...fallbackInquiries[index], ...updates, updatedAt: new Date().toISOString() };
    return { success: true, message: "Inquiry updated (resilient fallback mode)." };
  }
  return { success: false, notFound: true, message: "Inquiry not found in store." };
}

export async function deleteInquiry(id: string): Promise<{ success: boolean; message: string; notFound?: boolean }> {
  if (!id) {
    return { success: false, message: "Inquiry ID is required" };
  }

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<Inquiry>("inquiries");
      const query = buildIdQuery(id);
      const res = await collection.deleteOne(query);

      if (res.deletedCount > 0) {
        return { success: true, message: "Inquiry deleted permanently from MongoDB." };
      }
      return { success: false, notFound: true, message: "Inquiry not found in MongoDB." };
    }
  } catch (error) {
    console.error("MongoDB deleteInquiry error:", (error as Error).message);
    return { success: false, message: `Database error: ${(error as Error).message}` };
  }

  const idx = fallbackInquiries.findIndex((i) => i.id === id);
  if (idx !== -1) {
    fallbackInquiries.splice(idx, 1);
    return { success: true, message: "Inquiry deleted from memory store." };
  }
  return { success: false, notFound: true, message: "Inquiry not found in store." };
}

/* ========================================================================= */
/*                             SUBSCRIBERS                                   */
/* ========================================================================= */

export async function saveSubscriber(
  email: string,
  source = "website"
): Promise<{ success: boolean; message: string; savedToDb: boolean; alreadySubscribed?: boolean; error?: string }> {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      success: false,
      savedToDb: false,
      message: "Please enter a valid email address.",
      error: "Please enter a valid email address.",
    };
  }

  const newSubscriber: Subscriber = {
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    source,
    active: true,
  };

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<Subscriber>("subscribers");
      const existing = await collection.findOne({ email: cleanEmail });

      if (existing) {
        return {
          success: true,
          alreadySubscribed: true,
          savedToDb: true,
          message: "You are already subscribed to Kamal Verma's educational updates!",
        };
      }

      const res = await collection.insertOne(newSubscriber);
      if (res.acknowledged) {
        return {
          success: true,
          savedToDb: true,
          message: "Successfully subscribed to market education updates!",
        };
      }
    }
  } catch (error) {
    console.error("MongoDB saveSubscriber error:", (error as Error).message);
    return {
      success: false,
      savedToDb: false,
      message: (error as Error).message,
      error: (error as Error).message,
    };
  }

  if (fallbackSubscribers.some((s) => s.email === cleanEmail)) {
    return { success: true, alreadySubscribed: true, savedToDb: false, message: "You are already subscribed!" };
  }

  fallbackSubscribers.unshift({ ...newSubscriber, id: "sub_" + Date.now() });
  return { success: true, savedToDb: false, message: "Successfully subscribed to market education updates!" };
}

export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<Subscriber>("subscribers");
      const items = await collection.find({}).sort({ subscribedAt: -1 }).toArray();
      if (items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: (item as unknown as { _id?: { toString(): string } })._id?.toString() || item.id,
        }));
      }
      return [];
    }
  } catch (error) {
    console.warn("MongoDB getSubscribers warning:", (error as Error).message);
  }

  return [...fallbackSubscribers];
}

export async function deleteSubscriber(id: string): Promise<{ success: boolean; message: string; notFound?: boolean }> {
  if (!id) {
    return { success: false, message: "Subscriber ID is required" };
  }

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<Subscriber>("subscribers");
      const query = buildIdQuery(id);
      const res = await collection.deleteOne(query);

      if (res.deletedCount > 0) {
        return { success: true, message: "Subscriber removed from MongoDB." };
      }
      return { success: false, notFound: true, message: "Subscriber not found in MongoDB." };
    }
  } catch (error) {
    console.error("MongoDB deleteSubscriber error:", (error as Error).message);
    return { success: false, message: `Database error: ${(error as Error).message}` };
  }

  const idx = fallbackSubscribers.findIndex((s) => s.id === id);
  if (idx !== -1) {
    fallbackSubscribers.splice(idx, 1);
    return { success: true, message: "Subscriber removed from memory store." };
  }
  return { success: false, notFound: true, message: "Subscriber not found." };
}

/* ========================================================================= */
/*                          MARKET INSIGHTS (CMS)                            */
/* ========================================================================= */

export async function getMarketInsights(category?: string): Promise<MarketInsight[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<MarketInsight>("insights");
      const count = await collection.countDocuments();

      // Bootstrap initial educational insights on fresh database initialization
      if (count === 0) {
        await collection.insertMany(
          EDUCATIONAL_INSIGHTS.map((ins) => ({
            ...ins,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
      }

      const query: Filter<MarketInsight> =
        category && category !== "All"
          ? { category: category as MarketInsight["category"] }
          : {};
      const items = await collection.find(query).sort({ date: -1, createdAt: -1 }).toArray();

      if (items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: (item as unknown as { _id?: { toString(): string } })._id?.toString() || item.id,
        }));
      }
      return [];
    }
  } catch (error) {
    console.warn("MongoDB getMarketInsights warning:", (error as Error).message);
  }

  if (category && category !== "All") {
    return fallbackInsights.filter((i) => i.category === category);
  }
  return fallbackInsights;
}

export async function getMarketInsightBySlug(slug: string): Promise<MarketInsight | null> {
  const cleanSlug = slug?.trim();
  if (!cleanSlug) return null;

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<MarketInsight>("insights");
      const item = await collection.findOne({ slug: cleanSlug });
      if (item) {
        return {
          ...item,
          id: (item as unknown as { _id?: { toString(): string } })._id?.toString() || item.id,
        };
      }
      return null;
    }
  } catch (error) {
    console.warn("MongoDB getMarketInsightBySlug warning:", (error as Error).message);
  }

  return fallbackInsights.find((i) => i.slug === cleanSlug) || null;
}

export async function saveMarketInsight(insightData: {
  id?: string;
  slug?: string;
  title: string;
  category: MarketInsight["category"];
  summary: string;
  content: string[] | string;
  tags?: string[] | string;
  readTime?: string;
  date?: string;
  featured?: boolean;
}): Promise<{
  success: boolean;
  id?: string;
  slug?: string;
  isUpdate?: boolean;
  message: string;
  error?: string;
  conflict?: boolean;
}> {
  // Input validations
  if (!insightData.title || insightData.title.trim().length < 3) {
    return { success: false, message: "Title must be at least 3 characters long.", error: "Title too short" };
  }
  if (!insightData.category) {
    return { success: false, message: "Please select an insight category.", error: "Category required" };
  }
  if (!insightData.summary || insightData.summary.trim().length < 10) {
    return { success: false, message: "Summary must be at least 10 characters long.", error: "Summary too short" };
  }

  const slug = insightData.slug?.trim() || generateSlug(insightData.title);
  if (!slug) {
    return { success: false, message: "Could not generate a valid URL slug.", error: "Invalid slug" };
  }

  const formattedContent = Array.isArray(insightData.content)
    ? insightData.content.map((p) => String(p).trim()).filter(Boolean)
    : String(insightData.content).split("\n\n").map((p) => p.trim()).filter(Boolean);

  if (formattedContent.length === 0) {
    return { success: false, message: "Article content must have at least one paragraph.", error: "Empty content" };
  }

  const formattedTags = Array.isArray(insightData.tags)
    ? insightData.tags.map((t) => String(t).trim()).filter(Boolean)
    : typeof insightData.tags === "string"
    ? insightData.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : ["PriceAction", "TechnicalAnalysis"];

  const now = new Date().toISOString();

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<MarketInsight>("insights");

      // Check for duplicate slug collision on other documents
      if (insightData.id) {
        // Updating existing document: ensure slug is not taken by another document
        const idQuery = buildIdQuery(insightData.id);
        const existingDoc = await collection.findOne(idQuery);
        if (!existingDoc) {
          return { success: false, message: "Insight article not found to update.", error: "Not found" };
        }

        const slugCollision = await collection.findOne({
          slug,
          _id: { $ne: existingDoc._id },
        });

        if (slugCollision) {
          return {
            success: false,
            conflict: true,
            message: `An article with the slug "${slug}" already exists. Please choose a unique title.`,
            error: "Duplicate slug",
          };
        }

        const updateResult = await collection.updateOne(idQuery, {
          $set: {
            title: insightData.title.trim(),
            slug,
            category: insightData.category,
            summary: insightData.summary.trim(),
            content: formattedContent,
            tags: formattedTags,
            readTime: insightData.readTime || "4 min read",
            date: insightData.date || now.split("T")[0],
            featured: Boolean(insightData.featured),
            updatedAt: now,
          },
        });

        if (updateResult.acknowledged) {
          return {
            success: true,
            id: insightData.id,
            slug,
            isUpdate: true,
            message: "Insight article updated successfully in MongoDB.",
          };
        }
      } else {
        // Creating new document: ensure slug is globally unique
        const slugCollision = await collection.findOne({ slug });
        if (slugCollision) {
          return {
            success: false,
            conflict: true,
            message: `An article with the slug "${slug}" already exists. Please choose a unique title.`,
            error: "Duplicate slug",
          };
        }

        const insertResult = await collection.insertOne({
          id: "insight_" + Date.now(),
          slug,
          title: insightData.title.trim(),
          category: insightData.category,
          summary: insightData.summary.trim(),
          content: formattedContent,
          tags: formattedTags,
          readTime: insightData.readTime || "4 min read",
          date: insightData.date || now.split("T")[0],
          featured: Boolean(insightData.featured),
          createdAt: now,
          updatedAt: now,
        });

        if (insertResult.acknowledged && insertResult.insertedId) {
          return {
            success: true,
            id: insertResult.insertedId.toString(),
            slug,
            isUpdate: false,
            message: "Insight article created successfully in MongoDB.",
          };
        }
      }
    }
  } catch (error) {
    console.error("MongoDB saveMarketInsight error:", (error as Error).message);
    return { success: false, message: `Database error: ${(error as Error).message}`, error: (error as Error).message };
  }

  // Resilient memory fallback
  const fallbackDocId = insightData.id || "insight_" + Date.now();
  const existingIdx = fallbackInsights.findIndex((i) => i.id === fallbackDocId);
  const fullDoc: MarketInsight = {
    id: fallbackDocId,
    slug,
    title: insightData.title.trim(),
    category: insightData.category,
    summary: insightData.summary.trim(),
    content: formattedContent,
    tags: formattedTags,
    readTime: insightData.readTime || "4 min read",
    date: insightData.date || now.split("T")[0],
    featured: Boolean(insightData.featured),
    createdAt: now,
    updatedAt: now,
  };

  if (existingIdx !== -1) {
    fallbackInsights[existingIdx] = fullDoc;
    return { success: true, id: fallbackDocId, slug, isUpdate: true, message: "Insight updated (fallback mode)." };
  } else {
    fallbackInsights.unshift(fullDoc);
    return { success: true, id: fallbackDocId, slug, isUpdate: false, message: "Insight created (fallback mode)." };
  }
}

export async function deleteMarketInsight(id: string): Promise<{ success: boolean; message: string; notFound?: boolean }> {
  if (!id) {
    return { success: false, message: "Insight ID is required" };
  }

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<MarketInsight>("insights");
      const query = buildIdQuery(id);
      const res = await collection.deleteOne(query);

      if (res.deletedCount > 0) {
        return { success: true, message: "Insight article deleted permanently from MongoDB." };
      }
      return { success: false, notFound: true, message: "Insight not found in MongoDB." };
    }
  } catch (error) {
    console.error("MongoDB deleteMarketInsight error:", (error as Error).message);
    return { success: false, message: `Database error: ${(error as Error).message}` };
  }

  const idx = fallbackInsights.findIndex((i) => i.id === id);
  if (idx !== -1) {
    fallbackInsights.splice(idx, 1);
    return { success: true, message: "Insight deleted from memory store." };
  }
  return { success: false, notFound: true, message: "Insight not found in store." };
}

/* ========================================================================= */
/*                          ADMIN OVERVIEW STATS                             */
/* ========================================================================= */

export async function getAdminStats() {
  const isConnected = await isMongoConnected();

  if (isConnected) {
    try {
      const db = await getMongoDb();
      if (db) {
        const [totalInquiries, pendingInquiries, contactedInquiries, enrolledInquiries, totalSubscribers, totalInsights] =
          await Promise.all([
            db.collection("inquiries").countDocuments(),
            db.collection("inquiries").countDocuments({ status: "pending" }),
            db.collection("inquiries").countDocuments({ status: "contacted" }),
            db.collection("inquiries").countDocuments({ status: "enrolled" }),
            db.collection("subscribers").countDocuments(),
            db.collection("insights").countDocuments(),
          ]);

        return {
          totalInquiries,
          pendingInquiries,
          contactedInquiries,
          enrolledInquiries,
          totalSubscribers,
          totalInsights,
          isMongo: true,
        };
      }
    } catch (err) {
      console.warn("MongoDB getAdminStats warning:", (err as Error).message);
    }
  }

  const inquiries = fallbackInquiries;
  const subscribers = fallbackSubscribers;
  const insights = fallbackInsights;

  return {
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter((i) => i.status === "pending").length,
    contactedInquiries: inquiries.filter((i) => i.status === "contacted").length,
    enrolledInquiries: inquiries.filter((i) => i.status === "enrolled").length,
    totalSubscribers: subscribers.length,
    totalInsights: insights.length,
    isMongo: false,
  };
}

/* ========================================================================= */
/*                          GLOBAL SITE SETTINGS                             */
/* ========================================================================= */

export async function getSiteSettings(): Promise<GlobalSettings> {
  try {
    const db = await getMongoDb();
    if (db) {
      const doc = await db.collection("settings").findOne({ id: "global_settings" });
      if (doc) {
        const { _id, ...clean } = doc as any;
        return {
          ...DEFAULT_GLOBAL_SETTINGS,
          ...clean,
          seo: { ...DEFAULT_GLOBAL_SETTINGS.seo, ...(clean.seo || {}) },
          socialLinks: { ...DEFAULT_GLOBAL_SETTINGS.socialLinks, ...(clean.socialLinks || {}) },
        };
      }
    }
  } catch (err) {
    console.warn("MongoDB getSiteSettings warning:", (err as Error).message);
  }
  return fallbackSettings;
}

export async function saveSiteSettings(
  settings: Partial<GlobalSettings>
): Promise<{ success: boolean; message?: string; data?: GlobalSettings; error?: string }> {
  if (settings.websiteName !== undefined && settings.websiteName.trim().length < 2) {
    return { success: false, error: "Website name must be at least 2 characters." };
  }
  if (settings.phone !== undefined && settings.phone.trim().length < 8) {
    return { success: false, error: "Contact phone number must be at least 8 digits." };
  }

  const updated: GlobalSettings = {
    ...fallbackSettings,
    ...settings,
    seo: { ...fallbackSettings.seo, ...(settings.seo || {}) },
    socialLinks: { ...fallbackSettings.socialLinks, ...(settings.socialLinks || {}) },
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection("settings").updateOne(
        { id: "global_settings" },
        { $set: { ...updated, id: "global_settings" } },
        { upsert: true }
      );
      fallbackSettings = updated;
      return { success: true, message: "Settings saved permanently to MongoDB.", data: updated };
    }
  } catch (err) {
    console.error("MongoDB saveSiteSettings error:", (err as Error).message);
    return { success: false, error: `Database error: ${(err as Error).message}` };
  }

  fallbackSettings = updated;
  return { success: true, message: "Settings saved to in-memory store (MongoDB offline).", data: updated };
}

/* ========================================================================= */
/*                         PAGE CONTENT MANAGEMENT                           */
/* ========================================================================= */

export async function getPageContent(page: "home" | "about" | "contact"): Promise<any> {
  try {
    const db = await getMongoDb();
    if (db) {
      const doc = await db.collection("page_content").findOne({ page });
      if (doc) {
        const { _id, page: _, ...clean } = doc as any;
        if (page === "home") return { ...DEFAULT_HOME_CONTENT, ...clean };
        if (page === "about") return { ...DEFAULT_ABOUT_CONTENT, ...clean };
        if (page === "contact") return { ...DEFAULT_CONTACT_CONTENT, ...clean };
      }
    }
  } catch (err) {
    console.warn(`MongoDB getPageContent(${page}) warning:`, (err as Error).message);
  }

  if (page === "home") return fallbackHomeContent;
  if (page === "about") return fallbackAboutContent;
  return fallbackContactContent;
}

export async function savePageContent(
  page: "home" | "about" | "contact",
  data: any
): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
  const payload = {
    ...data,
    page,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection("page_content").updateOne(
        { page },
        { $set: payload },
        { upsert: true }
      );
      if (page === "home") fallbackHomeContent = { ...fallbackHomeContent, ...payload };
      if (page === "about") fallbackAboutContent = { ...fallbackAboutContent, ...payload };
      if (page === "contact") fallbackContactContent = { ...fallbackContactContent, ...payload };
      return { success: true, message: `${page.toUpperCase()} page content saved to MongoDB.`, data: payload };
    }
  } catch (err) {
    console.error(`MongoDB savePageContent(${page}) error:`, (err as Error).message);
    return { success: false, error: `Database error: ${(err as Error).message}` };
  }

  if (page === "home") fallbackHomeContent = { ...fallbackHomeContent, ...payload };
  if (page === "about") fallbackAboutContent = { ...fallbackAboutContent, ...payload };
  if (page === "contact") fallbackContactContent = { ...fallbackContactContent, ...payload };
  return { success: true, message: `${page.toUpperCase()} page saved (resilient fallback mode).`, data: payload };
}

/* ========================================================================= */
/*                             SERVICES (CMS)                                */
/* ========================================================================= */

export async function getServicesCMS(includeUnpublished = false): Promise<ServiceItem[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<ServiceItem>("services");
      const count = await collection.countDocuments();
      if (count === 0) {
        await collection.insertMany(
          DEFAULT_SERVICES_CMS.map((s, idx) => ({
            ...s,
            order: idx,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
      }

      const query: Filter<ServiceItem> = includeUnpublished ? {} : { published: { $ne: false } };
      const items = await collection.find(query).sort({ order: 1, createdAt: 1 }).toArray();
      if (items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: (item as any)._id?.toString() || item.id,
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB getServicesCMS warning:", (err as Error).message);
  }

  return fallbackServices.filter((s) => includeUnpublished || s.published !== false);
}

export async function saveServiceCMS(
  svcData: Partial<ServiceItem>
): Promise<{ success: boolean; message?: string; id?: string; error?: string }> {
  const existingId = svcData.id;

  if (!existingId) {
    if (!svcData.title || svcData.title.trim().length < 2) {
      return { success: false, error: "Service title must be at least 2 characters." };
    }
    if (!svcData.description || svcData.description.trim().length < 5) {
      return { success: false, error: "Service description must be at least 5 characters." };
    }
  } else {
    if (svcData.title !== undefined && svcData.title.trim().length < 2) {
      return { success: false, error: "Service title must be at least 2 characters." };
    }
    if (svcData.description !== undefined && svcData.description.trim().length < 5) {
      return { success: false, error: "Service description must be at least 5 characters." };
    }
  }

  const slug = svcData.slug?.trim()
    ? generateSlug(svcData.slug)
    : svcData.title
    ? generateSlug(svcData.title)
    : undefined;

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection("services");

      if (existingId) {
        const query = buildIdQuery(existingId);
        const setDoc: Record<string, any> = { updatedAt: new Date().toISOString() };
        if (svcData.title !== undefined) setDoc.title = svcData.title.trim();
        if (svcData.subtitle !== undefined) setDoc.subtitle = svcData.subtitle.trim();
        if (slug !== undefined) setDoc.slug = slug;
        if (svcData.description !== undefined) setDoc.description = svcData.description.trim();
        if (svcData.scope !== undefined) setDoc.scope = svcData.scope.trim();
        if (svcData.features !== undefined) setDoc.features = Array.isArray(svcData.features) ? svcData.features : [];
        if (svcData.image !== undefined) setDoc.image = svcData.image;
        if (svcData.published !== undefined) setDoc.published = Boolean(svcData.published);
        if (svcData.order !== undefined) setDoc.order = Number(svcData.order);

        const res = await collection.updateOne(query, { $set: setDoc });

        if (res.matchedCount > 0) {
          return { success: true, message: "Service updated in MongoDB.", id: existingId };
        }
      }

      if (!slug) {
        return { success: false, error: "Title or slug is required to create a service." };
      }

      // Check unique slug on create
      const duplicate = await collection.findOne({ slug });
      if (duplicate) {
        return { success: false, error: "A service with this title or slug already exists." };
      }

      const count = await collection.countDocuments();
      const newService: ServiceItem = {
        id: "svc_" + Date.now(),
        title: (svcData.title || "").trim(),
        subtitle: (svcData.subtitle || "").trim(),
        slug,
        description: (svcData.description || "").trim(),
        scope: (svcData.scope || "").trim(),
        features: Array.isArray(svcData.features) ? svcData.features : [],
        image: svcData.image || "",
        published: svcData.published ?? true,
        order: svcData.order ?? count,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const insertRes = await collection.insertOne(newService as any);
      return {
        success: true,
        message: "Service published to MongoDB.",
        id: insertRes.insertedId.toString(),
      };
    }
  } catch (err) {
    console.error("MongoDB saveServiceCMS error:", (err as Error).message);
    return { success: false, error: `Database error: ${(err as Error).message}` };
  }

  // Fallback in-memory
  if (existingId) {
    const idx = fallbackServices.findIndex((s) => s.id === existingId);
    if (idx !== -1) {
      fallbackServices[idx] = {
        ...fallbackServices[idx],
        ...svcData,
        ...(slug ? { slug } : {}),
        updatedAt: new Date().toISOString(),
      } as ServiceItem;
      return { success: true, message: "Service updated in fallback store.", id: existingId };
    }
  }

  const newId = "svc_" + Date.now();
  fallbackServices.push({
    id: newId,
    title: (svcData.title || "").trim(),
    subtitle: (svcData.subtitle || "").trim(),
    slug: slug || "service-" + Date.now(),
    description: (svcData.description || "").trim(),
    scope: (svcData.scope || "").trim(),
    features: Array.isArray(svcData.features) ? svcData.features : [],
    image: svcData.image || "",
    published: svcData.published ?? true,
    order: fallbackServices.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { success: true, message: "Service created in fallback store.", id: newId };
}

export async function deleteServiceCMS(id: string): Promise<{ success: boolean; message: string; notFound?: boolean }> {
  if (!id) return { success: false, message: "Service ID is required" };

  try {
    const db = await getMongoDb();
    if (db) {
      const res = await db.collection("services").deleteOne(buildIdQuery(id));
      if (res.deletedCount > 0) {
        return { success: true, message: "Service deleted permanently from MongoDB." };
      }
      return { success: false, notFound: true, message: "Service not found in database." };
    }
  } catch (err) {
    console.error("MongoDB deleteServiceCMS error:", (err as Error).message);
    return { success: false, message: `Database error: ${(err as Error).message}` };
  }

  const idx = fallbackServices.findIndex((s) => s.id === id);
  if (idx !== -1) {
    fallbackServices.splice(idx, 1);
    return { success: true, message: "Service deleted from store." };
  }
  return { success: false, notFound: true, message: "Service not found." };
}

export async function reorderServicesCMS(orderedIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection("services");
      const ops = orderedIds.map((id, index) =>
        collection.updateOne(buildIdQuery(id), { $set: { order: index, updatedAt: new Date().toISOString() } })
      );
      await Promise.all(ops);
    }
  } catch (err) {
    console.warn("MongoDB reorderServicesCMS warning:", (err as Error).message);
  }

  // Update in-memory fallback
  fallbackServices.sort((a, b) => {
    const indexA = orderedIds.indexOf(a.id);
    const indexB = orderedIds.indexOf(b.id);
    if (indexA === -1 || indexB === -1) return 0;
    return indexA - indexB;
  });
  fallbackServices.forEach((s, idx) => (s.order = idx));

  return { success: true, message: "Services reordered successfully." };
}

/* ========================================================================= */
/*                            PORTFOLIO (CMS)                                */
/* ========================================================================= */

export async function getPortfolioCMS(
  includeUnpublished = false,
  category?: string
): Promise<PortfolioItem[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<PortfolioItem>("portfolio");
      const count = await collection.countDocuments();
      if (count === 0) {
        await collection.insertMany(
          DEFAULT_PORTFOLIO_CMS.map((p, idx) => ({
            ...p,
            order: idx,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
      }

      const query: Filter<PortfolioItem> = {
        ...(includeUnpublished ? {} : { published: { $ne: false } }),
        ...(category && category !== "All" ? { category } : {}),
      };

      const items = await collection.find(query).sort({ order: 1, date: -1 }).toArray();
      if (items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: (item as any)._id?.toString() || item.id,
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB getPortfolioCMS warning:", (err as Error).message);
  }

  return fallbackPortfolio
    .filter((p) => (includeUnpublished || p.published !== false) && (!category || category === "All" || p.category === category))
    .sort((a, b) => a.order - b.order);
}

export async function savePortfolioCMS(
  itemData: Partial<PortfolioItem>
): Promise<{ success: boolean; message?: string; id?: string; error?: string; conflict?: boolean }> {
  const existingId = itemData.id;

  if (!existingId) {
    if (!itemData.title || itemData.title.trim().length < 3) {
      return { success: false, error: "Title must be at least 3 characters." };
    }
    if (!itemData.summary || itemData.summary.trim().length < 5) {
      return { success: false, error: "Summary must be at least 5 characters." };
    }
  } else {
    if (itemData.title !== undefined && itemData.title.trim().length < 3) {
      return { success: false, error: "Title must be at least 3 characters." };
    }
    if (itemData.summary !== undefined && itemData.summary.trim().length < 5) {
      return { success: false, error: "Summary must be at least 5 characters." };
    }
  }

  const slug = itemData.slug?.trim()
    ? generateSlug(itemData.slug)
    : itemData.title
    ? generateSlug(itemData.title)
    : undefined;

  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection("portfolio");

      if (existingId) {
        const query = buildIdQuery(existingId);
        const setDoc: Record<string, any> = { updatedAt: new Date().toISOString() };
        if (itemData.title !== undefined) setDoc.title = itemData.title.trim();
        if (slug !== undefined) setDoc.slug = slug;
        if (itemData.category !== undefined) setDoc.category = itemData.category;
        if (itemData.subtitle !== undefined) setDoc.subtitle = itemData.subtitle;
        if (itemData.summary !== undefined) setDoc.summary = itemData.summary.trim();
        if (itemData.description !== undefined) setDoc.description = itemData.description;
        if (itemData.image !== undefined) setDoc.image = itemData.image;
        if (itemData.projectUrl !== undefined) setDoc.projectUrl = itemData.projectUrl;
        if (itemData.metrics !== undefined) setDoc.metrics = Array.isArray(itemData.metrics) ? itemData.metrics : [];
        if (itemData.tags !== undefined) setDoc.tags = Array.isArray(itemData.tags) ? itemData.tags : [];
        if (itemData.date !== undefined) setDoc.date = itemData.date;
        if (itemData.readTime !== undefined) setDoc.readTime = itemData.readTime;
        if (itemData.content !== undefined) setDoc.content = Array.isArray(itemData.content) ? itemData.content : [];
        if (itemData.published !== undefined) setDoc.published = Boolean(itemData.published);
        if (itemData.featured !== undefined) setDoc.featured = Boolean(itemData.featured);
        if (itemData.order !== undefined) setDoc.order = Number(itemData.order);

        const res = await collection.updateOne(query, { $set: setDoc });

        if (res.matchedCount > 0) {
          return { success: true, message: "Portfolio item updated in MongoDB.", id: existingId };
        }
      }

      if (!slug) {
        return { success: false, error: "Title or slug is required to create a portfolio item." };
      }

      // Check duplicate slug on create
      const duplicate = await collection.findOne({ slug });
      if (duplicate) {
        return { success: false, conflict: true, error: "A portfolio item with this title or slug already exists." };
      }

      const count = await collection.countDocuments();
      const newItem: PortfolioItem = {
        id: "port_" + Date.now(),
        title: (itemData.title || "").trim(),
        slug,
        category: itemData.category || "Index Analysis",
        subtitle: itemData.subtitle || itemData.date || "Case Study",
        summary: (itemData.summary || "").trim(),
        description: itemData.description || (itemData.summary || "").trim(),
        image: itemData.image || "",
        projectUrl: itemData.projectUrl || "",
        metrics: Array.isArray(itemData.metrics) ? itemData.metrics : [],
        tags: Array.isArray(itemData.tags) ? itemData.tags : [],
        date: itemData.date || "Educational Guide",
        readTime: itemData.readTime || "5 min read",
        content: Array.isArray(itemData.content) ? itemData.content : [],
        published: itemData.published ?? true,
        featured: itemData.featured ?? false,
        order: itemData.order ?? count,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const insertRes = await collection.insertOne(newItem as any);
      return {
        success: true,
        message: "Portfolio item published to MongoDB.",
        id: insertRes.insertedId.toString(),
      };
    }
  } catch (err) {
    console.error("MongoDB savePortfolioCMS error:", (err as Error).message);
    return { success: false, error: `Database error: ${(err as Error).message}` };
  }

  // Fallback in-memory
  if (existingId) {
    const idx = fallbackPortfolio.findIndex((p) => p.id === existingId);
    if (idx !== -1) {
      fallbackPortfolio[idx] = {
        ...fallbackPortfolio[idx],
        ...itemData,
        ...(slug ? { slug } : {}),
        updatedAt: new Date().toISOString(),
      } as PortfolioItem;
      return { success: true, message: "Portfolio item updated in fallback store.", id: existingId };
    }
  }

  const newId = "port_" + Date.now();
  fallbackPortfolio.push({
    id: newId,
    title: (itemData.title || "").trim(),
    slug: slug || "port-" + Date.now(),
    category: itemData.category || "Index Analysis",
    subtitle: itemData.subtitle || itemData.date || "Case Study",
    summary: (itemData.summary || "").trim(),
    description: itemData.description || (itemData.summary || "").trim(),
    image: itemData.image || "",
    projectUrl: itemData.projectUrl || "",
    metrics: Array.isArray(itemData.metrics) ? itemData.metrics : [],
    tags: Array.isArray(itemData.tags) ? itemData.tags : [],
    date: itemData.date || "Educational Guide",
    readTime: itemData.readTime || "5 min read",
    content: Array.isArray(itemData.content) ? itemData.content : [],
    published: itemData.published ?? true,
    featured: itemData.featured ?? false,
    order: fallbackPortfolio.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { success: true, message: "Portfolio item created in fallback store.", id: newId };
}

export async function deletePortfolioCMS(id: string): Promise<{ success: boolean; message: string; notFound?: boolean }> {
  if (!id) return { success: false, message: "Portfolio item ID is required" };

  try {
    const db = await getMongoDb();
    if (db) {
      const res = await db.collection("portfolio").deleteOne(buildIdQuery(id));
      if (res.deletedCount > 0) {
        return { success: true, message: "Portfolio item deleted from MongoDB." };
      }
      return { success: false, notFound: true, message: "Item not found in MongoDB." };
    }
  } catch (err) {
    console.error("MongoDB deletePortfolioCMS error:", (err as Error).message);
    return { success: false, message: `Database error: ${(err as Error).message}` };
  }

  const idx = fallbackPortfolio.findIndex((p) => p.id === id);
  if (idx !== -1) {
    fallbackPortfolio.splice(idx, 1);
    return { success: true, message: "Portfolio item deleted from store." };
  }
  return { success: false, notFound: true, message: "Portfolio item not found." };
}

export async function reorderPortfolioCMS(orderedIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection("portfolio");
      const ops = orderedIds.map((id, index) =>
        collection.updateOne(buildIdQuery(id), { $set: { order: index, updatedAt: new Date().toISOString() } })
      );
      await Promise.all(ops);
    }
  } catch (err) {
    console.warn("MongoDB reorderPortfolioCMS warning:", (err as Error).message);
  }

  // Update in-memory fallback
  fallbackPortfolio.sort((a, b) => {
    const indexA = orderedIds.indexOf(a.id);
    const indexB = orderedIds.indexOf(b.id);
    if (indexA === -1 || indexB === -1) return 0;
    return indexA - indexB;
  });
  fallbackPortfolio.forEach((p, idx) => (p.order = idx));

  return { success: true, message: "Portfolio items reordered successfully." };
}

