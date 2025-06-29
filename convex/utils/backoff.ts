// Backoff utility functions for intelligent error handling

// Error severity weights (higher = more severe)
export const ERROR_SEVERITY_WEIGHTS = {
  // Network/connectivity errors (temporary, might resolve quickly)
  fetch_failed: 1,
  timeout: 1,
  network_error: 1,

  // Rate limiting (temporary but indicates we're hitting limits)
  rate_limited: 2,
  too_many_requests: 2,

  // Parsing/content errors (might indicate site changes)
  parse_error: 3,
  scraping_failed: 3,
  job_fetch_failed: 2,
  job_details_failed: 2,

  // Authentication/access errors (more serious)
  unauthorized: 4,
  forbidden: 4,
  blocked: 5,

  // Server errors (could be temporary or permanent)
  server_error: 3,
  service_unavailable: 2,

  // Default for unknown error types
  unknown: 2,
} as const;

// Backoff configuration
export const BACKOFF_CONFIG = {
  // Base delay for each backoff level (in milliseconds)
  BASE_DELAYS: [
    0, // Level 0: No backoff
    5 * 60 * 1000, // Level 1: 5 minutes
    30 * 60 * 1000, // Level 2: 30 minutes
    2 * 60 * 60 * 1000, // Level 3: 2 hours
    6 * 60 * 60 * 1000, // Level 4: 6 hours
    24 * 60 * 60 * 1000, // Level 5: 24 hours
    72 * 60 * 60 * 1000, // Level 6: 3 days
    7 * 24 * 60 * 60 * 1000, // Level 7: 1 week
  ],

  // Maximum backoff level
  MAX_LEVEL: 7,

  // Minimum consecutive failures to trigger backoff
  MIN_FAILURES_FOR_BACKOFF: 3,

  // How many successful scrapes needed to reduce backoff level
  SUCCESSES_TO_REDUCE_LEVEL: 2,

  // Maximum total failures before permanent backoff
  MAX_TOTAL_FAILURES: 50,

  // Time window for considering failures "recent" (24 hours)
  RECENT_FAILURE_WINDOW: 24 * 60 * 60 * 1000,
} as const;

export interface BackoffInfo {
  level: number;
  nextAllowedScrape: number;
  consecutiveFailures: number;
  lastSuccessfulScrape?: number;
  totalFailures: number;
}

export interface ErrorInfo {
  timestamp: number;
  errorType: string;
  errorMessage: string;
  url?: string;
}

/**
 * Calculate the severity score for a list of recent errors
 */
export function calculateErrorSeverity(errors: ErrorInfo[]): number {
  return errors.reduce((total, error) => {
    const weight =
      ERROR_SEVERITY_WEIGHTS[
        error.errorType as keyof typeof ERROR_SEVERITY_WEIGHTS
      ] || ERROR_SEVERITY_WEIGHTS.unknown;
    return total + weight;
  }, 0);
}

/**
 * Determine if a company should be skipped based on backoff info
 */
export function shouldSkipDueToBackoff(backoffInfo?: BackoffInfo): boolean {
  if (!backoffInfo) return false;

  const now = Date.now();

  // Check if we're in a permanent backoff state
  if (backoffInfo.totalFailures >= BACKOFF_CONFIG.MAX_TOTAL_FAILURES) {
    console.log(
      `Company in permanent backoff due to ${backoffInfo.totalFailures} total failures`,
    );
    return true;
  }

  // Check if we're still in the backoff period
  if (now < backoffInfo.nextAllowedScrape) {
    const remainingMs = backoffInfo.nextAllowedScrape - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    console.log(
      `Company in backoff for ${remainingMinutes} more minutes (level ${backoffInfo.level})`,
    );
    return true;
  }

  return false;
}

/**
 * Calculate new backoff info after a failure
 */
export function calculateBackoffAfterFailure(
  currentBackoff: BackoffInfo | undefined,
  errorType: string,
  recentErrors: ErrorInfo[],
): BackoffInfo {
  const now = Date.now();

  // Initialize backoff info if it doesn't exist
  if (!currentBackoff) {
    currentBackoff = {
      level: 0,
      nextAllowedScrape: now,
      consecutiveFailures: 0,
      totalFailures: 0,
    };
  }

  const newConsecutiveFailures = currentBackoff.consecutiveFailures + 1;
  const newTotalFailures = currentBackoff.totalFailures + 1;

  // Calculate error severity for recent errors
  const recentErrorSeverity = calculateErrorSeverity(recentErrors);

  // Determine if we should increase backoff level
  let newLevel = currentBackoff.level;

  if (newConsecutiveFailures >= BACKOFF_CONFIG.MIN_FAILURES_FOR_BACKOFF) {
    // Increase level based on consecutive failures and error severity
    const severityMultiplier = Math.max(1, Math.floor(recentErrorSeverity / 5));
    const levelIncrease = Math.min(2, severityMultiplier);

    newLevel = Math.min(
      BACKOFF_CONFIG.MAX_LEVEL,
      currentBackoff.level + levelIncrease,
    );
  }

  // Calculate next allowed scrape time
  const baseDelay =
    BACKOFF_CONFIG.BASE_DELAYS[newLevel] ||
    BACKOFF_CONFIG.BASE_DELAYS[BACKOFF_CONFIG.MAX_LEVEL];

  // Add jitter to prevent thundering herd (±20%)
  const jitter = baseDelay * 0.2 * (Math.random() - 0.5);
  const nextAllowedScrape = now + baseDelay + jitter;

  console.log(
    `Backoff updated: level ${currentBackoff.level} → ${newLevel}, ` +
      `consecutive failures: ${newConsecutiveFailures}, ` +
      `next scrape in ${Math.ceil(baseDelay / (60 * 1000))} minutes`,
  );

  return {
    level: newLevel,
    nextAllowedScrape,
    consecutiveFailures: newConsecutiveFailures,
    lastSuccessfulScrape: currentBackoff.lastSuccessfulScrape,
    totalFailures: newTotalFailures,
  };
}

/**
 * Calculate new backoff info after a successful scrape
 */
export function calculateBackoffAfterSuccess(
  currentBackoff: BackoffInfo | undefined,
): BackoffInfo {
  const now = Date.now();

  if (!currentBackoff) {
    return {
      level: 0,
      nextAllowedScrape: now,
      consecutiveFailures: 0,
      lastSuccessfulScrape: now,
      totalFailures: 0,
    };
  }

  // Reset consecutive failures
  let newLevel = currentBackoff.level;

  // Reduce backoff level if we've had enough successes
  if (currentBackoff.level > 0) {
    // For now, any success reduces the level by 1
    // In the future, we could track consecutive successes
    newLevel = Math.max(0, currentBackoff.level - 1);
  }

  console.log(
    `Backoff reduced after success: level ${currentBackoff.level} → ${newLevel}, ` +
      `consecutive failures reset to 0`,
  );

  return {
    level: newLevel,
    nextAllowedScrape: now,
    consecutiveFailures: 0,
    lastSuccessfulScrape: now,
    totalFailures: currentBackoff.totalFailures,
  };
}

/**
 * Get a human-readable description of the current backoff status
 */
export function getBackoffStatusDescription(backoffInfo?: BackoffInfo): string {
  if (!backoffInfo || backoffInfo.level === 0) {
    return "No backoff - scraping normally";
  }

  const now = Date.now();

  if (backoffInfo.totalFailures >= BACKOFF_CONFIG.MAX_TOTAL_FAILURES) {
    return "Permanent backoff due to excessive failures";
  }

  if (now < backoffInfo.nextAllowedScrape) {
    const remainingMs = backoffInfo.nextAllowedScrape - now;
    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

    if (remainingHours >= 2) {
      return `Backoff level ${backoffInfo.level} - ${remainingHours} hours remaining`;
    } else {
      return `Backoff level ${backoffInfo.level} - ${remainingMinutes} minutes remaining`;
    }
  }

  return `Backoff level ${backoffInfo.level} - ready for next attempt`;
}
