/**
 * Security and sanitization utilities
 */

/**
 * Validates that an identifier is safe for database lookups and queries.
 * Prevents NoSQL object injections like {$gt: ""} or malicious string patterns.
 */
export function isValidId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return false;
  // Alphanumeric, underscores, hyphens only
  return /^[a-zA-Z0-9_\-]+$/.test(trimmed);
}

/**
 * Strips internal secrets, credentials, URIs, and stack traces from error messages
 * before returning them in client responses.
 */
export function sanitizeErrorMessage(
  err: unknown,
  fallback = "A server error occurred while processing the request."
): string {
  if (!err) return fallback;
  const rawMessage = typeof err === "string" ? err : (err as Error).message || "";

  // Strip MongoDB URIs with credentials
  let safe = rawMessage.replace(/mongodb(\+srv)?:\/\/[^\s@]+@[^\s/]+/gi, "[REDACTED_DB_URI]");
  // Strip password patterns
  safe = safe.replace(/password[:=]\s*[^\s,]+/gi, "password=[REDACTED]");
  // Strip Windows and Unix absolute system paths
  safe = safe.replace(/[A-Z]:\\[^:\n]+/gi, "[SYSTEM_PATH]");
  safe = safe.replace(/\/home\/[^\s\n]+/gi, "[SYSTEM_PATH]");
  // Strip stack trace indicators
  safe = safe.replace(/\sat\s.+/gi, "");

  // If the message contains connection failure details, return a safe message
  if (
    safe.includes("querySrv") ||
    safe.includes("ETIMEDOUT") ||
    safe.includes("ENOTFOUND") ||
    safe.includes("TopologyDescription") ||
    safe.includes("MongoServerError")
  ) {
    return "Database service temporarily unavailable. Operational fallback in place.";
  }

  const trimmed = safe.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Deeply sanitizes an incoming JSON object by stripping any keys starting with "$"
 * to prevent NoSQL operator injection.
 */
export function sanitizePayload<T>(input: T): T {
  if (!input || typeof input !== "object") return input;

  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item)) as unknown as T;
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(input as Record<string, any>)) {
    if (key.startsWith("$")) {
      continue; // Block MongoDB operators
    }
    if (typeof value === "object" && value !== null) {
      clean[key] = sanitizePayload(value);
    } else if (typeof value === "string") {
      clean[key] = value.trim();
    } else {
      clean[key] = value;
    }
  }

  return clean as T;
}
